import { deletePostApi } from "../api/postApi.js";

export function setupPostEvents(postId) {
  // ⭐ 게시글 수정 버튼 이벤트
  const editBtn = document.getElementById("edit_button");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      location.hash = `#/postEdit?id=${postId}`;
    });
  }

  // ⭐ 게시글 삭제 버튼 → 모달 오픈
  const deleteBtn = document.getElementById("delete_button");
  const postModal = document.getElementById("post_modal_overlay");
  if (deleteBtn && postModal) {
    deleteBtn.addEventListener("click", () => {
      postModal.classList.remove("hidden");
    });
  }

  // ⭐ 게시글 삭제 버튼 이벤트
  const confirmDeleteBtn = document.querySelector(
    "#post_modal_overlay .confirm_button"
  );

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      const { ok } = await deletePostApi(postId);
      postModal?.classList.add("hidden");
      if (ok) window.location.href = "#/postlist";
    });
  }
}
