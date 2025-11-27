import { getState, setState } from "../vdom/Store.js";

export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const pwRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;
export const nicknameRegex = /^[^\s]{1,8}$/;

export const isComplete = () => {
  const s = getState();
  return (
    emailRegex.test(s.email) &&
    pwRegex.test(s.password) &&
    s.password === s.passwordCheck
  );
};

export function validateEmail(value, fromInput = false) {
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

  setState({ helperEmail: "" });
  return true;
}

export function validatePassword(value, fromInput = false) {
  const v = value.trim();

  if (!v) {
    setState({ helperPassword: "* 비밀번호를 입력해주세요." });
    return false;
  }

  if (/\s/.test(v)) {
    setState({ helperPassword: "* 공백은 사용할 수 없습니다." });
    return false;
  }

  if (!pwRegex.test(v)) {
    setState({
      helperPassword:
        "* 비밀번호는 8~20자, 대문자/소문자/숫자/특수문자 포함해야 합니다.",
    });
    return false;
  }

  setState({ helperPassword: "" });
  return true;
}

export function validatePasswordCheck(value, fromInput = false) {
  const s = getState();
  const v = value.trim();

  if (!v) {
    if (!fromInput) {
      setState({ helperPasswordCheck: "* 비밀번호를 한번 더 입력해주세요." });
    }
    return false;
  }

  if (s.password.trim() !== v) {
    setState({ helperPasswordCheck: "* 비밀번호가 다릅니다." });
    return false;
  }

  setState({ helperPasswordCheck: "" });
  return true;
}

export function validateNickname(value) {
  if (!value.trim()) return "* 닉네임을 입력해주세요.";
  if (value.length > 8) return "* 닉네임은 최대 8자까지 가능합니다.";
  if (!nicknameRegex.test(value))
    return "* 닉네임은 공백 없이 1~8자까지 입력 가능합니다.";
  return ""; // valid
}
