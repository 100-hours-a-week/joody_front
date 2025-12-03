import { h } from "../../vdom/Vdom.js";

export function CommentDeleteModal() {
  return h(
    "div",
    { id: "comment_modal_overlay", className: "hidden" },
    h(
      "div",
      { id: "comment_delete_modal", className: "modal_box" },
      h("h2", {}, "댓글을 삭제하시겠습니까?"),
      h("p", {}, "삭제한 내용은 복구할 수 없습니다."),
      h(
        "div",
        { className: "modal_buttons" },
        h("button", { className: "cancel_button" }, "취소"),
        h("button", { id: "comment_confirm_button" }, "확인")
      )
    )
  );
}
