import { h } from "../../vdom/Vdom.js";

export default function PostEditImageInput({ onChange }) {
  return h(
    "div",
    { className: "form_group" },
    h("label", { for: "post_image_input" }, "이미지"),
    h("input", {
      type: "file",
      id: "post_image_input",
      accept: "image/*",
      onchange: onChange,
    })
  );
}
