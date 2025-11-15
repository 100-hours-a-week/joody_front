import { h, createDom, updateElement } from "./common/Vdom.js";
import { initState, getState, setState, subscribe } from "./common/store.js";

initState({
  email: "",
  password: "",
  passwordCheck: "",
  helperEmail: "",
  helperPassword: "",
  helperPasswordCheck: "",
});

// ---------- 유효성 / 이벤트 ----------
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

function isStep1Complete() {
  const state = getState();
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
  const state = getState();
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

  // 1. 비어 있을 때
  if (!v) {
    // blur일 때만 "입력해주세요" 출력
    if (!fromInput) {
      setState({ helperPassword: "* 비밀번호를 입력해주세요." });
    } else {
      // 입력 중 비워졌으면 바로 출력
      setState({ helperPassword: "* 비밀번호를 입력해주세요." });
    }
    return false;
  }

  // 2. 공백 포함 검사
  if (/\s/.test(v)) {
    setState({
      helperPassword: "* 비밀번호에는 공백을 포함할 수 없습니다.",
    });
    return false;
  }

  // 3. 정규식 검사 (대문자, 소문자, 숫자, 특수문자 포함)
  if (!passwordRegex.test(v)) {
    setState({
      helperPassword:
        "* 비밀번호는 8~20자이며 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다.",
    });
    return false;
  }

  // 4. 모든 조건 만족 시 헬퍼 제거
  setState({ helperPassword: "" });
  return true;
}

// 비밀번호 확인 검사
function validatePasswordCheck(value, fromInput = false) {
  const state = getState();
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
  const state = getState();
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
  const state = getState();
  const active = isStep1Complete();

  return h(
    "div",
    { className: "signup_vdom_wrapper" },

    // 제목
    h(
      "h2",
      { id: "signup_title" },
      "이메일과 비밀번호를",
      h("br"),
      "입력해주세요"
    ),

    // 폼
    h(
      "form",
      { id: "signup_form" },

      // 이메일
      h(
        "div",
        { className: "input_group" },
        h("label", { for: "email" }, "이메일"),
        h(
          "div",
          { className: "input_wrapper" },
          h("input", {
            type: "email",
            id: "email",
            placeholder: "email@example.com",
            value: state.email,
            required: true,
            autocomplete: "off",
            onkeydown: preventSpaceAndHint("email"),
            oninput: (e) => {
              const v = e.target.value.replace(/\s+/g, "");
              setState({ email: v });
              validateEmail(v, true);
            },
            onblur: (e) => validateEmail(e.target.value),
          })
        ),
        h("p", { className: "email_helper" }, state.helperEmail)
      ),

      // 비밀번호
      h(
        "div",
        { className: "input_group" },
        h("label", { for: "password" }, "비밀번호"),
        h(
          "div",
          { className: "input_wrapper" },
          h("input", {
            type: "password",
            id: "password",
            placeholder: "비밀번호를 입력하세요.",
            value: state.password,
            required: true,
            onkeydown: preventSpaceAndHint("password"),
            oninput: (e) => {
              const v = e.target.value.replace(/\s+/g, "");
              setState({ password: v });

              // 최신 state 기반 검사 수행
              validatePassword(v, true);

              if (/\s/.test(e.target.value)) {
                setState({
                  helperPassword: "* 비밀번호에는 공백을 포함할 수 없습니다.",
                });
              } else if (state.helperPassword && passwordRegex.test(v)) {
                setState({ helperPassword: "" });
              }
            },
            onblur: (e) => validatePassword(e.target.value),
          })
        ),
        h("p", { className: "password_helper" }, state.helperPassword)
      ),

      // 비밀번호 확인
      h(
        "div",
        { className: "input_group" },
        h("label", { for: "password_check" }, "비밀번호 확인"),
        h(
          "div",
          { className: "input_wrapper" },
          h("input", {
            type: "password",
            id: "password_check",
            placeholder: "다시 한번 입력해주세요.",
            value: state.passwordCheck,
            required: true,
            onkeydown: preventSpaceAndHint("passwordCheck"),
            oninput: (e) => {
              const v = e.target.value.replace(/\s+/g, "");
              setState({ passwordCheck: v });

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
        h("p", { className: "passwordCheck_helper" }, state.helperPasswordCheck)
      ),

      // 다음 버튼
      h(
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

// 상태 변경 시마다 render 자동 호출
subscribe(renderApp);

document.addEventListener("DOMContentLoaded", () => {
  renderApp(); // 초기 렌더링
});
