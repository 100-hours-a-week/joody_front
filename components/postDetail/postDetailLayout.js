import { h } from "../../vdom/Vdom.js";
import { PostInfo } from "./postInfo.js";
import { PostContent } from "./postContent.js";
import { PostStats } from "./postStats.js";
import { CommentInput } from "./commentInput.js";
import { CommentList } from "./commentList.js";
import { PostDeleteModal } from "./postDeleteModal.js";
import { CommentDeleteModal } from "./commentDeleteModal.js";

export default function PostDetailLayout() {
  return h(
    "div",
    { id: "post_page" },
    h(
      "div",
      { id: "post_container" },
      h("p", { id: "post_title" }),
      PostInfo(),
      PostContent(),
      PostStats()
    ),
    h("div", { id: "comments_container" }, CommentInput(), CommentList()),
    PostDeleteModal(),
    CommentDeleteModal()
  );
}
