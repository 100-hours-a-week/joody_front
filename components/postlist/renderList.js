import { render } from "../../vdom/Vdom.js";
import PostListLayout from "./postListLayout.js";
import PostListView from "./postListView.js";
import { postState } from "../../state/postListState.js";

export function renderPage() {
  const app = document.getElementById("app");

  if (!app) return;

  // 기존 vnode/DOM 초기화 후 새로 렌더
  app.innerHTML = "";
  app._prevVNode = null;

  const vnode = PostListLayout();

  render(vnode, app);
}

export function renderPosts() {
  const postList = document.getElementById("post_list");
  if (!postList) return;

  const parent = postList.parentNode;

  const vnode = PostListView(postState.posts);

  // ⭐ postList 내부 style 제거
  const searchBox = document.getElementById("search_box");
  if (searchBox) searchBox.removeAttribute("style");

  // 📌 post_list 전체를 새로운 vnode로 교체
  const newContainer = document.createElement("div");
  newContainer.id = "post_list";
  parent.replaceChild(newContainer, postList);

  render(vnode, newContainer);
}
