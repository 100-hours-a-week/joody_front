import { h } from "../../vdom/Vdom.js";

export default function Input({ id, type, value, placeholder, oninput }) {
  return h("input", {
    id,
    type,
    value,
    placeholder,
    oninput,
  });
}
