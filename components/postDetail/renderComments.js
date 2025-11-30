import { createCommentElement } from "./createCommentElement.js";

export function renderComments(comments) {
  const commentList = document.getElementById("comment_list");
  commentList.innerHTML = "";

  const fragment = document.createDocumentFragment();

  comments.forEach((c) => {
    fragment.appendChild(createCommentElement(c));
  });

  commentList.appendChild(fragment);
}
