import {
  createComment,
  editComment,
  deleteCommentApi,
} from "../api/commentApi.js";

import { formatDate } from "../utils/common.js";
import { createCommentElement } from "../components/postDetail/createCommentElement.js";

export function setupCommentEvents(postId) {
  const input = document.getElementById("comment_input");
  const submitBtn = document.getElementById("submit_comment_button");
  const commentList = document.getElementById("comment_list");
  const countEl = document.getElementById("comment_count");

  let isEditing = false;
  let editingEl = null;
  let editingId = null;
  let targetToDelete = null;

  // 입력 UI 처리
  submitBtn.disabled = true;
  input.addEventListener("input", () => {
    const t = input.value.trim();
    submitBtn.disabled = t.length === 0;
    submitBtn.style.backgroundColor = t ? "#4baa7d" : "#d9d9d9";
  });

  // 댓글 등록 / 수정
  submitBtn.addEventListener("click", async () => {
    const text = input.value.trim();
    const userId = localStorage.getItem("userId");
    if (!text || !userId) return;

    // 수정 기능
    if (isEditing) {
      const { ok } = await editComment(postId, editingId, text);
      if (!ok) return alert("수정 실패");

      editingEl.textContent = text;

      const dateEl = editingEl
        .closest(".comment_item")
        .querySelector(".comment_date");

      dateEl.textContent = `${formatDate(new Date())} (수정됨)`;

      resetForm();
      return;
    }

    // 등록 기능
    const { ok, data } = await createComment(postId, userId, text);
    if (!ok) return;

    const newC = {
      id: data.comment_id,
      authorNickname: localStorage.getItem("nickname") || "익명",
      authorProfileImage:
        localStorage.getItem("profileImage") || "./img/profile.png",
      content: text,
      createdAt: new Date().toISOString(),
      authorId: Number(userId),
    };

    commentList.prepend(createCommentElement(newC));
    countEl.textContent = Number(countEl.textContent) + 1;

    resetForm();
  });

  function resetForm() {
    isEditing = false;
    editingEl = null;
    editingId = null;

    input.value = "";
    submitBtn.textContent = "댓글 등록";
    submitBtn.disabled = true;
    submitBtn.style.backgroundColor = "#d9d9d9";
  }

  // 리스트 클릭(수정, 삭제)
  commentList.addEventListener("click", (e) => {
    const item = e.target.closest(".comment_item");
    if (!item) return;

    const authorId = item.dataset.authorId;
    const currentId = localStorage.getItem("userId");

    // 수정
    if (e.target.classList.contains("edit_comment_button")) {
      if (String(authorId) !== String(currentId))
        return alert("본인 댓글만 수정할 수 있습니다.");

      isEditing = true;
      editingEl = item.querySelector(".comment_content");
      editingId = item.dataset.commentId;

      input.value = editingEl.textContent;
      submitBtn.textContent = "댓글 수정";
      submitBtn.disabled = false;
      submitBtn.style.backgroundColor = "#4baa7d";
      input.focus();
    }

    // 삭제
    if (e.target.classList.contains("delete_comment_button")) {
      if (String(authorId) !== String(currentId))
        return alert("본인 댓글만 삭제할 수 있습니다.");

      targetToDelete = item;
      document
        .getElementById("comment_modal_overlay")
        .classList.remove("hidden");
    }
  });

  // 삭제 모달 확인
  document
    .getElementById("comment_confirm_button")
    .addEventListener("click", async () => {
      if (!targetToDelete) return;

      const id = targetToDelete.dataset.commentId;

      const { ok } = await deleteCommentApi(postId, id);
      if (ok) {
        targetToDelete.remove();
        countEl.textContent = Math.max(0, countEl.textContent - 1);
      }

      document.getElementById("comment_modal_overlay").classList.add("hidden");
    });
}
