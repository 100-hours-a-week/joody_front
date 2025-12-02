import { h } from "../../vdom/Vdom.js";
import PasswordInput from "./passwordInput.js";
import PasswordSubmitButton from "./PasswordSubmitButton.js";
import {
  handlePasswordCheckInput,
  handlePasswordInput,
  handleSubmit,
} from "../../handlers/passwordEditHandlers.js";

export default function PasswordForm({ state }) {
  return h(
    "form",
    { id: "passwordEdit_form", onsubmit: handleSubmit },

    PasswordInput({
      id: "password",
      label: "비밀번호",
      placeholder: "비밀번호를 입력하세요.",
      value: state.password,
      helper: state.helperPassword,
      oninput: handlePasswordInput,
    }),

    PasswordInput({
      id: "passwordCheck",
      label: "비밀번호 확인",
      value: state.passwordCheck,
      helper: state.helperPasswordCheck,
      placeholder: "비밀번호를 한번 더 입력하세요.",
      oninput: handlePasswordCheckInput,
    }),

    PasswordSubmitButton({ active: state.buttonActive })
  );
}
