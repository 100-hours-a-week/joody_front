const profileImg = document.getElementById("profile_img");
const dropdownMenu = document.getElementById("dropdown_menu");

// 프로필 이미지 드롭다운
profileImg.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});
// 바깥 클릭 시 드롭다운 닫기
window.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-menu")) {
    dropdownMenu.classList.add("hidden");
  }
});

async function loadUserProfile() {
  try {
    const userId = localStorage.getItem("userId"); // ✅ 로그인 시 저장해둬야 함

    if (!userId) {
      console.warn("로그인된 사용자 ID가 없습니다.");
      return;
    }

    const res = await fetch(`http://localhost:8080/users/${userId}/profile`);
    const json = await res.json();

    // console.log(json.data.profileImage);

    if (json.message === "read_success") {
      const imgUrl = json.data.profileImage;

      profileImg.src = imgUrl
        ? imgUrl.startsWith("http")
          ? imgUrl
          : `http://localhost:8080${imgUrl}`
        : "./img/profile.png";
    }
  } catch (err) {
    console.error("프로필 불러오기 실패:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile(); // ✅ 동적 userId 사용

  const postModalOverlay = document.getElementById("post_modal_overlay");
  const postDeleteButton = document.getElementById("delete_button");
  const commentModalOverlay = document.getElementById("comment_modal_overlay");

  const cancelButtons = document.querySelectorAll(".cancel_button");
  const confirmButtons = document.querySelectorAll(".confirm_button");

  const comment_deletebtn = document.getElementById("comment_confirm_button");

  // === 💬 댓글 입력 활성화 / 비활성화 ===
  const commentInput = document.getElementById("comment_input");
  const submitButton = document.getElementById("submit_comment_button");
  // 댓글 리스트
  const commentList = document.getElementById("comment_list");

  // === URL에서 postId 가져오기 ===
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  if (!postId) {
    alert("잘못된 접근입니다.");
    window.location.href = "postList.html";
    return;
  }

  // === ✨ 댓글 목록 불러오기 ===
  async function loadComments() {
    console.log("🔥 loadComments 실행됨");

    try {
      const response = await fetch(
        `http://localhost:8080/posts/${postId}/comments`
      );
      const result = await response.json();

      console.log("🧩 댓글 API 응답:", result);

      if (!response.ok)
        throw new Error(result.message || "댓글 목록 조회 실패");

      // ✅ 진짜 댓글 데이터는 여기!
      const comments = result.data?.content || [];

      console.log("✅ 실제 댓글 배열:", comments);

      // ✅ 댓글 리스트 비우기
      commentList.innerHTML = "";

      // ✅ 댓글 렌더링
      comments.forEach((comment) => {
        const createdAt = comment.createdAt
          ? formatDate(comment.createdAt)
          : "-";

        const newComment = document.createElement("div");
        newComment.classList.add("comment_item");
        // ✅ 댓글 ID 저장 (수정/삭제 때 사용)
        newComment.dataset.commentId = comment.id;

        newComment.innerHTML = `
        <img class="comment_author_img" src="./img/profile_1.jpeg" alt="작성자 프로필 이미지" />
        <div class="comment_body">
          <div class="comment_header">
            <div class="comment_info">
              <p class="comment_author">${comment.author || "익명"}</p>
              <p class="comment_date">${createdAt}</p>
            </div>
            <div class="comment_buttons">
              <button class="edit_comment_button">수정</button>
              <button class="delete_comment_button">삭제</button>
            </div>
          </div>
          <p class="comment_content">${comment.content}</p>
        </div>
      `;
        commentList.appendChild(newComment);
      });

      // ✅ 댓글 개수 업데이트
      const commentCountEl = document.getElementById("comment_count");
      const totalCount = result.data?.totalElements || comments.length;
      commentCountEl.textContent = formatNumber(totalCount);
    } catch (err) {
      console.error("댓글 목록 불러오기 실패:", err);
    }
  }

  // 수정 버튼 누르면 수정하기 페이지
  document.getElementById("edit_button").addEventListener("click", () => {
    window.location.href = `postEdit.html?id=${postId}`;
  });

  // === ✨ 게시글 상세 데이터 가져오기 ===
  try {
    const response = await fetch(`http://localhost:8080/posts/${postId}`);
    const result = await response.json();

    if (!response.ok)
      throw new Error(result.message || "게시글을 불러오지 못했습니다.");

    const post = result.data; // ✅ 백엔드 ApiResponse 구조 → data 안에 detail 들어있음
    const imageUrl = post.postImage
      ? post.postImage.startsWith("http")
        ? post.postImage
        : `http://localhost:8080/${post.postImage.replace(/^\/+/, "")}`
      : "";

    console.log(post);

    // === DOM에 데이터 표시 ===
    document.getElementById("post_title").textContent = post.title;
    document.getElementById("post_author").textContent =
      post.authorNickname || "작성자";
    document.getElementById("post_date").textContent = formatDate(
      post.createdAt
    );
    document.getElementById("post_image").src = `${imageUrl}?t=${Date.now()}`;
    document.querySelector("#post_content p").textContent = post.content;
    document.getElementById("like_count").textContent = formatNumber(
      post.likes
    );
    document.getElementById("view_count").textContent = formatNumber(
      post.views
    );
    document.getElementById("comment_count").textContent = formatNumber(
      post.commentCount
    );

    // ✅ 여기서 댓글 목록 호출
    await loadComments();
  } catch (err) {
    console.error("게시글 상세 조회 실패:", err);
    alert("게시글을 불러오는 중 오류가 발생했습니다.");
  }

  // === ❤️ 좋아요 버튼 토글 기능 ===
  const likeButton = document.getElementById("likes_section");
  const likeCountEl = document.getElementById("like_count");

  // ✅ localStorage에서 liked 여부 확인
  const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
  let liked = likedPosts.includes(Number(postId));

  // 초기 색상 설정
  likeButton.style.backgroundColor = liked ? "#aca0eb" : "#d9d9d9";

  likeButton.addEventListener("click", async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      // ✅ 백엔드에 좋아요 토글 요청
      const response = await fetch(
        `http://localhost:8080/posts/${postId}/likes/toggle?userId=${userId}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "좋아요 요청 실패");

      const data = result.data;
      liked = data.liked;
      const likeCount = data.like_count;

      // ✅ UI 즉시 반영
      likeButton.style.backgroundColor = liked ? "#aca0eb" : "#d9d9d9";
      likeCountEl.textContent = formatNumber(likeCount);

      // ✅ localStorage 업데이트 (이게 핵심!!)
      let likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
      if (liked && !likedPosts.includes(Number(postId))) {
        likedPosts.push(Number(postId)); // 추가
      } else if (!liked) {
        likedPosts = likedPosts.filter((id) => id !== Number(postId)); // 제거
      }
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    } catch (err) {
      console.error("좋아요 토글 실패:", err);
      alert("좋아요 처리 중 오류가 발생했습니다.");
    }
  });

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

  // 취소 버튼 클릭 시 닫기
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      postModalOverlay.classList.add("hidden");
      commentModalOverlay.classList.add("hidden");
      enableScroll(); // 🔓 추가
    });
  });

  // === 🗑 게시글 삭제 모달 "확인" 버튼 클릭 시 ===
  confirmButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      // 게시글 삭제 버튼에서 열린 모달인 경우만 처리
      if (e.target.closest("#post_modal_overlay")) {
        try {
          const response = await fetch(
            `http://localhost:8080/posts/${postId}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message || "게시글 삭제 실패");
          }

          // alert("게시글이 성공적으로 삭제되었습니다.");
          window.location.href = "postList.html"; // ✅ 삭제 후 게시글 목록으로 이동
        } catch (err) {
          console.error("게시글 삭제 실패:", err);
          alert("게시글 삭제 중 오류가 발생했습니다.");
        }
      }

      // 댓글 삭제 모달은 기존 로직 유지
      if (e.target.closest("#comment_modal_overlay")) {
        if (targetCommentToDelete) {
          targetCommentToDelete.remove();
          targetCommentToDelete = null;
        }
      }

      // 모달 닫기 + 스크롤 복원
      postModalOverlay.classList.add("hidden");
      commentModalOverlay.classList.add("hidden");
      enableScroll();
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target === postModalOverlay || e.target === commentModalOverlay) {
      postModalOverlay.classList.add("hidden");
      commentModalOverlay.classList.add("hidden");
      enableScroll(); // 🔓 추가
    }
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

  // ✅ 댓글 클릭 이벤트 위임
  commentList.addEventListener("click", async (e) => {
    const commentItem = e.target.closest(".comment_item");
    if (!commentItem) return;

    // ✏️ 수정 버튼 클릭 시
    if (e.target.classList.contains("edit_comment_button")) {
      const commentItem = e.target.closest(".comment_item");
      const commentId = commentItem.dataset.commentId; // ✅ 여기서 가져옴
      const commentContent = commentItem.querySelector(".comment_content");

      isEditing = true;
      editingCommentElement = commentContent;
      editingCommentId = commentId; // ✅ 저장

      commentInput.value = commentContent.textContent.trim();
      submitButton.textContent = "댓글 수정";
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#7f6aee";
      commentInput.focus();
      disableScroll();
    }
  });

  // === 🧩 댓글 등록 & 수정 통합 기능 ===
  let isEditing = false;
  let editingCommentElement = null;
  let editingCommentId = null;

  submitButton.addEventListener("click", async () => {
    const text = commentInput.value.trim();
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!text) return alert("댓글 내용을 입력해주세요.");

    try {
      // ✅ 수정 모드일 때
      if (isEditing && editingCommentId) {
        const response = await fetch(
          `http://localhost:8080/posts/${postId}/comments/${editingCommentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: text }),
          }
        );

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "댓글 수정 실패");

        // ✅ UI 업데이트 (기존 내용 교체)
        editingCommentElement.textContent = text;

        // 초기화
        isEditing = false;
        editingCommentElement = null;
        editingCommentId = null;
        submitButton.textContent = "댓글 등록";
        commentInput.value = "";
        submitButton.disabled = true;
        submitButton.style.backgroundColor = "#aca0eb";
        enableScroll();
        return; // ✅ 수정일 때는 여기서 끝
      }

      // ✅ 등록 모드일 때 (기존 등록 로직 유지)
      const response = await fetch(
        `http://localhost:8080/posts/${postId}/comments/${userId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "댓글 등록 실패");

      const comment = {
        id: result.data.comment_id, // ✅ 새 댓글 ID
        authorNickname: localStorage.getItem("nickname") || "익명",
        content: text,
        createdAt: new Date().toISOString(),
      };

      const newComment = document.createElement("div");
      newComment.classList.add("comment_item");
      newComment.dataset.commentId = comment.id; // ✅ dataset 저장

      newComment.innerHTML = `
      <img class="comment_author_img" src="./img/profile_1.jpeg" alt="작성자 프로필 이미지" />
      <div class="comment_body">
        <div class="comment_header">
          <div class="comment_info">
            <p class="comment_author">${comment.authorNickname}</p>
            <p class="comment_date">${formatDate(comment.createdAt)}</p>
          </div>
          <div class="comment_buttons">
            <button class="edit_comment_button">수정</button>
            <button class="delete_comment_button">삭제</button>
          </div>
        </div>
        <p class="comment_content">${comment.content}</p>
      </div>
    `;
      commentList.prepend(newComment);

      // 입력창 초기화
      commentInput.value = "";
      submitButton.disabled = true;
      submitButton.style.backgroundColor = "#aca0eb";

      // ✅ 댓글 개수 갱신
      const commentCountEl = document.getElementById("comment_count");
      const currentCount = parseInt(commentCountEl.textContent) || 0;
      commentCountEl.textContent = formatNumber(currentCount + 1);
    } catch (err) {
      console.error("댓글 처리 실패:", err);
      alert("댓글 처리 중 오류가 발생했습니다.");
    }
  });

  // === 🗑 댓글 삭제 기능 ===
  let targetCommentToDelete = null;

  // ✅ 댓글 삭제 버튼 클릭 시 → 모달 열기 + 대상 댓글 저장
  commentList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete_comment_button")) {
      targetCommentToDelete = e.target.closest(".comment_item");
      commentModalOverlay.classList.remove("hidden");
      disableScroll(); // 🔒 스크롤 막기
    }
  });

  // ✅ 모달 "확인" 버튼 클릭 시 → DELETE 요청
  comment_deletebtn.addEventListener("click", async (e) => {
    // ✅ 댓글 삭제 모달 확인 버튼인 경우
    if (!commentModalOverlay.classList.contains("hidden")) {
      if (!targetCommentToDelete) return; // 대상 댓글 없으면 종료

      const commentId = targetCommentToDelete.dataset.commentId;
      console.log("삭제할 commentId:", commentId); // ✅ 확인용

      try {
        const response = await fetch(
          `http://localhost:8080/posts/${postId}/comments/${commentId}`,
          { method: "DELETE" }
        );

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "댓글 삭제 실패");

        // ✅ UI 제거
        targetCommentToDelete.remove();
        targetCommentToDelete = null;

        // ✅ 댓글 개수 갱신
        const commentCountEl = document.getElementById("comment_count");
        const currentCount = parseInt(commentCountEl.textContent) || 0;
        commentCountEl.textContent = formatNumber(
          Math.max(currentCount - 1, 0)
        );
      } catch (err) {
        console.error("댓글 삭제 실패:", err);
        alert("댓글 삭제 중 오류가 발생했습니다.");
      }
    }

    // ✅ 모달 닫기 & 스크롤 복원 (공통)
    postModalOverlay.classList.add("hidden");
    commentModalOverlay.classList.add("hidden");
    enableScroll();
  });
});

// ✅ 모달 “취소” 버튼 클릭 시 → 닫기
cancelButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    targetCommentToDelete = null;
    commentModalOverlay.classList.add("hidden");
    enableScroll();
  });
});

// === 숫자 단위 변환 함수 ===
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return Math.floor(num / 1_000) + "K";
  return num;
}

// === 날짜 포맷 변환 ===
function formatDate(dateTime) {
  if (!dateTime) return "-";
  const date = new Date(dateTime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
