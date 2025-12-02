import { apiRequest } from "../api/authApi.js";
import { getState, setState } from "../vdom/Store.js";
import { validateAll } from "../validators/passwordEditValidators.js";
import { showToast } from "../utils/common.js";

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
