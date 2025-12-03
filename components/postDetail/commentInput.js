import { h } from "../../vdom/Vdom.js";

export function CommentInput() {
  return h(
    "div",
    { id: "comment_write_box" },
    h("textarea", {
      id: "comment_input",
      placeholder: "댓글을 남겨주세요!",
      "aria-label": "댓글 입력",
    }),
    h(
      "button",
      {
        id: "submit_comment_button",
        disabled: true,
        style: { backgroundColor: "#d9d9d9" },
      },
      "댓글 등록"
    )
  );
}
