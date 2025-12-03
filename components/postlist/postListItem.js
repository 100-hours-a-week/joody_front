import { formatNumber, truncate } from "../../utils/common.js";
import { p } from "../../vdom/Vdom.js";

export function PostListItem(post) {
  if (!post) return null;

  const handleCardClick = (id) => () => {
    location.hash = `#/postDetail?id=${id}`;
  };

  return p(
    "article",
    {
      key: post.id,
      className: "post-card",
      dataset: { id: post.id },
      onClick: handleCardClick(post.id),
    },
    p(
      "div",
      { className: "post-content" },
      p(
        "h3",
        { className: "post-title", key: `title-${post.id}` },
        truncate(post.title, 26)
      ),
      p(
        "div",
        { className: "post-stats" },
        p(
          "div",
          { className: "stats-left" },
          p(
            "div",
            { className: "stat-item" },
            p("img", {
              src: "../assets/img/like_on.svg",
              className: "stat-icon",
              alt: "좋아요",
            }),
            p(
              "span",
              { className: "stat-number" },
              formatNumber(post.likeCount)
            )
          ),
          p(
            "div",
            { className: "stat-item" },
            p("img", {
              src: "../assets/img/comment.svg",
              className: "stat-icon",
              alt: "댓글",
            }),
            p(
              "span",
              { className: "stat-number" },
              formatNumber(post.commentCount)
            )
          ),
          p(
            "div",
            { className: "stat-item" },
            p("img", {
              src: "../assets/img/view.svg",
              className: "stat-icon",
              alt: "조회수",
            }),
            p(
              "span",
              { className: "stat-number" },
              formatNumber(post.viewCount)
            )
          )
        ),
        p(
          "div",
          { className: "post-date" },
          post.createdAt
            ? post.createdAt.replace("T", " ").slice(0, 19)
            : ""
        )
      ),
      p(
        "div",
        { className: "post-author" },
        p("img", {
          className: "author-avatar",
          src: post.authorProfileImage
            ? post.authorProfileImage.startsWith("http")
              ? post.authorProfileImage
              : `http://localhost:8080${post.authorProfileImage}`
            : "./img/profile_1.jpeg",
        }),
        p("span", { className: "author-name" }, post.author || "익명")
      )
    )
  );
}
