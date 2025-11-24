import { h, createDom } from "./common/Vdom.js";
import { initState, getState, setState, watch } from "./common/store.js";

// 초기 상태
initState({
  email: "",
  password: "",
  helper: "",
  isLoading: false,
});

// 정규식
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,}$/;

// 1) 핸들러를 App 밖으로 분리
// 이메일 검증
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
  const state = getState();
  if (state.helper.includes("이메일")) setState({ helper: "" });
  return true;
}

// 비밀번호 검증
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
  const state = getState();
  if (state.helper.includes("비밀번호")) setState({ helper: "" });
  return true;
}

// 이메일 입력
function handleEmailInput(e) {
  const v = e.target.value.replace(/\s+/g, "");
  setState({ email: v });
  validateEmail(v, true);
}

// 비밀번호 입력
function handlePasswordInput(e) {
  const v = e.target.value.replace(/\s+/g, "");
  setState({ password: v });
  validatePassword(v, true);
}

// blur
function handleEmailBlur(e) {
  validateEmail(e.target.value);
}
function handlePasswordBlur(e) {
  validatePassword(e.target.value);
}

// 스페이스 방지
function handleSpacePrevent(e) {
  if (e.key === " ") {
    e.preventDefault();
    setState({ helper: "* 공백은 입력할 수 없습니다." });
  }
}

// 로그인
async function handleLogin(e) {
  e.preventDefault();

  const state = getState();
  if (!emailRegex.test(state.email) || !passwordRegex.test(state.password))
    return;

  setState({ isLoading: true, helper: "" });

  try {
    const res = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: state.email.trim(),
        password: state.password.trim(),
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      if (json?.message === "emailOrPassword_mismatch") {
        setState({ helper: "* 아이디 또는 비밀번호를 확인해주세요." });
      } else {
        setState({ helper: "로그인 실패. 다시 시도해주세요." });
      }
      return;
    }

    localStorage.setItem("access_token", json.data.accessToken);
    const user = json.data.user;
    localStorage.setItem("userId", user.id);
    localStorage.setItem("nickname", user.nickname);
    localStorage.setItem("profileImage", user.profileImage);

    window.location.href = "/postList.html";
  } catch (err) {
    console.error(err);
    setState({ helper: "서버 오류입니다. 다시 시도해주세요." });
  } finally {
    setState({ isLoading: false });
  }
}

// 2) App은 오직 "초기 렌더링용"
function App() {
  const state = getState();
  const isActive =
    emailRegex.test(state.email) && passwordRegex.test(state.password);

  return h(
    "div",
    { className: "login_wrapper" },

    h(
      "form",
      { id: "login_form" },

      // 이메일
      h("p", { class: "email_label" }, "이메일"),
      h("input", {
        type: "email",
        id: "username",
        value: state.email,
        placeholder: "이메일을 입력하세요.",
        autocomplete: "off",
        oninput: handleEmailInput,
        onblur: handleEmailBlur,
        onkeydown: handleSpacePrevent,
      }),

      // 비밀번호
      h("p", { class: "password_label" }, "비밀번호"),
      h("input", {
        type: "password",
        id: "password",
        value: state.password,
        placeholder: "비밀번호를 입력하세요.",
        oninput: handlePasswordInput,
        onblur: handlePasswordBlur,
        onkeydown: handleSpacePrevent,
      }),

      h("p", { id: "helper_text" }, state.helper)
    ),

    // 버튼
    h(
      "button",
      {
        id: "login_button",
        type: "button",
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

// 3) 최초 1회 전체 렌더
const root = document.getElementById("login_container");

function renderApp() {
  root.innerHTML = "";
  root.appendChild(createDom(App()));
}

document.addEventListener("DOMContentLoaded", renderApp);

// 4) watch로 부분 업데이트
// 이메일 입력 업데이트
watch("email", (v) => {
  const el = document.getElementById("username");
  if (el && el.value !== v) el.value = v;
});

// 비밀번호 부분 패치
watch("password", (v) => {
  const el = document.getElementById("password");
  if (el && el.value !== v) el.value = v;
});

// helper 텍스트 패치
watch("helper", (msg) => {
  const el = document.getElementById("helper_text");
  if (el && el.textContent !== msg) el.textContent = msg;
});

// 로그인 버튼 활성화/비활성화
function updateLoginButton() {
  const state = getState();
  const btn = document.getElementById("login_button");
  if (!btn) return;

  const isActive =
    emailRegex.test(state.email) && passwordRegex.test(state.password);

  btn.disabled = !isActive;
  btn.style.backgroundColor = isActive ? "#4BAA7D" : "#dcdbe3";
}

watch("email", updateLoginButton);
watch("password", updateLoginButton);
