import { h } from "../../vdom/Vdom.js";

export function PostDeleteModal() {
  return h(
    "div",
    { id: "post_modal_overlay", className: "hidden" },
    h(
      "div",
      { id: "post_delete_modal", className: "modal_box" },
      h("h2", {}, "게시글을 삭제하시겠습니까?"),
      h("p", {}, "삭제한 내용은 복구할 수 없습니다."),
      h(
        "div",
        { className: "modal_buttons" },
        h("button", { className: "cancel_button" }, "취소"),
        h("button", { className: "confirm_button" }, "확인")
      )
    )
  );
}
