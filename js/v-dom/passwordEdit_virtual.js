import { loadUserProfile } from "../utils/user.js";
import { h, createDom, updateElement } from "./common/Vdom.js";
import { initState, getState, setState, subscribe } from "./common/store.js";

initState({
  password: "",
  passwordCheck: "",
  helperPassword: "",
  helperPasswordCheck: "",
  buttonActive: false,
  toastMsg: "",
  showToast: false,
});

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

// 유효성 검사 + 토스트

function showToast(message) {
  setState({ toastMsg: message, showToast: true });
  setTimeout(() => {
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
  const state = getState();
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
  const state = getState();
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

// 이벤트 핸들러 (입력/블러/클릭)

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

  const state = getState();
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

// VDOM 뷰

function App() {
  const state = getState();
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

// 렌더링 루프

const root = document.getElementById("passwordEdit_container");
let oldVNode = null;

function render() {
  const newVNode = App();
  if (!oldVNode) {
    root.innerHTML = "";
    root.appendChild(createDom(newVNode));
  } else {
    updateElement(root, newVNode, oldVNode);
  }
  oldVNode = newVNode;
}
// 상태 변경 시마다 render 자동 호출
subscribe(render);

document.addEventListener("DOMContentLoaded", async () => {
  //헤더 제목 클릭 → 게시글 목록 이동
  const headerTitle = document.getElementById("header_title");
  if (headerTitle) {
    headerTitle.addEventListener("click", () => {
      window.location.href = "postList.html";
    });
  }

  // 프로필 이미지 불러오기
  await loadUserProfile();

  // VDOM 첫 렌더
  render();
});
