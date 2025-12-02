import { h } from "../../vdom/Vdom.js";

export default function PostCreateTitleInput({ value, oninput }) {
  return h(
    "div",
    { className: "form_group" },
    h("label", { for: "post_title_input" }, "제목*"),
    h("input", {
      type: "text",
      id: "post_title_input",
      name: "title",
      placeholder: "제목을 입력해주세요.(최대 26글자)",
      value,
      oninput,
    })
  );
}
