import { getState, setState } from "../vdom/Store.js";
import { setHelper } from "../utils/common.js";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;
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

export function validateAll() {
  const valid = checkPassword() && checkPasswordCheck();
  setState({ buttonActive: valid });
  return valid;
}
