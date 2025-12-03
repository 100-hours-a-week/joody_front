import { PostListItem } from "./postListItem.js";
import { p } from "../../vdom/Vdom.js";

export default function PostListView(posts) {
  const safePosts = Array.isArray(posts) ? posts : [];

  return p(
    "div",
    {},
    safePosts.map((post) => PostListItem(post)).filter(Boolean)
  );
}
