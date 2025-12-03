import { h } from "../../vdom/Vdom.js";

export function PostStats() {
  return h(
    "div",
    { id: "post_infos" },
    h(
      "div",
      { className: "stat_item", id: "like_stat" },
      h("img", {
        src: "./assets/img/like_off.svg",
        className: "stat_icon",
        id: "like_icon",
      }),
      h("span", { id: "like_count", className: "stat_number" })
    ),
    h(
      "div",
      { className: "stat_item" },
      h("img", { src: "./assets/img/comment.svg", className: "stat_icon" }),
      h("span", { id: "comment_count", className: "stat_number" })
    ),
    h(
      "div",
      { className: "stat_item" },
      h("img", { src: "./assets/img/view.svg", className: "stat_icon" }),
      h("span", { id: "view_count", className: "stat_number" })
    )
  );
}
