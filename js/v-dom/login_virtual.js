import { h, createDom, updateElement } from "./common/Vdom.js";
import { initState, getState, setState, subscribe } from "./common/store.js";
import { apiRequest } from "../utils/api.js";

initState({
  email: "",
  password: "",
  helper: "",
  isLoading: false,
});

// 컴포넌트
function App() {
  const state = getState();
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
      // apiRequest 사용 (credentials: include 자동 적용됨!)
      const { ok, data } = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: state.email.trim(),
          password: state.password.trim(),
        }),
      });

      if (!ok) {
        if (data?.message === "emailOrPassword_mismatch") {
          setState({ helper: "* 아이디 또는 비밀번호를 확인해주세요." });
        } else if (data?.message === "deleted_user") {
          setState({ helper: "* 탈퇴한 회원입니다. 다시 가입해주세요." });
        } else {
          setState({ helper: "로그인 실패. 다시 시도해주세요." });
        }
        return;
      }

      // Access Token 저장
      const accessToken = data.data.accessToken;
      localStorage.setItem("access_token", accessToken);
      console.log(accessToken);

      // 사용자 정보 저장 (댓글 표시, 프로필 표시 등에 필요)
      const user = data.data.user;
      localStorage.setItem("userId", user.id);
      localStorage.setItem("nickname", user.nickname);
      localStorage.setItem("profileImage", user.profileImage);

      // Refresh Token은 HttpOnly 쿠키로 자동 저장됨 (JS에서 접근 불가)

      // 이동!
      window.location.href = "/postList.html";
    } catch (err) {
      console.error("로그인 요청 실패:", err);
      setState({ helper: "서버 연결 실패. 다시 시도해주세요." });
    } finally {
      setState({ isLoading: false });
    }
  }

  return h(
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

      h("p", { class: "password_label" }, "비밀번호"),
      h("input", {
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

      h("p", { id: "helper_text" }, state.helper)
    ),

    // ✅ 버튼
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
          cursor: isActive ? "pointer" : "default",
          opacity: isActive ? "1" : "0.7",
          transition: "all 0.2s ease",
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

// 상태 변경될 때마다 renderApp 자동 실행되도록 하는 부분
subscribe(renderApp);

document.addEventListener("DOMContentLoaded", () => {
  renderApp(); // 초기 렌더링
});
