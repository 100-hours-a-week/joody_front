import { formatNumber, formatDate } from "../../utils/common.js";
import { canEditPost } from "../../utils/common.js";

export function renderPost(post) {
  document.getElementById("post_title").textContent = post.title;
  document.getElementById("post_author").textContent = post.author;
  document.getElementById("post_date").textContent = formatDate(post.createdAt);

  const postImage = document.getElementById("post_image");

  if (post.postImage) {
    postImage.src = post.postImage.startsWith("http")
      ? post.postImage
      : `http://localhost:8080/${post.postImage.replace(/^\/+/, "")}`;
    postImage.style.display = "block";
  } else {
    postImage.style.display = "none";
  }

  // ⭐ 작성자 프로필 이미지 추가
  const authorImg = document.getElementById("post_author_img");
  if (post.authorProfileImage) {
    authorImg.src = post.authorProfileImage.startsWith("http")
      ? post.authorProfileImage
      : `http://localhost:8080${post.authorProfileImage}`;
  } else {
    authorImg.src = "./img/original_profile.png";
  }

  document.querySelector("#post_content p").textContent = post.content;
  document.getElementById("like_count").textContent = formatNumber(post.likes);
  document.getElementById("view_count").textContent = formatNumber(post.views);
  document.getElementById("comment_count").textContent = formatNumber(
    post.commentCount
  );

  const editable = canEditPost(post.authorId);
  document.getElementById("edit_button").style.display = editable
    ? "flex"
    : "none";
  document.getElementById("delete_button").style.display = editable
    ? "flex"
    : "none";
}
