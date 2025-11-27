import { h } from "../../vdom/Vdom.js";
import { getState, setState } from "../../vdom/Store.js";
import { validatePasswordCheck } from "../../validators/signupValidators.js";
import { preventSpaceAndHint } from "../../utils/common.js";

export function PasswordCheckInput() {
  const s = getState();
  return h(
    "div",
    { className: "input_group" },
    h("label", { for: "password_check" }, "비밀번호 확인"),
    h("input", {
      type: "password",
      id: "Password_check",
      placeholder: "다시 한번 입력해주세요.",
      value: s.passwordCheck || "",
      required: true,
      onkeydown: preventSpaceAndHint("passwordCheck"),
      oninput: (e) => {
        const v = e.target.value.replace(/\s+/g, "");
        setState({ passwordCheck: v });
        if (!v) {
          setState({
            helperPasswordCheck: "* 비밀번호를 한번 더 입력해주세요.",
          });
        } else if (s.password.trim() !== v.trim()) {
          setState({ helperPasswordCheck: "* 비밀번호가 다릅니다." });
        } else if (s.helperPasswordCheck) {
          setState({ helperPasswordCheck: "" });
        }
      },
      onblur: (e) => validatePasswordCheck(e.target.value),
    }),
    h("p", { className: "passwordCheck_helper" }, s.helperPasswordCheck)
  );
}
