import { h } from "../../vdom/Vdom.js";

export function PostContent() {
  return h(
    "div",
    { id: "post_content" },
    h("img", { id: "post_image", src: "", alt: "게시글 이미지" }),
    h("p")
  );
}
