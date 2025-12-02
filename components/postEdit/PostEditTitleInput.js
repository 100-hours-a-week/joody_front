import { h } from "../../vdom/Vdom.js";

export default function PostEditTitleInput({ value, oninput }) {
  return h(
    "div",
    { className: "form_group" },
    h("label", { for: "post_title_input" }, "제목*"),
    h("input", {
      type: "text",
      id: "post_title_input",
      value,
      oninput,
    })
  );
}
