function createElement(type, props = {}, ...children) {
  return { type, props, children };
}

function createDom(node) {
  if (node == null) return document.createTextNode("");
  if (typeof node === "string" || typeof node === "number") {
    return document.createTextNode(String(node));
  }

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

// 상태
let state = {
  email: "",
  password: "",
  helper: "",
  isLoading: false,
};

// 상태 변경
function setState(nextState) {
  state = { ...state, ...nextState };
  renderApp();
}

// 컴포넌트
function App() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  const isValidEmail = emailRegex.test(state.email);
  const isValidPassword = passwordRegex.test(state.password);
  const isActive = isValidEmail && isValidPassword;

  // 이메일 검사
  function validateEmail(email, fromInput = false) {
    const trimmed = email.trim();
    if (!trimmed) {
      if (!fromInput) setState({ helper: "* 이메일을 입력해주세요." });
      return false;
    }
    if (!emailRegex.test(trimmed)) {
      setState({
        helper:
          "* 올바른 이메일 형식을 입력해주세요. (예: example@example.com)",
      });
      return false;
    }
    if (state.helper.includes("이메일")) setState({ helper: "" });
    return true;
  }

  // ✅ 비밀번호 검사
  function validatePassword(password, fromInput = false) {
    const trimmed = password.trim();
    if (!trimmed) {
      if (!fromInput) setState({ helper: "* 비밀번호를 입력해주세요." });
      return false;
    }
    if (!passwordRegex.test(trimmed)) {
      setState({
        helper:
          "* 비밀번호는 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.",
      });
      return false;
    }
    if (state.helper.includes("비밀번호")) setState({ helper: "" });
    return true;
  }

  // ✅ 스페이스바 입력 방지 이벤트
  function handleSpacePrevent(e) {
    if (e.key === " ") {
      e.preventDefault();
      setState({ helper: "* 공백은 입력할 수 없습니다." });
    }
  }

  // ✅ 로그인 클릭
  async function handleLogin(e) {
    e.preventDefault();
    if (!isActive) return; // 비활성화 상태일 때 클릭 방지

    setState({ isLoading: true, helper: "" });
    try {
      const res = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email.trim(),
          password: state.password.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.data?.user) {
          localStorage.setItem("userId", data.data.user.id);
          localStorage.setItem("nickname", data.data.user.nickname);
          localStorage.setItem("profileImage", data.data.user.profileImage);
        }
        window.location.href = "/postList.html";
      } else if (data.message === "emailOrPassword_mismatch") {
        setState({ helper: "* 아이디 또는 비밀번호를 확인해주세요." });
      } else if (data.message === "deleted_user") {
        setState({ helper: "* 탈퇴한 회원입니다. 다시 가입해주세요." });
      } else {
        setState({ helper: "로그인 실패. 다시 시도해주세요." });
      }
    } catch {
      setState({ helper: "서버 연결 실패. 다시 시도해주세요." });
    } finally {
      setState({ isLoading: false });
    }
  }

  return createElement(
    "div",
    { className: "login_wrapper" },

    createElement(
      "form",
      { id: "login_form" },
      createElement("p", { class: "email_label" }, "이메일"),
      createElement("input", {
        type: "email",
        id: "username",
        value: state.email,
        placeholder: "이메일을 입력하세요.",
        autocomplete: "off",
        oninput: (e) => {
          const v = e.target.value.replace(/\s+/g, ""); // 공백 자동 제거
          setState({ email: v });
          validateEmail(v, true);
        },
        onkeydown: handleSpacePrevent, // 스페이스바 차단
        onblur: (e) => validateEmail(e.target.value),
      }),

      createElement("p", { class: "password_label" }, "비밀번호"),
      createElement("input", {
        type: "password",
        id: "password",
        value: state.password,
        placeholder: "비밀번호를 입력하세요.",
        oninput: (e) => {
          const v = e.target.value.replace(/\s+/g, ""); // 공백 자동 제거
          setState({ password: v });
          validatePassword(v, true);
        },
        onkeydown: handleSpacePrevent, // 스페이스바 차단
        onblur: (e) => validatePassword(e.target.value),
      }),

      createElement("p", { id: "helper_text" }, state.helper)
    ),

    // ✅ 버튼
    createElement(
      "button",
      {
        id: "login_button",
        type: "button",
        disabled: !isActive,
        onclick: handleLogin,
        style: {
          backgroundColor: isActive ? "#4BAA7D" : "#dcdbe3",
          color: "#fff",
          cursor: isActive ? "pointer" : "default",
          opacity: isActive ? "1" : "0.7",
          transition: "all 0.2s ease",
        },
      },
      state.isLoading ? "로딩 중..." : "로그인"
    ),

    createElement(
      "a",
      {
        id: "signup_link",
        href: "#",
        onclick: (e) => {
          e.preventDefault();
          window.location.href = "/signup_1.html";
        },
      },
      "회원가입"
    )
  );
}

// 렌더링
const root = document.getElementById("login_container");
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
}

document.addEventListener("DOMContentLoaded", renderApp);
