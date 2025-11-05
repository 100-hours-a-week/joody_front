document.addEventListener("DOMContentLoaded", () => {
  const postModalOverlay = document.getElementById("post_modal_overlay");
  const postDeleteButton = document.getElementById("delete_button");

  const commentModalOverlay = document.getElementById("comment_modal_overlay");
  const commentDeleteButtons = document.querySelectorAll(
    ".delete_comment_button"
  );

  const cancelButtons = document.querySelectorAll(".cancel_button");
  const confirmButtons = document.querySelectorAll(".confirm_button");

  // 게시글 삭제 버튼 클릭 시 모달 열기
  postDeleteButton.addEventListener("click", () => {
    postModalOverlay.classList.remove("hidden");
  });

  // 댓글 삭제 버튼 클릭 시 모달 열기
  commentDeleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      commentModalOverlay.classList.remove("hidden");
    });
  });

  // 취소 버튼 클릭 시 닫기
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      postModalOverlay.classList.add("hidden");
      commentModalOverlay.classList.add("hidden");
    });
  });

  // 확인 버튼 클릭 시 닫기 + 알림 (이후 실제 삭제 로직 연결 가능)
  confirmButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      alert("삭제가 완료되었습니다.");
      postModalOverlay.classList.add("hidden");
      commentModalOverlay.classList.add("hidden");
    });
  });

  // 배경 클릭 시 닫기
  window.addEventListener("click", (e) => {
    if (e.target === postModalOverlay) postModalOverlay.classList.add("hidden");
    if (e.target === commentModalOverlay)
      commentModalOverlay.classList.add("hidden");
  });
});
