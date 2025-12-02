import { h } from "../../vdom/Vdom.js";

export default function ProfileToast({ show, message }) {
  return h(
    "div",
    { id: "toast", className: show ? "show" : "hidden" },
    message
  );
}
