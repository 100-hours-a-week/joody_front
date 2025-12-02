import { h } from "../../vdom/Vdom.js";
import PostHeader from "../posts/postHeader.js";
import PostEditForm from "./PostEditForm.js";

export default function PostEditView({ state, handlers }) {
  return h(
    "div",
    {},
    PostHeader({ backPath: `#/postDetail?id=${state.postId}` }),
    h("main", { id: "edit_container" }, PostEditForm({ state, handlers }))
  );
}
