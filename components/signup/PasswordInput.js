import { h } from "../../vdom/Vdom.js";
import { getState, setState } from "../../vdom/Store.js";
import { validatePassword } from "../../validators/signupValidators.js";
import { preventSpaceAndHint } from "../../utils/common.js";

export function PasswordInput(pwRegex) {
  const s = getState();

  return h(
    "div",
    { className: "input_group" },
    h("label", { for: "password" }, "비밀번호"),
    h(
      "div",
      { className: "input_wrapper" },
      h("input", {
        type: "password",
        id: "Password",
        placeholder: "비밀번호를 입력하세요.",
        value: s.password || "",
        onkeydown: preventSpaceAndHint("password"),
        oninput: (e) => {
          const v = e.target.value.replace(/\s+/g, "");
          setState({ password: v });
          validatePassword(v, true);

          if (/\s/.test(e.target.value)) {
            setState({
              helperPassword: "* 비밀번호에는 공백을 포함할 수 없습니다.",
            });
          } else if (s.helperPassword && pwRegex.test(v)) {
            setState({ helperPassword: "" });
          }
        },
        onblur: (e) => validatePassword(e.target.value),
      })
    ),
    h("p", { className: "password_helper" }, s.helperPassword)
  );
}
