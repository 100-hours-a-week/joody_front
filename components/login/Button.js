import { h } from "../../vdom/Vdom.js";

export default function Button({ id, disabled, onclick, children, style }) {
  return h("button", { id, disabled, onclick, style }, children);
}
