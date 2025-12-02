import { h } from "../../vdom/Vdom.js";
import PostHeader from "../posts/postHeader.js";
import PostCreateForm from "./PostCreateForm.js";

export default function PostCreateView({ state, handlers }) {
  return h(
    "div",
    {},
    PostHeader({ backPath: "#/postlist" }),
    h("main", { id: "edit_container" }, PostCreateForm({ state, handlers }))
  );
}
