import { h } from "../../vdom/Vdom.js";

export default function PostCreateContentInput({ value, oninput }) {
  return h(
    "div",
    { className: "form_group" },
    h("label", { for: "post_content_input" }, "내용*"),
    h("textarea", {
      id: "post_content_input",
      name: "content",
      rows: 10,
      placeholder: "내용을 입력해주세요.",
      value,
      oninput,
    })
  );
}
