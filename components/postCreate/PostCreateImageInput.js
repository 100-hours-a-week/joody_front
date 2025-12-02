import { h } from "../../vdom/Vdom.js";

export default function PostCreateImageInput({ onSelect }) {
  return h(
    "div",
    { className: "form_group" },
    h("label", { for: "post_image_input" }, "이미지"),
    h("input", {
      type: "file",
      id: "post_image_input",
      name: "image",
      accept: "image/*",
      onchange: onSelect,
    })
  );
}
