import { setState, getState } from "../vdom/Store.js";
import {
  validateEmail,
  validatePassword,
} from "../validators/loginValidators.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export function handleEmailInput(e) {
  const v = e.target.value.replace(/\s+/g, "");
  setState({ email: v });
  validateEmail(v, true);
}

export function handlePasswordInput(e) {
  const v = e.target.value.replace(/\s+/g, "");
  setState({ password: v });
  validatePassword(v, true);
}

export function handleLogin(e) {
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
