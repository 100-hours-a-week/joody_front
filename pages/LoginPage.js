// pages/LoginPage.js
import { h } from "../vdom/Vdom.js";
import { render } from "../vdom/Vdom.js";
import { initState, getState, setState, watch } from "../vdom/Store.js";

// ==========================
// 1) 상태 초기화
// ==========================
initState({
  email: "",
  password: "",
  helper: "",
  isLoading: false,
});

// ==========================
// 2) 정규식
// ==========================
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,}$/;

// ==========================
// 3) 유효성 검사
// ==========================
function validateEmail(email, fromInput = false) {
  const trimmed = email.trim();
  if (!trimmed) {
    if (!fromInput) setState({ helper: "* 이메일을 입력해주세요." });
    return false;
  }
  if (!emailRegex.test(trimmed)) {
    setState({
      helper: "* 올바른 이메일 형식을 입력해주세요. (예: example@example.com)",
    });
    return false;
  }
  if (getState().helper.includes("이메일")) setState({ helper: "" });
  return true;
}

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
  if (getState().helper.includes("비밀번호")) setState({ helper: "" });
  return true;
}

// ==========================
// 4) 이벤트 핸들러
// ==========================
function handleEmailInput(e) {
  const v = e.target.value.replace(/\s+/g, "");
  setState({ email: v });
  validateEmail(v, true);
}

function handlePasswordInput(e) {
  const v = e.target.value.replace(/\s+/g, "");
  setState({ password: v });
  validatePassword(v, true);
}

function handleLogin(e) {
  e.preventDefault();
  const state = getState();

  if (!emailRegex.test(state.email) || !passwordRegex.test(state.password))
    return;

  setState({ isLoading: true, helper: "" });

  fetch("http://localhost:8080/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: state.email.trim(),
      password: state.password.trim(),
    }),
  })
    .then((res) => res.json().then((json) => ({ ok: res.ok, json })))
    .then(({ ok, json }) => {
      if (!ok) {
        setState({
          helper:
            json?.message === "emailOrPassword_mismatch"
              ? "* 아이디 또는 비밀번호를 확인해주세요."
              : "로그인 실패. 다시 시도해주세요.",
        });
        return;
      }
      localStorage.setItem("access_token", json.data.accessToken);
      localStorage.setItem("userId", json.data.user.id);

      location.hash = "#/posts";
    })
    .finally(() => setState({ isLoading: false }));
}

// ==========================
// 5) View
// ==========================
function View() {
  const state = getState();
  const isActive =
    emailRegex.test(state.email) && passwordRegex.test(state.password);

  return h(
    "div",
    {},

    h(
      "div",
      { id: "logo_wrapper" },
      h("img", {
        src: "./assets/img/logo.png",
        id: "login_logo",
        alt: "아무 말 대잔치 로고",
      })
    ),

    h(
      "div",
      { className: "login_wrapper" },

      h(
        "form",
        { id: "login_form" },
        h("p", { class: "email_label" }, "이메일"),
        h("input", {
          type: "email",
          id: "username",
          value: state.email,
          placeholder: "이메일",
          oninput: handleEmailInput,
        }),
        h("p", { class: "password_label" }, "비밀번호"),
        h("input", {
          type: "password",
          id: "password",
          value: state.password,
          placeholder: "비밀번호",
          oninput: handlePasswordInput,
        }),
        h("p", { id: "helper_text" }, state.helper)
      ),

      h(
        "button",
        {
          id: "login_button",
          disabled: !isActive,
          onclick: handleLogin,
          style: {
            backgroundColor: isActive ? "#4BAA7D" : "#dcdbe3",
            color: "#fff",
          },
        },
        state.isLoading ? "로딩 중..." : "로그인"
      ),

      h(
        "a",
        { id: "signup_link", onclick: () => (location.hash = "#/signup") },
        "회원가입"
      )
    )
  );
}

// ==========================
// 6) Page Export
// ==========================
export default function LoginPage(root) {
  const rerender = () => render(View(), root);

  rerender();
  watch("email", rerender);
  watch("password", rerender);
  watch("helper", rerender);
  watch("isLoading", rerender);
}
