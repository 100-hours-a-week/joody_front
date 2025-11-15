/*************************************
 * 1. 전역 변수 & 공통 DOM 캐싱
 *************************************/
let postId;
let postModalOverlay, commentModalOverlay;
let postDeleteButton, commentDeleteButton;
let commentList, commentInput, submitButton;
let commentCountEl;

/*************************************
 * 2. 초기 실행부
 *************************************/
document.addEventListener("DOMContentLoaded", async () => {
  await initializePostView();
});

/*************************************
 * 3. 초기화 함수
 *************************************/
async function initializePostView() {
  cacheDOM();
  setupProfileDropdown();
  setupEventListeners();
  await loadUserProfile();
  await fetchAndRenderPost();
  await loadComments();
}

/*************************************
 * 4. DOM 캐싱
 *************************************/
function cacheDOM() {
  postModalOverlay = document.getElementById("post_modal_overlay");
  commentModalOverlay = document.getElementById("comment_modal_overlay");

  postDeleteButton = document.getElementById("delete_button");
  commentDeleteButton = document.getElementById("comment_confirm_button");

  commentList = document.getElementById("comment_list");
  commentInput = document.getElementById("comment_input");
  submitButton = document.getElementById("submit_comment_button");
  commentCountEl = document.getElementById("comment_count");

  // URL 파라미터에서 postId 추출
  const params = new URLSearchParams(window.location.search);
  postId = params.get("id");

  if (!postId) {
    alert("잘못된 접근입니다.");
    window.location.href = "postList.html";
  }
}

/*************************************
 * 5. 프로필 이미지 드롭다운
 *************************************/
function setupProfileDropdown() {
  const profileImg = document.getElementById("profile_img");
  const dropdownMenu = document.getElementById("dropdown_menu");

  profileImg.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
  });

  window.addEventListener("click", (e) => {
    if (!e.target.closest(".profile-menu")) {
      dropdownMenu.classList.add("hidden");
    }
  });
}

/*************************************
 * 6. 이벤트 리스너 묶음
 *************************************/
function setupEventListeners() {
  setupPostEditEvent();
  setupLikeEvent();
  setupCommentInputEvent();
  setupCommentSubmitEvent();
  setupCommentListEvent();
  setupDeleteModalEvents();
}

/*************************************
 * 7. 게시글 수정 버튼 클릭 시 이동
 *************************************/
function setupPostEditEvent() {
  document.getElementById("edit_button").addEventListener("click", () => {
    window.location.href = `postEdit.html?id=${postId}`;
  });
}

/*************************************
 * 8. 좋아요 기능
 *************************************/
function setupLikeEvent() {
  const likeButton = document.getElementById("like_stat");
  const likeIcon = document.getElementById("like_icon");

  let likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
  let liked = likedPosts.includes(Number(postId));

  likeIcon.src = liked ? "./img/like_on.svg" : "./img/like_off.svg";

  likeButton.addEventListener("click", async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("로그인이 필요합니다.");

    try {
      const response = await fetch(
        `http://localhost:8080/posts/${postId}/likes/toggle?userId=${userId}`,
        { method: "POST" }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      liked = result.data.liked;
      const likeCount = result.data.like_count;

      likeIcon.src = liked ? "./img/like_on.svg" : "./img/like_off.svg";
      document.getElementById("like_count").textContent =
        formatNumber(likeCount);

      // localStorage 업데이트
      if (liked && !likedPosts.includes(Number(postId))) {
        likedPosts.push(Number(postId));
      } else {
        likedPosts = likedPosts.filter((id) => id !== Number(postId));
      }
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    } catch (e) {
      console.error("좋아요 실패:", e);
    }
  });
}

/*************************************
 * 9. 게시글 상세 조회 + 렌더링
 *************************************/
async function fetchAndRenderPost() {
  try {
    const response = await fetch(`http://localhost:8080/posts/${postId}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    const post = result.data;
    renderPost(post);
  } catch (error) {
    console.error("게시글 조회 실패:", error);
  }
}

function renderPost(post) {
  document.getElementById("post_title").textContent = post.title;
  document.getElementById("post_author").textContent = post.author;
  document.getElementById("post_date").textContent = formatDate(post.createdAt);

  const postImageElement = document.getElementById("post_image");
  if (post.postImage) {
    const url = post.postImage.startsWith("http")
      ? post.postImage
      : `http://localhost:8080/${post.postImage.replace(/^\/+/, "")}`;
    postImageElement.src = url + `?t=${Date.now()}`;
    postImageElement.style.display = "block";
  } else {
    postImageElement.style.display = "none";
  }

  document.getElementById("post_author_img").src =
    post.authorProfileImage?.startsWith("http")
      ? post.authorProfileImage
      : `http://localhost:8080${post.authorProfileImage}`;

  document.querySelector("#post_content p").textContent = post.content;
  document.getElementById("like_count").textContent = formatNumber(post.likes);
  document.getElementById("view_count").textContent = formatNumber(post.views);
  document.getElementById("comment_count").textContent = formatNumber(
    post.commentCount
  );
}

/*************************************
 * 10. 댓글 불러오기 & 렌더링
 *************************************/
async function loadComments() {
  try {
    const response = await fetch(
      `http://localhost:8080/posts/${postId}/comments`
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    const comments = result.data?.content || [];
    renderComments(comments);

    // document.getElementById("comment_count").textContent = formatNumber(
    //   result.data.totalElements
    // );
    commentCountEl.textContent = formatNumber(result.data.totalElements);
  } catch (e) {
    console.error("댓글 조회 실패:", e);
  }
}
/*************************************
 * DocumentFragment 적용한 댓글 렌더링
 *************************************/
function renderComments(comments) {
  commentList.innerHTML = "";

  const fragment = document.createDocumentFragment();

  comments.forEach((comment) => {
    const el = createCommentElement(comment);
    fragment.appendChild(el);
  });

  commentList.appendChild(fragment);
}

/*************************************
 * 개별 댓글 DOM 생성 함수
 *************************************/
function createCommentElement(comment) {
  const avatar = comment.authorProfileImage
    ? comment.authorProfileImage.startsWith("http")
      ? comment.authorProfileImage
      : `http://localhost:8080${comment.authorProfileImage}`
    : "./img/original_profile.png";

  const dateText =
    comment.updatedAt && comment.updatedAt !== comment.createdAt
      ? `${formatDate(comment.updatedAt)} (수정됨)`
      : formatDate(comment.createdAt);

  const nickname = comment.authorNickname || comment.author || "익명";

  const newComment = document.createElement("div");
  newComment.classList.add("comment_item");
  newComment.dataset.commentId = comment.id;

  newComment.innerHTML = `
    <img class="comment_author_img" src="${avatar}" />
    <div class="comment_body">
      <div class="comment_header">
        <div class="comment_info">
          <p class="comment_author">${nickname}</p>
          <p class="comment_date">${dateText}</p>
        </div>
        <div class="comment_buttons">
          <button class="edit_comment_button">수정</button>
          <button class="delete_comment_button">삭제</button>
        </div>
      </div>
      <p class="comment_content">${comment.content}</p>
    </div>
  `;

  return newComment;
}

/*************************************
 * 11. 댓글 입력 활성화
 *************************************/
function setupCommentInputEvent() {
  submitButton.disabled = true;
  submitButton.style.backgroundColor = "#d9d9d9";

  commentInput.addEventListener("input", () => {
    const text = commentInput.value.trim();

    if (text.length > 0) {
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#4baa7d";
    } else {
      submitButton.disabled = true;
      submitButton.style.backgroundColor = "#d9d9d9";
    }
  });
}

// function renderComments(comments) {
//   commentList.innerHTML = "";
//   comments.forEach(renderCommentItem);
// }

// function renderCommentItem(comment) {
//   const avatar = comment.authorProfileImage
//     ? comment.authorProfileImage.startsWith("http")
//       ? comment.authorProfileImage
//       : `http://localhost:8080${comment.authorProfileImage}`
//     : "./img/original_profile.png";

//   const dateText =
//     comment.updatedAt && comment.updatedAt !== comment.createdAt
//       ? `${formatDate(comment.updatedAt)} (수정됨)`
//       : formatDate(comment.createdAt);

//   const newComment = document.createElement("div");
//   newComment.classList.add("comment_item");
//   newComment.dataset.commentId = comment.id;

//   const nickname = comment.authorNickname || comment.author || "익명";

//   newComment.innerHTML = `
//     <img class="comment_author_img" src="${avatar}" />
//     <div class="comment_body">
//       <div class="comment_header">
//         <div class="comment_info">
//           <p class="comment_author">${nickname}</p>
//           <p class="comment_date">${dateText}</p>
//         </div>
//         <div class="comment_buttons">
//           <button class="edit_comment_button">수정</button>
//           <button class="delete_comment_button">삭제</button>
//         </div>
//       </div>
//       <p class="comment_content">${comment.content}</p>
//     </div>
//   `;

//   commentList.prepend(newComment);
// }

/*************************************
 * 12. 댓글 등록 & 수정 이벤트
 *************************************/
let isEditing = false;
let editingCommentElement = null;
let editingCommentId = null;

function setupCommentSubmitEvent() {
  submitButton.addEventListener("click", async () => {
    const text = commentInput.value.trim();
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("로그인이 필요합니다.");

    if (!text) return alert("댓글 내용을 입력해주세요.");

    if (isEditing) {
      await submitCommentEdit(text);
    } else {
      await submitCommentCreate(text, userId);
    }
  });
}

async function submitCommentEdit(text) {
  try {
    const response = await fetch(
      `http://localhost:8080/posts/${postId}/comments/${editingCommentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    editingCommentElement.textContent = text;

    const dateEl = editingCommentElement
      .closest(".comment_item")
      .querySelector(".comment_date");
    dateEl.textContent = `${formatDate(new Date())} (수정됨)`;

    resetCommentForm();
  } catch (e) {
    console.error("댓글 수정 실패:", e);
  }
}

async function submitCommentCreate(text, userId) {
  try {
    const response = await fetch(
      `http://localhost:8080/posts/${postId}/comments/${userId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    const newComment = {
      id: result.data.comment_id,
      authorNickname: localStorage.getItem("nickname") || "익명",
      authorProfileImage:
        localStorage.getItem("profileImage") || "./img/profile.png",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const element = createCommentElement(newComment);
    commentList.prepend(element);

    resetCommentForm();

    // 댓글 수 증가
    // const countEl = document.getElementById("comment_count");
    // countEl.textContent = formatNumber(parseInt(countEl.textContent) + 1);
    commentCountEl.textContent = formatNumber(
      parseInt(commentCountEl.textContent) + 1
    );
  } catch (e) {
    console.error("댓글 등록 실패:", e);
  }
}

function resetCommentForm() {
  isEditing = false;
  editingCommentId = null;
  editingCommentElement = null;

  commentInput.value = "";
  submitButton.textContent = "댓글 등록";
  submitButton.disabled = true;
  submitButton.style.backgroundColor = "#d9d9d9";
}

/*************************************
 * 13. 댓글 수정/삭제 버튼 클릭 처리
 *************************************/
let targetCommentToDelete = null;

function setupCommentListEvent() {
  commentList.addEventListener("click", (e) => {
    const commentItem = e.target.closest(".comment_item");
    if (!commentItem) return;

    // 수정
    if (e.target.classList.contains("edit_comment_button")) {
      const contentEl = commentItem.querySelector(".comment_content");
      editingCommentElement = contentEl;
      editingCommentId = commentItem.dataset.commentId;

      isEditing = true;
      commentInput.value = contentEl.textContent.trim();
      submitButton.textContent = "댓글 수정";
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#4baa7d";
      commentInput.focus();
    }

    // 삭제
    if (e.target.classList.contains("delete_comment_button")) {
      targetCommentToDelete = commentItem;
      commentModalOverlay.classList.remove("hidden");
      disableScroll();
    }
  });
}

/*************************************
 * 14. 삭제 모달 이벤트
 *************************************/
function setupDeleteModalEvents() {
  const cancelButtons = document.querySelectorAll(".cancel_button");

  // 게시글 삭제 모달 열기
  postDeleteButton.addEventListener("click", () => {
    postModalOverlay.classList.remove("hidden");
    disableScroll();
  });

  // 모달 취소 버튼
  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => closeModals());
  });

  // 게시글 삭제 확인
  document
    .querySelector("#post_modal_overlay .confirm_button")
    .addEventListener("click", deletePost);

  // 댓글 삭제 확인
  commentDeleteButton.addEventListener("click", deleteComment);

  // 모달 바깥 클릭 → 닫기
  window.addEventListener("click", (e) => {
    if (e.target === postModalOverlay || e.target === commentModalOverlay) {
      closeModals();
    }
  });
}

async function deletePost() {
  try {
    const response = await fetch(`http://localhost:8080/posts/${postId}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    window.location.href = "postList.html";
  } catch (e) {
    console.error("게시글 삭제 실패:", e);
  }
}

async function deleteComment() {
  if (!targetCommentToDelete) return;

  const commentId = targetCommentToDelete.dataset.commentId;

  try {
    const response = await fetch(
      `http://localhost:8080/posts/${postId}/comments/${commentId}`,
      { method: "DELETE" }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    targetCommentToDelete.remove();
    targetCommentToDelete = null;

    // 댓글 수 감소
    // const countEl = document.getElementById("comment_count");
    // countEl.textContent = Math.max(0, countEl.textContent - 1);
    commentCountEl.textContent = Math.max(0, commentCountEl.textContent - 1);
  } catch (e) {
    console.error("댓글 삭제 실패:", e);
  }

  closeModals();
}

/*************************************
 * 15. 모달 & 스크롤 유틸
 *************************************/
function closeModals() {
  postModalOverlay.classList.add("hidden");
  commentModalOverlay.classList.add("hidden");
  enableScroll();
}

function disableScroll() {
  document.body.style.overflow = "hidden";
}

function enableScroll() {
  document.body.style.overflow = "";
}

/*************************************
 * 16. 사용자 프로필 로딩
 *************************************/
async function loadUserProfile() {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const res = await fetch(`http://localhost:8080/users/${userId}/profile`);
    const json = await res.json();

    if (json.message !== "read_success") return;

    const profileImg = document.getElementById("profile_img");
    const imgUrl = json.data.profileImage;

    profileImg.src = imgUrl
      ? imgUrl.startsWith("http")
        ? imgUrl
        : `http://localhost:8080${imgUrl}`
      : "./img/original_profile.png";
  } catch (e) {
    console.error("프로필 불러오기 실패:", e);
  }
}

/*************************************
 * 17. 유틸 함수
 *************************************/
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return Math.floor(num / 1_000) + "K";
  return num;
}

function formatDate(dateTime) {
  const date = new Date(dateTime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
