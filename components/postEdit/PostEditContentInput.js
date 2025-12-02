import { h } from "../../vdom/Vdom.js";

export default function PostEditContentInput({ value, oninput }) {
  return h(
    "div",
    { className: "form_group" },
    h("label", { for: "post_content_input" }, "내용*"),
    h("textarea", {
      id: "post_content_input",
      rows: 10,
      value,
      oninput,
    })
  );
}
