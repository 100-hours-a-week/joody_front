function h(type, props = {}, ...children) {
  return { type, props, children };
}

function createDom(node) {
  if (node == null) return document.createTextNode("");
  if (typeof node === "string" || typeof node === "number") {
    return document.createTextNode(String(node));
  }

  const el = document.createElement(node.type);
  const props = node.props || {};

  Object.keys(props).forEach((k) => {
    const v = props[k];
    if (k.startsWith("on") && typeof v === "function") {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "value") {
      el.value = v;
    } else if (k === "className") {
      el.setAttribute("class", v);
    } else if (k === "disabled") {
      el.disabled = !!v;
    } else if (k === "style" && typeof v === "object") {
      Object.assign(el.style, v);
    } else if (v != null) {
      el.setAttribute(k, v);
    }
  });

  (node.children || []).forEach((c) => el.appendChild(createDom(c)));
  return el;
}

function changed(a, b) {
  if (a == null || b == null) return a !== b;
  if (typeof a !== typeof b) return true;
  if (typeof a === "string" || typeof a === "number") return a !== b;
  return a.type !== b.type;
}

function patchProps(el, newProps, oldProps) {
  // 제거
  Object.keys(oldProps).forEach((k) => {
    if (!(k in newProps)) {
      if (k.startsWith("on")) {
        el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k]);
      } else if (k === "value") {
        el.value = "";
      } else if (k === "className") {
        el.removeAttribute("class");
      } else if (k === "style") {
        el.removeAttribute("style");
      } else if (k === "disabled") {
        el.disabled = false;
      } else {
        el.removeAttribute(k);
      }
    }
  });

  // 추가/업데이트
  Object.keys(newProps).forEach((k) => {
    const nv = newProps[k];
    const ov = oldProps[k];
    if (nv === ov) return;

    if (k.startsWith("on") && typeof nv === "function") {
      if (typeof ov === "function") {
        el.removeEventListener(k.slice(2).toLowerCase(), ov);
      }
      el.addEventListener(k.slice(2).toLowerCase(), nv);
    } else if (k === "value") {
      if (el.value !== nv) el.value = nv;
    } else if (k === "className") {
      el.setAttribute("class", nv);
    } else if (k === "style" && typeof nv === "object") {
      el.removeAttribute("style");
      Object.assign(el.style, nv);
    } else if (k === "disabled") {
      el.disabled = !!nv;
    } else if (nv != null) {
      el.setAttribute(k, nv);
    }
  });
}

function updateDom(parent, newNode, oldNode, index = 0) {
  if (!parent) return;
  const existing = parent.childNodes[index];

  // 새 노드 없음 → 제거
  if (newNode == null) {
    if (existing) parent.removeChild(existing);
    return;
  }

  // 기존 노드 없음 → 추가
  if (oldNode == null) {
    parent.appendChild(createDom(newNode));
    return;
  }

  // 타입이 다르면 교체
  if (changed(newNode, oldNode)) {
    parent.replaceChild(createDom(newNode), existing);
    return;
  }

  // 텍스트 노드
  if (typeof newNode === "string" || typeof newNode === "number") {
    if (existing && existing.nodeType === Node.TEXT_NODE) {
      const text = String(newNode);
      if (existing.nodeValue !== text) existing.nodeValue = text;
    }
    return;
  }

  // 속성 패치
  patchProps(existing, newNode.props || {}, oldNode.props || {});

  // 자식 재귀
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const max = Math.max(newChildren.length, oldChildren.length);
  for (let i = 0; i < max; i++) {
    updateDom(existing, newChildren[i], oldChildren[i], i);
  }
}

// ========== 2. 상태 ==========

let state = {
  password: "",
  passwordCheck: "",
  helperPassword: "",
  helperPasswordCheck: "",
  buttonActive: false,
  toastMsg: "",
  showToast: false,
};

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

// 상태 변경
function setState(next) {
  state = { ...state, ...next };
  render();
}

// ========== 3. 기존 로직 반영: 유효성 검사 + 토스트 ==========

function showToast(message) {
  setState({ toastMsg: message, showToast: true });
  setTimeout(() => {
    // CSS 애니메이션 시간 고려해서 hidden 처리
    setState({ showToast: false });
  }, 2500);
}

// helper 출력
function setHelper(target, msg) {
  if (target === "password") {
    setState({ helperPassword: msg });
  } else if (target === "passwordCheck") {
    setState({ helperPasswordCheck: msg });
  }
}

// 비밀번호 개별 검사
function checkPassword() {
  const password = state.password.trim();

  if (password === "") {
    setHelper("password", "* 비밀번호를 입력해주세요.");
    return false;
  } else if (!passwordRegex.test(password)) {
    setHelper(
      "password",
      "* 비밀번호는 8자 이상 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다."
    );
    return false;
  } else {
    setHelper("password", "");
    return true;
  }
}

// 비밀번호 확인 개별 검사
function checkPasswordCheck() {
  const password = state.password.trim();
  const passwordCheck = state.passwordCheck.trim();

  if (passwordCheck === "") {
    setHelper("passwordCheck", "* 비밀번호를 한번 더 입력해주세요.");
    return false;
  } else if (password !== passwordCheck) {
    setHelper("passwordCheck", "* 비밀번호와 다릅니다.");
    return false;
  } else {
    setHelper("passwordCheck", "");
    return true;
  }
}

// 통합 검사 + 버튼 상태 갱신
function validateAll() {
  const isPasswordValid = checkPassword();
  const isCheckValid = checkPasswordCheck();
  const isValid = isPasswordValid && isCheckValid;
  setState({ buttonActive: isValid });
  return isValid;
}

// ========== 4. 이벤트 핸들러 (입력/블러/클릭) ==========

function handlePasswordInput(e) {
  setState({ password: e.target.value });
  validateAll();
}

function handlePasswordBlur() {
  validateAll();
}

function handlePasswordCheckInput(e) {
  setState({ passwordCheck: e.target.value });
  validateAll();
}

function handlePasswordCheckBlur() {
  validateAll();
}

async function handleSubmit(e) {
  e.preventDefault();

  const isValid = validateAll();
  if (!isValid) return;

  const newPassword = state.password.trim();
  const newPassword_check = state.passwordCheck.trim();
  const userId = localStorage.getItem("userId") || 1;

  try {
    const response = await fetch(
      `http://localhost:8080/users/${userId}/password`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword,
          newPassword_check,
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.message === "password_update_success") {
      showToast("수정완료");

      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/login.html";
      }, 1500);
      return;
    } else if (data.message === "password_mismatch") {
      setHelper("passwordCheck", "*새 비밀번호가 일치하지 않습니다.");
    } else if (data.message === "user_not_found") {
      setHelper("password", "* 존재하지 않는 사용자입니다.");
    } else {
      setHelper(
        "password",
        "* 비밀번호 변경에 실패했습니다. 다시 시도해주세요."
      );
    }
  } catch (error) {
    console.error("비밀번호 변경 요청 중 오류:", error);
    setHelper("password", "* 서버 연결에 실패했습니다. 다시 시도해주세요.");
  }
}

// ========== 5. VDOM 뷰 ==========

function App() {
  const btnStyle = state.buttonActive
    ? {
        backgroundColor: "#4BAA7D",
        cursor: "pointer",
        color: "#fff",
      }
    : {
        backgroundColor: "#dcdbe3",
        cursor: "default",
        color: "#fff",
      };

  return h(
    "div",
    { className: "passwordEdit_vdom_wrapper" },

    // 폼
    h(
      "form",
      { id: "passwordEdit_form" },
      h("p", { className: "password_label" }, "비밀번호"),
      h("input", {
        type: "password",
        id: "password",
        name: "password",
        placeholder: "비밀번호를 입력하세요.",
        required: true,
        autocomplete: "off",
        "aria-label": "비밀번호",
        value: state.password,
        oninput: handlePasswordInput,
        onblur: handlePasswordBlur,
      }),
      h("p", { className: "password_helper" }, state.helperPassword || ""),

      h("p", { className: "passwordCheck_label" }, "비밀번호 확인"),
      h("input", {
        type: "password",
        id: "passwordCheck",
        name: "passwordCheck",
        placeholder: "비밀번호를 한번 더 입력하세요.",
        required: true,
        autocomplete: "off",
        "aria-label": "비밀번호확인",
        value: state.passwordCheck,
        oninput: handlePasswordCheckInput,
        onblur: handlePasswordCheckBlur,
      }),
      h(
        "p",
        { className: "passwordCheck_helper" },
        state.helperPasswordCheck || ""
      )
    ),

    // 수정 버튼
    h(
      "button",
      {
        type: "submit",
        id: "edited_button",
        onclick: handleSubmit,
        disabled: !state.buttonActive,
        style: btnStyle,
      },
      "수정하기"
    ),

    // 토스트
    h(
      "div",
      {
        id: "toast",
        className: state.showToast ? "show" : "hidden",
      },
      state.toastMsg
    )
  );
}

// ========== 6. 렌더링 루프 ==========

const root = document.getElementById("passwordEdit_container");
let oldVNode = null;

function render() {
  const newVNode = App();
  if (!oldVNode) {
    root.innerHTML = "";
    root.appendChild(createDom(newVNode));
  } else {
    updateDom(root, newVNode, oldVNode);
  }
  oldVNode = newVNode;
}

// ========== 7. 헤더/프로필 드롭다운 + 프로필 이미지 로딩 (기존 로직 그대로) ==========

async function loadUserProfile() {
  try {
    const userId = localStorage.getItem("userId"); // 로그인 시 저장해둔 값

    if (!userId) {
      console.warn("로그인된 사용자 ID가 없습니다.");
      return;
    }

    const res = await fetch(`http://localhost:8080/users/${userId}/profile`);
    const json = await res.json();

    if (json.message === "read_success") {
      const imgUrl = json.data.profileImage;
      const profileImg = document.getElementById("profile_img");

      if (profileImg) {
        profileImg.src = imgUrl
          ? imgUrl.startsWith("http")
            ? imgUrl
            : `http://localhost:8080${imgUrl}`
          : "./img/profile.png";
      }
    }
  } catch (err) {
    console.error("프로필 불러오기 실패:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // 1) 헤더 프로필 드롭다운
  const profileImg = document.getElementById("profile_img");
  const dropdownMenu = document.getElementById("dropdown_menu");

  if (profileImg && dropdownMenu) {
    profileImg.addEventListener("click", () => {
      dropdownMenu.classList.toggle("hidden");
    });

    window.addEventListener("click", (e) => {
      if (!e.target.closest(".profile-menu")) {
        dropdownMenu.classList.add("hidden");
      }
    });
  }

  // 2) 헤더 제목 클릭 → 게시글 목록 이동
  const headerTitle = document.getElementById("header_title");
  if (headerTitle) {
    headerTitle.addEventListener("click", () => {
      window.location.href = "postList.html";
    });
  }

  // 3) 프로필 이미지 불러오기
  await loadUserProfile();

  // 4) VDOM 첫 렌더
  render();
});
