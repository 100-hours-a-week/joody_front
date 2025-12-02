import { h } from "../../vdom/Vdom.js";
import { withdrawUser } from "../../api/profileApi.js";

export default function ProfileWithdrawModal({ open, onCancel }) {
  return h(
    "div",
    { id: "modal_overlay", className: open ? "" : "hidden" },

    h(
      "div",
      { id: "delete_modal" },

      h("h2", null, "회원탈퇴 하시겠습니까?"),
      h("p", null, "작성된 게시글과 댓글은 삭제됩니다."),

      h(
        "div",
        { className: "modal_buttons" },
        h(
          "button",
          {
            id: "cancel_button",
            onclick: onCancel,
          },
          "취소"
        ),
        h("button", { id: "confirm_button", onclick: withdrawUser }, "확인")
      )
    )
  );
}
