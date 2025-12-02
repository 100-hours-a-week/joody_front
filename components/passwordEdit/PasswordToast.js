import { h } from "../../vdom/Vdom.js";

export default function PasswordToast({ message, show }) {
  return h(
    "div",
    { id: "toast", className: show ? "show" : "hidden" },
    message
  );
}
