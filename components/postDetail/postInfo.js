import { h } from "../../vdom/Vdom.js";

export function PostInfo() {
  return h(
    "div",
    { id: "post_info" },
    h("img", { id: "post_author_img", alt: "작성자 프로필 이미지" }),
    h("p", { id: "post_author" }),
    h("p", { id: "post_date" }),
    h("button", { id: "edit_button" }, "수정"),
    h("button", { id: "delete_button" }, "삭제")
  );
}
