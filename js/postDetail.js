import { apiRequest } from "./utils/api.js";

/*************************************
 * 1. 전역 변수
 *************************************/
let postId;
let postModalOverlay, commentModalOverlay;
let postDeleteButton, commentDeleteButton;
let commentList, commentInput, submitButton;
let commentCountEl;
let isEditing = false;
let editingCommentElement = null;
let editingCommentId = null;

/*************************************
 * 2. 초기 실행부
 *************************************/
document.addEventListener("DOMContentLoaded", async () => {
  await initializePostView();
});

/*************************************
 * 3. 초기화
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

  const params = new URLSearchParams(window.location.search);
  postId = params.get("id");

  if (!postId) {
    alert("잘못된 접근입니다.");
    window.location.href = "postList.html";
  }
}

/*************************************
 * 5. 프로필 dropdown
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
 * 6. 이벤트 묶음
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
 * 7. 게시글 수정 이동
 *************************************/
function setupPostEditEvent() {
  document.getElementById("edit_button").addEventListener("click", () => {
    window.location.href = `postEdit.html?id=${postId}`;
  });
}

/*************************************
 * 8. 좋아요 (apiRequest 버전)
 *************************************/
function setupLikeEvent() {
  const likeButton = document.getElementById("like_stat");
  const likeIcon = document.getElementById("like_icon");

  likeButton.addEventListener("click", async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("로그인이 필요합니다.");

    const { ok, data } = await apiRequest(
      `/posts/${postId}/likes/toggle?userId=${userId}`,
      { method: "POST" }
    );

    if (!ok || !data) return;

    const liked = data.data.liked;
    const likeCount = data.data.like_count;

    likeIcon.src = liked ? "./img/like_on.svg" : "./img/like_off.svg";
    document.getElementById("like_count").textContent = formatNumber(likeCount);
  });
}

/*************************************
 * 9. 게시글 상세 조회
 *************************************/
async function fetchAndRenderPost() {
  const { ok, data } = await apiRequest(`/posts/${postId}`);

  if (!ok || !data) return;

  console.log(data);

  renderPost(data.data);
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
    postImageElement.src = url;
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

  // =============================
  // ⭐⭐ 게시글 수정/삭제 권한 처리 ⭐⭐
  // =============================
  const currentUserId = localStorage.getItem("userId");

  if (String(post.authorId) === String(currentUserId)) {
    document.getElementById("edit_button").style.display = "flex";
    document.getElementById("delete_button").style.display = "flex";
  } else {
    document.getElementById("edit_button").style.display = "none";
    document.getElementById("delete_button").style.display = "none";
  }
}

/*************************************
 * 10. 댓글 목록 조회
 *************************************/
async function loadComments() {
  const { ok, data } = await apiRequest(`/posts/${postId}/comments`);

  if (!ok || !data) return;

  console.log(data);

  renderComments(data.data.content || []);
  commentCountEl.textContent = formatNumber(data.data.totalElements);
}

function renderComments(comments) {
  commentList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  comments.forEach((c) => fragment.appendChild(createCommentElement(c)));

  commentList.appendChild(fragment);
}

function createCommentElement(comment) {
  const avatar = comment.authorProfileImage
    ? comment.authorProfileImage.startsWith("http")
      ? comment.authorProfileImage
      : `http://localhost:8080${comment.authorProfileImage}`
    : "./img/original_profile.png";

  const el = document.createElement("div");
  el.classList.add("comment_item");
  el.dataset.commentId = comment.id;
  el.dataset.authorId = comment.authorId;

  const dateText =
    comment.updatedAt && comment.updatedAt !== comment.createdAt
      ? `${formatDate(comment.updatedAt)} (수정됨)`
      : formatDate(comment.createdAt);

  const nickname = comment.authorNickname || comment.author || "익명";

  el.innerHTML = `
    <img class="comment_author_img" src="${avatar}">
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

  // =============================
  // ✨ 댓글 수정/삭제 권한 처리
  // =============================
  const currentUserId = localStorage.getItem("userId");
  const isOwner = String(comment.authorId) === String(currentUserId);

  const editButton = el.querySelector(".edit_comment_button");
  const deleteButton = el.querySelector(".delete_comment_button");

  if (!isOwner) {
    editButton.style.display = "none";
    deleteButton.style.display = "none";
  }

  return el;
}

/*************************************
 * 11. 댓글 입력 활성화
 *************************************/
function setupCommentInputEvent() {
  submitButton.disabled = true;
  commentInput.addEventListener("input", () => {
    const text = commentInput.value.trim();
    submitButton.disabled = text.length === 0;
    submitButton.style.backgroundColor =
      text.length > 0 ? "#4baa7d" : "#d9d9d9";
  });
}

/*************************************
 * 12. 댓글 등록
 *************************************/
function setupCommentSubmitEvent() {
  submitButton.addEventListener("click", async () => {
    const text = commentInput.value.trim();
    if (!text) return;

    if (isEditing) {
      await submitCommentEdit(text);
    } else {
      await submitCommentCreate(text);
    }
  });
}

async function submitCommentCreate(text) {
  const userId = localStorage.getItem("userId");
  if (!userId) return alert("로그인이 필요합니다.");

  const { ok, data } = await apiRequest(`/posts/${postId}/comments/${userId}`, {
    method: "POST",
    body: JSON.stringify({ content: text }),
  });

  if (!ok || !data) return;

  const c = {
    id: data.data.comment_id,
    authorNickname: localStorage.getItem("nickname") || "익명",
    authorProfileImage:
      localStorage.getItem("profileImage") || "./img/profile.png",
    content: text,
    createdAt: new Date().toISOString(),
    authorId: Number(localStorage.getItem("userId")),
  };

  commentList.prepend(createCommentElement(c));
  commentCountEl.textContent = formatNumber(
    parseInt(commentCountEl.textContent) + 1
  );

  commentInput.value = "";
  submitButton.disabled = true;
  submitButton.style.backgroundColor = "#d9d9d9";
}

/*************************************
 * 13. 댓글 수정 및 삭제
 *************************************/
let targetCommentToDelete = null;

function setupCommentListEvent() {
  commentList.addEventListener("click", (e) => {
    const commentItem = e.target.closest(".comment_item");
    if (!commentItem) return;

    const commentAuthorId = commentItem.dataset.authorId;
    const currentUserId = localStorage.getItem("userId");

    // ============================
    // ⭐ 댓글 수정 버튼
    // ============================
    if (e.target.classList.contains("edit_comment_button")) {
      if (String(commentAuthorId) !== String(currentUserId)) {
        return alert("본인 댓글만 수정할 수 있습니다.");
      }

      const content = commentItem.querySelector(".comment_content");

      isEditing = true;
      editingCommentElement = content;
      editingCommentId = commentItem.dataset.commentId;

      // 기존 댓글 내용을 입력창에 넣기
      commentInput.value = content.textContent;

      // 버튼 UI 변경
      submitButton.textContent = "댓글 수정";
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#4baa7d";

      commentInput.focus();
    }

    // ============================
    // ⭐ 댓글 삭제 버튼
    // ============================
    if (e.target.classList.contains("delete_comment_button")) {
      if (String(commentAuthorId) !== String(currentUserId)) {
        return alert("본인 댓글만 삭제할 수 있습니다.");
      }

      targetCommentToDelete = commentItem;
      commentModalOverlay.classList.remove("hidden");
    }
  });
}

// 댓글 수정 함수

async function submitCommentEdit(text) {
  const { ok } = await apiRequest(
    `/posts/${postId}/comments/${editingCommentId}`,
    {
      method: "PUT",
      body: JSON.stringify({ content: text }),
    }
  );

  if (!ok) return alert("댓글 수정 실패");

  // UI 변경
  editingCommentElement.textContent = text;

  const dateEl = editingCommentElement
    .closest(".comment_item")
    .querySelector(".comment_date");

  dateEl.textContent = `${formatDate(new Date())} (수정됨)`;

  resetCommentForm();
}

function resetCommentForm() {
  isEditing = false;
  editingCommentElement = null;
  editingCommentId = null;

  commentInput.value = "";
  submitButton.textContent = "댓글 등록";
  submitButton.disabled = true;
  submitButton.style.backgroundColor = "#d9d9d9";
}

/*************************************
 * 14. 삭제 모달 처리
 *************************************/
function setupDeleteModalEvents() {
  const cancelButtons = document.querySelectorAll(".cancel_button");

  postDeleteButton.addEventListener("click", () => {
    postModalOverlay.classList.remove("hidden");
  });

  cancelButtons.forEach((btn) =>
    btn.addEventListener("click", () => closeModals())
  );

  document
    .querySelector("#post_modal_overlay .confirm_button")
    .addEventListener("click", deletePost);

  commentDeleteButton.addEventListener("click", deleteComment);
}

async function deletePost() {
  const { ok } = await apiRequest(`/posts/${postId}`, {
    method: "DELETE",
  });

  if (ok) window.location.href = "postList.html";
}

async function deleteComment() {
  if (!targetCommentToDelete) return;

  const id = targetCommentToDelete.dataset.commentId;

  const { ok } = await apiRequest(`/posts/${postId}/comments/${id}`, {
    method: "DELETE",
  });

  if (ok) {
    targetCommentToDelete.remove();
    commentCountEl.textContent = Math.max(0, commentCountEl.textContent - 1);
  }

  closeModals();
}

/*************************************
 * 15. 모달 닫기
 *************************************/
function closeModals() {
  postModalOverlay.classList.add("hidden");
  commentModalOverlay.classList.add("hidden");
}

/*************************************
 * 16. 프로필 로드
 *************************************/
async function loadUserProfile() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const { ok, data } = await apiRequest(`/users/${userId}/profile`);

  if (!ok || !data) return;

  const imgUrl = data.data.profileImage;

  localStorage.setItem(
    "profileImage",
    imgUrl
      ? imgUrl.startsWith("http")
        ? imgUrl
        : `http://localhost:8080${imgUrl}`
      : "./img/original_profile.png"
  );

  document.getElementById("profile_img").src =
    localStorage.getItem("profileImage");
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
