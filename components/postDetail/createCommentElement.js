import { formatDate, canEditComment } from "../../utils/common.js";

export function createCommentElement(c) {
  const avatar = c.authorProfileImage
    ? c.authorProfileImage.startsWith("http")
      ? c.authorProfileImage
      : `http://localhost:8080${c.authorProfileImage}`
    : "./img/original_profile.png";

  const el = document.createElement("div");
  el.classList.add("comment_item");
  el.dataset.commentId = c.id;
  el.dataset.authorId = c.authorId;

  const editable = canEditComment(c.authorId);

  const dateText =
    c.updatedAt && c.updatedAt !== c.createdAt
      ? `${formatDate(c.updatedAt)} (수정됨)`
      : formatDate(c.createdAt);

  el.innerHTML = `
    <img class="comment_author_img" src="${avatar}">
    <div class="comment_body">
      <div class="comment_header">
        <div class="comment_info">
          <p class="comment_author">${
            c.authorNickname || c.author || "익명"
          }</p>
          <p class="comment_date">${dateText}</p>
        </div>
        <div class="comment_buttons">
          <button class="edit_comment_button" style="display:${
            editable ? "block" : "none"
          }">수정</button>
          <button class="delete_comment_button" style="display:${
            editable ? "block" : "none"
          }">삭제</button>
        </div>
      </div>
      <p class="comment_content">${c.content}</p>
    </div>
  `;

  return el;
}
