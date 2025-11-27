import { h } from "../../vdom/Vdom.js";
import { getState, setState } from "../../vdom/Store.js";
import { validateEmail } from "../../validators/signupValidators.js";
import { preventSpaceAndHint } from "../../utils/common.js";

export default function EmailInput(emailRegex) {
  const s = getState();

  return h(
    "div",
    { className: "input_group" },
    h("label", { for: "email" }, "이메일"),
    h(
      "div",
      { className: "input_wrapper" },
      h("input", {
        type: "email",
        id: "email",
        placeholder: "email@example.com",
        value: s.email || "",
        required: true,
        autocomplete: "email",
        onkeydown: preventSpaceAndHint("email"),
        oninput: (e) => {
          const v = e.target.value.replace(/\s+/g, "");
          setState({ email: v });
          validateEmail(v, true);
        },
        onblur: (e) => validateEmail(e.target.value),
      })
    ),
    h("p", { className: "email_helper" }, s.helperEmail)
  );
}
