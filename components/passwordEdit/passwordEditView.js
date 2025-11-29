import { h, createDom, updateElement } from "../../vdom/Vdom.js";
import { getState, setState } from "../../vdom/Store.js";
import { apiRequest } from "../../api/authApi.js";
import MainHeader from "../common/mainHeader.js";

// ------------------------- 규칙 정규식 -------------------------
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

// ------------------------- Helper & Toast -------------------------
function showToast(message) {
  setState({ toastMsg: message, showToast: true });
  setTimeout(() => setState({ showToast: false }), 2500);
}

function setHelper(target, msg) {
  target === "password"
    ? setState({ helperPassword: msg })
    : setState({ helperPasswordCheck: msg });
}

// ------------------------- Validation -------------------------
function checkPassword() {
  const { password } = getState();
  const pwd = password.trim();
  if (!pwd) return setHelper("password", "* 비밀번호를 입력해주세요."), false;
  if (!passwordRegex.test(pwd))
    return (
      setHelper(
        "password",
        "* 비밀번호는 8-20자이며 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다."
      ),
      false
    );

  setHelper("password", "");
  return true;
}

function checkPasswordCheck() {
  const { password, passwordCheck } = getState();
  const pwd = password.trim();
  const confirm = passwordCheck.trim();

  if (!confirm)
    return setHelper("passwordCheck", "* 비밀번호를 다시 입력해주세요."), false;

  if (pwd !== confirm)
    return setHelper("passwordCheck", "* 비밀번호가 다릅니다."), false;

  setHelper("passwordCheck", "");
  return true;
}

function validateAll() {
  const valid = checkPassword() && checkPasswordCheck();
  setState({ buttonActive: valid });
  return valid;
}

// ------------------------- Event Handlers -------------------------
export function handlePasswordInput(e) {
  setState({ password: e.target.value });
  validateAll();
}

export function handlePasswordCheckInput(e) {
  setState({ passwordCheck: e.target.value });
  validateAll();
}

export async function handleSubmit(e) {
  e.preventDefault();
  if (!validateAll()) return;

  const { password, passwordCheck } = getState();
  const userId = localStorage.getItem("userId") || 1;

  const { ok, data } = await apiRequest(`/users/${userId}/password`, {
    method: "PUT",
    body: JSON.stringify({
      newPassword: password,
      newPassword_check: passwordCheck,
    }),
  });

  if (!ok || !data) return setHelper("password", "* 비밀번호 변경 실패");

  if (data.message === "password_update_success") {
    showToast("수정 완료");
    setTimeout(() => {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("userId");

      window.location.hash = "#/login";
    }, 1500);
  }
}

// ------------------------- VDOM VIEW -------------------------
export function PasswordEditView() {
  const state = getState();

  return h(
    "div",
    {},

    MainHeader(),

    h("h2", { id: "passwordEdit_title" }, "비밀번호 수정"),

    h(
      "div",
      { id: "passwordEdit_container" },

      h(
        "form",
        { id: "passwordEdit_form", onsubmit: handleSubmit },

        h("p", { className: "password_label" }, "비밀번호"),
        h("input", {
          type: "password",
          id: "password",
          name: "password",
          placeholder: "비밀번호를 입력하세요.",
          autocomplete: "off",
          value: state.password || "",
          oninput: handlePasswordInput,
        }),
        h("p", { className: "password_helper" }, state.helperPassword),

        h("p", { className: "passwordCheck_label" }, "비밀번호 확인"),
        h("input", {
          type: "password",
          id: "passwordCheck",
          name: "passwordCheck",
          placeholder: "비밀번호를 한번 더 입력하세요.",
          autocomplete: "off",
          value: state.passwordCheck || "",
          oninput: handlePasswordCheckInput,
        }),
        h(
          "p",
          { className: "passwordCheck_helper" },
          state.helperPasswordCheck
        ),

        h(
          "button",
          {
            id: "edited_button",
            disabled: !state.buttonActive,
            style: {
              backgroundColor: state.buttonActive ? "#4baa7d" : "#dcdbe3",
            },
          },
          "수정하기"
        )
      ),
      h(
        "div",
        { id: "toast", className: state.showToast ? "show" : "hidden" },
        state.toastMsg
      )
    )
  );
}
