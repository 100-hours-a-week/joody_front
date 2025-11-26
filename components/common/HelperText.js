import { h } from "../../vdom/Vdom.js";

export default function HelperText({ message }) {
  return h("p", { id: "helper_text", className: "helper_text" }, message);
}
