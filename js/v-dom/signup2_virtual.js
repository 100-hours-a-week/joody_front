/** ========= Virtual DOM 기반 회원가입 2단계 ========= **/

// ========== Virtual DOM 유틸 ==========
function createElement(type, props = {}, ...children) {
  return { type, props, children };
}

function createDom(node) {
  if (node == null) return document.createTextNode("");
  if (typeof node === "string" || typeof node === "number")
    return document.createTextNode(String(node));

  const el = document.createElement(node.type);
  const { props = {} } = node;

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

function updateElement(parent, newNode, oldNode, index = 0) {
  if (!parent) return;
  const existing = parent.childNodes ? parent.childNodes[index] : null;

  if (newNode == null) {
    if (existing) parent.removeChild(existing);
    return;
  }

  if (oldNode == null) {
    if (parent.nodeType !== Node.TEXT_NODE)
      parent.appendChild(createDom(newNode));
    return;
  }

  if (changed(newNode, oldNode)) {
    if (existing) parent.replaceChild(createDom(newNode), existing);
    else parent.appendChild(createDom(newNode));
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (existing && existing.nodeType === Node.TEXT_NODE) {
      if (existing.nodeValue !== String(newNode))
        existing.nodeValue = String(newNode);
    }
    return;
  }

  if (!existing || existing.nodeType !== Node.ELEMENT_NODE) return;

  patchProps(existing, newNode.props || {}, oldNode.props || {});
  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const max = Math.max(newChildren.length, oldChildren.length);
  for (let i = 0; i < max; i++) {
    updateElement(existing, newChildren[i], oldChildren[i], i);
  }
}

function patchProps(el, newProps, oldProps) {
  Object.keys(oldProps).forEach((k) => {
    if (!(k in newProps)) {
      if (k.startsWith("on"))
        el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k]);
      else if (k === "disabled") el.disabled = false;
      else if (k === "value") el.value = "";
      else if (k === "style") el.removeAttribute("style");
      else if (k === "className") el.removeAttribute("class");
      else el.removeAttribute(k);
    }
  });

  Object.keys(newProps).forEach((k) => {
    const nv = newProps[k],
      ov = oldProps[k];
    if (nv === ov) return;

    if (k.startsWith("on") && typeof nv === "function") {
      if (typeof ov === "function")
        el.removeEventListener(k.slice(2).toLowerCase(), ov);
      el.addEventListener(k.slice(2).toLowerCase(), nv);
    } else if (k === "value") {
      if (el.value !== nv) el.value = nv;
    } else if (k === "disabled") {
      el.disabled = !!nv;
    } else if (k === "style" && typeof nv === "object") {
      el.removeAttribute("style");
      Object.assign(el.style, nv);
    } else if (k === "className") {
      el.setAttribute("class", nv);
    } else if (nv != null) {
      el.setAttribute(k, nv);
    }
  });
}

// ========== 상태 ==========
let state = {
  nickname: "",
  avatar: null,
  avatarPreview: "",
  helperAvatar: "",
  helperNickname: "",
  isLoading: false,
};

// ========== 상태 변경 ==========
function setState(next) {
  state = { ...state, ...next };
  renderApp();
}

// ========== 유효성 검사 ==========
const nicknameRegex = /^[^\s]{1,8}$/;

// ========== 이벤트 ==========
function handleAvatarClick() {
  const input = document.getElementById("avatar_input");
  if (input) input.click(); // ✅ 사용자 직접 클릭으로만 실행됨 → 브라우저 경고 없음
}

// ========== 이벤트 ==========
function preventSpace(e) {
  if (e.key === " ") {
    e.preventDefault();
    setState({ helperNickname: "* 공백은 입력할 수 없습니다." });
  }
}

function handleNicknameInput(e) {
  const v = e.target.value.replace(/\s+/g, "");
  if (v.length > 8) return;
  setState({ nickname: v });
  if (!nicknameRegex.test(v)) {
    setState({
      helperNickname: "* 닉네임은 공백 없이 1~8자까지 입력 가능합니다.",
    });
  } else {
    setState({ helperNickname: "" });
  }
}

// ========== 이미지 업로드 ==========
function attachAvatarEvents() {
  const avatarContainer = document.getElementById("avatar-container");
  const avatarInput = document.getElementById("avatar_input");
  const avatarPreview = document.getElementById("avatar_preview");
  const avatarHelper = document.querySelector(".profile_image_helper");

  if (!avatarContainer || !avatarInput || !avatarPreview) return;

  // 클릭 시 업로드 창 열기
  avatarContainer.onclick = () => avatarInput.click();

  // 파일 변경 시
  avatarInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      avatarPreview.src = "";
      avatarContainer.classList.remove("has-avatar");
      avatarHelper.textContent = "* 프로필 사진을 추가하세요.";
      setState({ avatar: null, avatarPreview: "" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      avatarInput.value = "";
      avatarPreview.src = "";
      avatarContainer.classList.remove("has-avatar");
      avatarHelper.textContent = "* 이미지 파일만 업로드 가능합니다.";
      setState({ avatar: null, avatarPreview: "" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      avatarPreview.src = event.target.result;
      avatarContainer.classList.add("has-avatar");
      avatarHelper.textContent = "";
      setState({
        avatar: file,
        avatarPreview: event.target.result,
        helperAvatar: "",
      });
    };
    reader.readAsDataURL(file);
  };
}

// ✅ 확인 버튼 클릭 시
async function handleSubmit(e) {
  e.preventDefault();

  const nickname = state.nickname.trim();
  const avatarFile = state.avatar;

  if (!avatarFile) {
    setState({ helperAvatar: "* 프로필 사진을 추가하세요." });
    return;
  }
  if (!nicknameRegex.test(nickname)) {
    setState({
      helperNickname: "* 닉네임은 공백 없이 1~8자까지 입력 가능합니다.",
    });
    return;
  }

  const email = localStorage.getItem("signup_email");
  const password = localStorage.getItem("signup_password");
  const password_check = localStorage.getItem("signup_password_check");

  if (!email || !password) {
    alert("1단계 정보를 불러올 수 없습니다. 다시 시도해주세요.");
    location.href = "/signup_1.html";
    return;
  }

  const userData = { email, password, password_check, nickname };
  const formData = new FormData();
  formData.append(
    "user",
    new Blob([JSON.stringify(userData)], { type: "application/json" })
  );
  formData.append("profile_image", avatarFile);

  setState({ isLoading: true });

  try {
    const response = await fetch("http://localhost:8080/users/signup", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.clear();
      //   alert("회원가입이 완료되었습니다!");
      location.href = "/login.html";
    } else if (data.message === "duplicate_email") {
      //   alert("이미 존재하는 이메일입니다.");
      setState({ helperNickname: "이미 존재하는 이메일입니다." });
    } else if (data.message === "duplicate_nickname") {
      setState({ helperNickname: "* 중복된 닉네임입니다." });
    } else {
      alert(data.message || "회원가입 실패");
    }
  } catch (err) {
    console.error("회원가입 요청 오류:", err);
    alert("서버 연결에 실패했습니다. 다시 시도해주세요.");
  } finally {
    setState({ isLoading: false });
  }
}

// ========== VDOM 렌더 ==========
function App() {
  const nicknameValid = nicknameRegex.test(state.nickname);
  const avatarUploaded = !!state.avatar;
  const active = nicknameValid && avatarUploaded;

  return createElement(
    "div",
    { className: "signup_vdom_wrapper" },

    createElement(
      "h2",
      { id: "signup_title" },
      "프로필 사진과",
      createElement("br"),
      "이름을 설정해주세요"
    ),

    createElement(
      "form",
      { id: "signup_form" },

      // 프로필 업로드
      createElement(
        "div",
        { id: "avatar-container" },
        createElement("img", {
          id: "avatar_preview",
          src: state.avatarPreview || "",
          alt: "프로필 미리보기",
        }),
        createElement("input", {
          type: "file",
          id: "avatar_input",
          name: "avatar",
          accept: "image/*",
          style: "display:none;",
        })
      ),
      createElement(
        "p",
        { className: "profile_image_helper" },
        state.helperAvatar
      ),

      // 닉네임 입력
      createElement(
        "div",
        { className: "input_group" },
        createElement("label", { for: "nickname" }, "닉네임"),
        createElement(
          "div",
          { className: "input_wrapper" },
          createElement("input", {
            type: "text",
            id: "nickname",
            maxlength: 10,
            placeholder: "닉네임을 입력해주세요.",
            required: true,
            value: state.nickname,
            onkeydown: preventSpace,
            oninput: handleNicknameInput,
          })
        ),
        createElement(
          "p",
          { className: "nickname_helper" },
          state.helperNickname
        )
      ),

      // 확인 버튼
      createElement(
        "button",
        {
          id: "confirm_button",
          type: "submit",
          disabled: !active,
          onclick: handleSubmit,
          className: active ? "active" : "",
          style: {
            cursor: active ? "pointer" : "default",
          },
        },
        state.isLoading ? "등록 중..." : "확인"
      )
    )
  );
}

// ========== 렌더링 루프 ==========
const root = document.getElementById("signup_container");
let oldVNode = null;

function renderApp() {
  const newVNode = App();
  if (!oldVNode) {
    root.innerHTML = "";
    root.appendChild(createDom(newVNode));
  } else {
    updateElement(root, newVNode, oldVNode);
  }
  oldVNode = newVNode;

  attachAvatarEvents();
}

document.addEventListener("DOMContentLoaded", renderApp);
