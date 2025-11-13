/** ========= Virtual DOM 기반 회원가입 1단계 ========= **/

// ---------- 작은 VDOM 유틸 ----------
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
      if (existing.nodeValue !== String(newNode)) {
        existing.nodeValue = String(newNode);
      }
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

// ---------- 상태 ----------
let state = {
  email: "",
  password: "",
  passwordCheck: "",
  helperEmail: "",
  helperPassword: "",
  helperPasswordCheck: "",
};

function setState(next) {
  state = { ...state, ...next };
  renderApp();
}

// ---------- 유효성 / 이벤트 ----------
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

function isStep1Complete() {
  const emailValid = emailRegex.test(state.email);
  const passwordValid =
    passwordRegex.test(state.password) && !/\s/.test(state.password);
  const match = state.password && state.password === state.passwordCheck;
  return emailValid && passwordValid && match;
}

// 스페이스바 차단 + 헬퍼
function preventSpaceAndHint(which) {
  return (e) => {
    if (e.key === " ") {
      e.preventDefault();
      if (which === "email") {
        setState({ helperEmail: "* 공백은 입력할 수 없습니다." });
      } else if (which === "password") {
        setState({
          helperPassword: "* 비밀번호에는 공백을 포함할 수 없습니다.",
        });
      } else if (which === "passwordCheck") {
        setState({ helperPasswordCheck: "* 공백은 입력할 수 없습니다." });
      }
    }
  };
}

// 이메일 검사
function validateEmail(value, fromInput = false) {
  const v = value.trim();
  if (!v) {
    if (!fromInput) setState({ helperEmail: "* 이메일을 입력해주세요." });
    return false;
  }
  if (!emailRegex.test(v)) {
    setState({
      helperEmail:
        "* 올바른 이메일 주소 형식을 입력해주세요. (예: test@test.com)",
    });
    return false;
  }
  // 정상
  if (state.helperEmail) setState({ helperEmail: "" });
  return true;
}

// 비밀번호 검사
function validatePassword(value, fromInput = false) {
  const v = value.trim();
  if (!v) {
    if (!fromInput) setState({ helperPassword: "* 비밀번호를 입력해주세요." });
    return false;
  }
  if (/\s/.test(v)) {
    setState({ helperPassword: "* 비밀번호에는 공백을 포함할 수 없습니다." });
    return false;
  }
  if (!passwordRegex.test(v)) {
    setState({
      helperPassword:
        "* 비밀번호는 8~20자이며 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.",
    });
    return false;
  }
  if (state.helperPassword) setState({ helperPassword: "" });
  return true;
}

// 비밀번호 확인 검사
function validatePasswordCheck(value, fromInput = false) {
  const v = value.trim();
  const p = state.password.trim();

  if (!v) {
    if (!fromInput)
      setState({ helperPasswordCheck: "* 비밀번호를 한번 더 입력해주세요." });
    return false;
  }
  if (p !== v) {
    setState({ helperPasswordCheck: "* 비밀번호가 다릅니다." });
    return false;
  }
  if (state.helperPasswordCheck) setState({ helperPasswordCheck: "" });
  return true;
}

// 다음 클릭
function handleNext(e) {
  e.preventDefault();
  // 최종 체크
  const okEmail = validateEmail(state.email);
  const okPass = validatePassword(state.password);
  const okMatch = validatePasswordCheck(state.passwordCheck);
  if (!(okEmail && okPass && okMatch)) return;

  localStorage.setItem("signup_email", state.email.trim());
  localStorage.setItem("signup_password", state.password.trim());
  localStorage.setItem("signup_password_check", state.passwordCheck.trim());

  location.href = "/signup_2.html";
}

// ---------- UI ----------
function App() {
  const active = isStep1Complete();

  return createElement(
    "div",
    { className: "signup_vdom_wrapper" },
    // ✅ 여기에 제목 추가
    createElement(
      "h2",
      { id: "signup_title" },
      "이메일과 비밀번호를",
      createElement("br"),
      "입력해주세요"
    ),

    createElement(
      "form",
      { id: "signup_form" },

      // 이메일
      createElement(
        "div",
        { className: "input_group" },
        createElement("label", { for: "email" }, "이메일"),
        createElement(
          "div",
          { className: "input_wrapper" },
          createElement("input", {
            type: "email",
            id: "email",
            placeholder: "email@example.com",
            value: state.email,
            required: true,
            autocomplete: "off",
            onkeydown: preventSpaceAndHint("email"),
            oninput: (e) => {
              const v = e.target.value.replace(/\s+/g, ""); // 공백 자동 제거
              setState({ email: v });
              validateEmail(v, true);
            },
            onblur: (e) => validateEmail(e.target.value),
          })
        ),
        createElement("p", { className: "email_helper" }, state.helperEmail)
      ),

      // 비밀번호
      createElement(
        "div",
        { className: "input_group" },
        createElement("label", { for: "password" }, "비밀번호"),
        createElement(
          "div",
          { className: "input_wrapper" },
          createElement("input", {
            type: "password",
            id: "password",
            placeholder: "비밀번호를 입력하세요.",
            value: state.password,
            required: true,
            onkeydown: preventSpaceAndHint("password"),
            oninput: (e) => {
              const v = e.target.value.replace(/\s+/g, "");
              setState({ password: v });
              // 입력 중엔 공백만 즉시 처리, 나머지는 blur에서
              if (/\s/.test(e.target.value)) {
                setState({
                  helperPassword: "* 비밀번호에는 공백을 포함할 수 없습니다.",
                });
              } else if (state.helperPassword && passwordRegex.test(v)) {
                // 규칙 충족으로 바뀌면 헬퍼 지움
                setState({ helperPassword: "" });
              }
            },
            onblur: (e) => validatePassword(e.target.value),
          })
        ),
        createElement(
          "p",
          { className: "password_helper" },
          state.helperPassword
        )
      ),

      // 비밀번호 확인
      createElement(
        "div",
        { className: "input_group" },
        createElement("label", { for: "password_check" }, "비밀번호 확인"),
        createElement(
          "div",
          { className: "input_wrapper" },
          createElement("input", {
            type: "password",
            id: "password_check",
            placeholder: "다시 한번 입력해주세요.",
            value: state.passwordCheck,
            required: true,
            onkeydown: preventSpaceAndHint("passwordCheck"),
            oninput: (e) => {
              const v = e.target.value.replace(/\s+/g, "");
              setState({ passwordCheck: v });
              // 실시간 일치 검사
              if (!v) {
                setState({
                  helperPasswordCheck: "* 비밀번호를 한번 더 입력해주세요.",
                });
              } else if (state.password.trim() !== v.trim()) {
                setState({ helperPasswordCheck: "* 비밀번호가 다릅니다." });
              } else if (state.helperPasswordCheck) {
                setState({ helperPasswordCheck: "" });
              }
            },
            onblur: (e) => validatePasswordCheck(e.target.value),
          })
        ),
        createElement(
          "p",
          { className: "passwordCheck_helper" },
          state.helperPasswordCheck
        )
      ),

      // 다음 버튼
      createElement(
        "button",
        {
          id: "next_button",
          type: "submit",
          disabled: !active,
          onclick: handleNext,
          className: active ? "active" : "",
          style: {
            cursor: active ? "pointer" : "default",
          },
        },
        "다음"
      )
    )
  );
}

// ---------- 렌더링 루프 ----------
const root = document.getElementById("signup_container");
let oldVNode = null;

function renderApp() {
  const newVNode = App();
  if (!oldVNode) {
    // 첫 렌더: 기존 SSR/정적 DOM 모두 비우고 VDOM 마운트
    root.innerHTML = "";
    root.appendChild(createDom(newVNode));
  } else {
    updateElement(root, newVNode, oldVNode);
  }
  oldVNode = newVNode;
}

document.addEventListener("DOMContentLoaded", renderApp);
