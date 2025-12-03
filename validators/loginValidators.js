import { setState } from "../vdom/Store.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,}$/;

export function validateEmail(email, fromInput = false) {
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
  setState({ helper: "" });
  return true;
}

export function validatePassword(password, fromInput = false) {
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
  setState({ helper: "" });
  return true;
}
