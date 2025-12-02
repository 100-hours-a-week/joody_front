import { h } from "../../vdom/Vdom.js";

export default function PasswordInput({
  id,
  label,
  value,
  helper,
  oninput,
  placeholder,
}) {
  return h(
    "div",
    { className: "input_group" },

    h("p", { className: `${id}_label` }, label),

    h("input", {
      id,
      type: "password",
      placeholder: placeholder,
      autocomplete: "off",
      value,
      oninput,
    }),

    h("p", { className: `${id}_helper` }, helper)
  );
}
