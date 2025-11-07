document.addEventListener("DOMContentLoaded", () => {
  const postModalOverlay = document.getElementById("post_modal_overlay");
  const postDeleteButton = document.getElementById("delete_button");
  const commentModalOverlay = document.getElementById("comment_modal_overlay");
  const commentDeleteButtons = document.querySelectorAll(
    ".delete_comment_button"
  );
  const cancelButtons = document.querySelectorAll(".cancel_button");
  const confirmButtons = document.querySelectorAll(".confirm_button");

  // === 💬 댓글 입력 활성화 / 비활성화 ===
  const commentInput = document.getElementById("comment_input");
  const submitButton = document.getElementById("submit_comment_button");
  // 댓글 리스트
  const commentList = document.getElementById("comment_list");

  // === 더미 게시글 데이터 ===
  const dummyPosts = [
    {
      id: 1,
      title: "첫 번째 게시글",
      author: "홍길동",
      date: "2025-11-05 12:00:00",
      image: "./img/post_img.jpeg",
      content: "이건 첫 번째 게시글의 내용입니다.",
      likes: 10,
      views: 100,
      comments: 5,
    },
    {
      id: 2,
      title: "두 번째 게시글",
      author: "임꺽정",
      date: "2025-11-06 09:30:00",
      image: "./img/post_img.jpeg",
      content: "두 번째 게시글 내용이 여기에 표시됩니다.",
      likes: 2000,
      views: 1500000,
      comments: 530,
    },
  ];

  // === URL에서 id 가져오기 ===
  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get("id"));

  document.getElementById("edit_button").addEventListener("click", () => {
    window.location.href = `postEdit.html?id=${postId}`;
  });

  // ✅ localStorage에서 수정된 게시글 불러오기
  const savedPost = JSON.parse(localStorage.getItem(`post_${postId}`));

  // === 게시글 찾기 ===
  let post = savedPost
    ? { ...dummyPosts.find((p) => p.id === postId), ...savedPost }
    : dummyPosts.find((p) => p.id === postId);
  if (!post) post = dummyPosts[0];

  // === DOM 데이터 넣기 ===
  document.getElementById("post_title").textContent = post.title;
  document.getElementById("post_author").textContent = post.author;
  document.getElementById("post_date").textContent = post.date;
  document.getElementById("post_image").src = `./img/${post.image}`;
  document.querySelector("#post_content p").textContent = post.content;
  document.getElementById("like_count").textContent = formatNumber(post.likes);
  document.getElementById("view_count").textContent = formatNumber(post.views);
  document.getElementById("comment_count").textContent = formatNumber(
    post.comments
  );

  // 🔒 body 스크롤 비활성화 함수
  function disableScroll() {
    document.body.style.overflow = "hidden";
  }

  //   // 🔓 body 스크롤 다시 활성화 함수
  function enableScroll() {
    document.body.style.overflow = "";
  }

  //   // 게시글 삭제 버튼 클릭 시 모달 열기
  postDeleteButton.addEventListener("click", () => {
    postModalOverlay.classList.remove("hidden");
    disableScroll(); // 🔒 추가
  });

  //   // 댓글 삭제 버튼 클릭 시 모달 열기
  commentDeleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      commentModalOverlay.classList.remove("hidden");
      disableScroll(); // 🔒 추가
    });
  });

  //   // 취소 버튼 클릭 시 닫기
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      postModalOverlay.classList.add("hidden");
      commentModalOverlay.classList.add("hidden");
      enableScroll(); // 🔓 추가
    });
  });

  //   // 확인 버튼 클릭 시 닫기 + 알림 (이후 실제 삭제 로직 연결 가능)
  confirmButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // alert("삭제가 완료되었습니다.");
      postModalOverlay.classList.add("hidden");
      commentModalOverlay.classList.add("hidden");
      enableScroll(); // 🔓 추가
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target === postModalOverlay || e.target === commentModalOverlay) {
      postModalOverlay.classList.add("hidden");
      commentModalOverlay.classList.add("hidden");
      enableScroll(); // 🔓 추가
    }
  });

  // === 🗑 댓글 삭제 기능 ===
  let targetCommentToDelete = null; // 삭제할 댓글을 임시로 저장

  // 댓글 삭제 버튼 클릭 시 → 모달 열기 + 대상 댓글 저장
  commentDeleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const commentItem = e.target.closest(".comment_item");
      targetCommentToDelete = commentItem; // 🔥 삭제 대상 저장

      commentModalOverlay.classList.remove("hidden");
      disableScroll(); // 🔒 스크롤 막기
    });
  });

  // 모달의 "확인" 버튼 클릭 시 → 댓글 삭제
  confirmButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (targetCommentToDelete) {
        targetCommentToDelete.remove(); // 🔥 실제 댓글 DOM 삭제
        targetCommentToDelete = null; // 초기화
      }

      // 모달 닫기 + 스크롤 복원
      postModalOverlay.classList.add("hidden");
      commentModalOverlay.classList.add("hidden");
      enableScroll();
    });
  });

  // 모달의 "취소" 버튼 클릭 시 → 모달 닫기
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      targetCommentToDelete = null; // 삭제 대상 초기화
      postModalOverlay.classList.add("hidden");
      commentModalOverlay.classList.add("hidden");
      enableScroll();
    });
  });

  // === ✅ 좋아요 버튼 토글 기능 ===
  const likeButton = document.getElementById("likes_section");
  const likeCountEl = document.getElementById("like_count");

  let liked = false;
  likeButton.style.backgroundColor = "#d9d9d9";

  likeButton.addEventListener("click", () => {
    if (!liked) {
      post.likes += 1;
      likeButton.style.backgroundColor = "#aca0eb";
      liked = true;
    } else {
      post.likes -= 1;
      likeButton.style.backgroundColor = "#d9d9d9";
      liked = false;
    }
    likeCountEl.textContent = formatNumber(post.likes);
  });

  // 초기 상태: 비활성화
  submitButton.disabled = true;
  submitButton.style.backgroundColor = "#aca0eb";

  // 입력 감지 이벤트
  commentInput.addEventListener("input", () => {
    const text = commentInput.value.trim();

    if (text.length > 0) {
      // ✅ 댓글 내용이 있을 때
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#7f6aee";
    } else {
      // 🚫 댓글 내용이 없을 때
      submitButton.disabled = true;
      submitButton.style.backgroundColor = "#aca0eb";
    }
  });

  // === 🧩 댓글 수정 기능 ===
  let isEditing = false; // 현재 수정 모드인지 여부
  let editingCommentElement = null; // 수정 중인 댓글 요소
  // 모든 "댓글 수정" 버튼에 이벤트 연결
  const editButtons = document.querySelectorAll(".edit_comment_button");

  // ✅ 댓글 클릭 이벤트 위임
  commentList.addEventListener("click", (e) => {
    const commentItem = e.target.closest(".comment_item");
    if (!commentItem) return;

    // ✏️ 수정 버튼
    if (e.target.classList.contains("edit_comment_button")) {
      const commentContent = commentItem.querySelector(".comment_content");
      isEditing = true;
      editingCommentElement = commentContent;
      commentInput.value = commentContent.textContent.trim();
      submitButton.textContent = "댓글 수정";
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#7f6aee";
      commentInput.focus();
    }
    // 🗑 삭제 버튼
    if (e.target.classList.contains("delete_comment_button")) {
      targetCommentToDelete = commentItem;
      commentModalOverlay.classList.remove("hidden");
      disableScroll();
    }
  });

  editButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const commentItem = e.target.closest(".comment_item");
      const commentContent = commentItem.querySelector(".comment_content");

      // 수정 모드로 전환
      isEditing = true;
      editingCommentElement = commentContent;

      // 입력창에 기존 내용 넣기
      commentInput.value = commentContent.textContent.trim();

      // 버튼 텍스트 변경
      submitButton.textContent = "댓글 수정";
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#7f6aee";

      // 입력창 포커스
      commentInput.focus();
    });
  });

  // === 댓글 등록/수정 공통 처리 ===
  submitButton.addEventListener("click", () => {
    const text = commentInput.value.trim();
    if (text === "") return;

    if (isEditing && editingCommentElement) {
      // ✅ 수정 모드일 때 → 기존 댓글 내용 변경
      editingCommentElement.textContent = text;

      // 초기화
      isEditing = false;
      editingCommentElement = null;
      submitButton.textContent = "댓글 등록";
    } else {
      // ✅ 등록 모드일 때 → 새 댓글 추가 (임시 로직)
      const newComment = document.createElement("div");
      newComment.classList.add("comment_item");
      newComment.innerHTML = `
        <img class="comment_author_img" src="./img/profile_1.jpeg" alt="작성자 프로필 이미지" />
        <div class="comment_body">
          <div class="comment_header">
            <div class="comment_info">
              <p class="comment_author">새 작성자</p>
              <p class="comment_date">${new Date().toLocaleString()}</p>
            </div>
            <div class="comment_buttons">
              <button class="edit_comment_button">수정</button>
              <button class="delete_comment_button">삭제</button>
            </div>
          </div>
          <p class="comment_content">${text}</p>
        </div>
      `;
      commentList.appendChild(newComment);
      // alert("댓글이 등록되었습니다!");
    }

    // 입력창 리셋
    commentInput.value = "";
    submitButton.disabled = true;
    submitButton.style.backgroundColor = "#aca0eb";
  });
});

// === 숫자 단위 변환 함수 ===
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return Math.floor(num / 1_000) + "K";
  return num;
}
