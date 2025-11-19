// /*************************************
//  * 1. 전역 변수
//  *************************************/
// let postId;
// let postModalOverlay, commentModalOverlay;
// let postDeleteButton, commentDeleteButton;
// let commentList, commentInput, submitButton;
// let commentCountEl;

// /*************************************
//  * 2. 초기 실행부
//  *************************************/
// document.addEventListener("DOMContentLoaded", async () => {
//   await initializePostView();
// });

// /*************************************
//  * 3. 초기화
//  *************************************/
// async function initializePostView() {
//   cacheDOM();
//   setupProfileDropdown();
//   setupEventListeners();
//   await loadUserProfile();
//   await fetchAndRenderPost();
//   await loadComments();
// }

// // 토큰 가져오는 함수
// function getAccessToken() {
//   return localStorage.getItem("access_token");
// }

// /*************************************
//  * 4. DOM 캐싱
//  *************************************/
// function cacheDOM() {
//   postModalOverlay = document.getElementById("post_modal_overlay");
//   commentModalOverlay = document.getElementById("comment_modal_overlay");

//   postDeleteButton = document.getElementById("delete_button");
//   commentDeleteButton = document.getElementById("comment_confirm_button");

//   commentList = document.getElementById("comment_list");
//   commentInput = document.getElementById("comment_input");
//   submitButton = document.getElementById("submit_comment_button");
//   commentCountEl = document.getElementById("comment_count");

//   const params = new URLSearchParams(window.location.search);
//   postId = params.get("id");

//   if (!postId) {
//     alert("잘못된 접근입니다.");
//     window.location.href = "postList.html";
//   }
// }

// /*************************************
//  * 5. 프로필 dropdown
//  *************************************/
// function setupProfileDropdown() {
//   const profileImg = document.getElementById("profile_img");
//   const dropdownMenu = document.getElementById("dropdown_menu");

//   profileImg.addEventListener("click", () => {
//     dropdownMenu.classList.toggle("hidden");
//   });

//   window.addEventListener("click", (e) => {
//     if (!e.target.closest(".profile-menu")) {
//       dropdownMenu.classList.add("hidden");
//     }
//   });
// }

// /*************************************
//  * 6. 이벤트 묶음
//  *************************************/
// function setupEventListeners() {
//   setupPostEditEvent();
//   setupLikeEvent();
//   setupCommentInputEvent();
//   setupCommentSubmitEvent();
//   setupCommentListEvent();
//   setupDeleteModalEvents();
// }

// /*************************************
//  * 7. 게시글 수정 이동
//  *************************************/
// function setupPostEditEvent() {
//   document.getElementById("edit_button").addEventListener("click", () => {
//     window.location.href = `postEdit.html?id=${postId}`;
//   });
// }

// /*************************************
//  * 8. 좋아요
//  *************************************/
// function setupLikeEvent() {
//   const likeButton = document.getElementById("like_stat");
//   const likeIcon = document.getElementById("like_icon");

//   let likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
//   let liked = likedPosts.includes(Number(postId));
//   likeIcon.src = liked ? "./img/like_on.svg" : "./img/like_off.svg";

//   likeButton.addEventListener("click", async () => {
//     const userId = localStorage.getItem("userId");
//     const accessToken = localStorage.getItem("access_token");

//     if (!userId) return alert("로그인이 필요합니다.");

//     // 요청 보내기
//     const res = await fetch(
//       `http://localhost:8080/posts/${postId}/likes/toggle?userId=${userId}`,
//       {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     // 인증 만료 시 처리
//     if (res.status === 401 || res.status === 403) {
//       alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
//       window.location.href = "/login.html";
//       return;
//     }

//     // 응답 JSON 파싱
//     const result = await res.json();
//     if (!res.ok) {
//       alert("좋아요 처리 실패");
//       return;
//     }

//     // 서버 응답 구조 예:
//     // { message: "toggle_success", data: { liked: true/false, like_count: 5 } }
//     liked = result.data.liked;
//     const likeCount = result.data.like_count;

//     // UI 반영
//     likeIcon.src = liked ? "./img/like_on.svg" : "./img/like_off.svg";
//     document.getElementById("like_count").textContent = formatNumber(likeCount);

//     // localStorage 업데이트
//     if (liked) {
//       if (!likedPosts.includes(Number(postId))) {
//         likedPosts.push(Number(postId));
//       }
//     } else {
//       likedPosts = likedPosts.filter((id) => id !== Number(postId));
//     }

//     localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
//   });
// }

// /*************************************
//  * 9. 게시글 상세 조회
//  *************************************/
// async function fetchAndRenderPost() {
//   const res = await fetch(`http://localhost:8080/posts/${postId}`, {
//     credentials: "include",
//     headers: {
//       Authorization: `Bearer ${getAccessToken()}`,
//     },
//   });

//   console.log(getAccessToken());

//   if (!res.ok) {
//     if (res.status === 401 || res.status === 403) {
//       alert("로그인이 만료되었습니다.");
//       window.location.href = "/login.html";
//     }
//     return;
//   }

//   const json = await res.json(); // ⭐ JSON 파싱
//   renderPost(json.data); // ⭐ 정상 전달
// }

// function renderPost(post) {
//   document.getElementById("post_title").textContent = post.title;
//   document.getElementById("post_author").textContent = post.author;
//   document.getElementById("post_date").textContent = formatDate(post.createdAt);

//   const postImageElement = document.getElementById("post_image");

//   if (post.postImage) {
//     const url = post.postImage.startsWith("http")
//       ? post.postImage
//       : `http://localhost:8080/${post.postImage.replace(/^\/+/, "")}`;
//     postImageElement.src = url;
//     postImageElement.style.display = "block";
//   } else {
//     postImageElement.style.display = "none";
//   }

//   document.getElementById("post_author_img").src =
//     post.authorProfileImage?.startsWith("http")
//       ? post.authorProfileImage
//       : `http://localhost:8080${post.authorProfileImage}`;

//   document.querySelector("#post_content p").textContent = post.content;
//   document.getElementById("like_count").textContent = formatNumber(post.likes);
//   document.getElementById("view_count").textContent = formatNumber(post.views);
//   document.getElementById("comment_count").textContent = formatNumber(
//     post.commentCount
//   );
// }

// /*************************************
//  * 10. 댓글 목록 조회
//  *************************************/
// async function loadComments() {
//   const res = await fetch(`http://localhost:8080/posts/${postId}/comments`, {
//     method: "GET",
//     credentials: "include",
//     headers: {
//       Authorization: `Bearer ${getAccessToken()}`,
//     },
//   });

//   if (!res.ok) return;

//   const json = await res.json();
//   renderComments(json.data.content || []);
//   commentCountEl.textContent = formatNumber(json.data.totalElements);
// }

// function renderComments(comments) {
//   commentList.innerHTML = "";
//   const fragment = document.createDocumentFragment();

//   comments.forEach((c) => fragment.appendChild(createCommentElement(c)));

//   commentList.appendChild(fragment);
// }

// function createCommentElement(comment) {
//   const avatar = comment.authorProfileImage
//     ? comment.authorProfileImage.startsWith("http")
//       ? comment.authorProfileImage
//       : `http://localhost:8080${comment.authorProfileImage}`
//     : "./img/original_profile.png";

//   const el = document.createElement("div");
//   el.classList.add("comment_item");
//   el.dataset.commentId = comment.id;

//   console.log(comment);

//   const dateText =
//     comment.updatedAt && comment.updatedAt !== comment.createdAt
//       ? `${formatDate(comment.updatedAt)} (수정됨)`
//       : formatDate(comment.createdAt);

//   const nickname = comment.authorNickname || comment.author || "익명";

//   el.innerHTML = `
//     <img class="comment_author_img" src="${avatar}">
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

//   return el;
// }

// /*************************************
//  * 11. 댓글 입력 활성화
//  *************************************/
// function setupCommentInputEvent() {
//   submitButton.disabled = true;
//   commentInput.addEventListener("input", () => {
//     const text = commentInput.value.trim();
//     submitButton.disabled = text.length === 0;
//     submitButton.style.backgroundColor =
//       text.length > 0 ? "#4baa7d" : "#d9d9d9";
//   });
// }

// /*************************************
//  * 12. 댓글 등록/수정 통합
//  *************************************/
// let isEditing = false;
// let editingCommentElement = null;
// let editingCommentId = null;

// function setupCommentSubmitEvent() {
//   submitButton.addEventListener("click", async () => {
//     const text = commentInput.value.trim();
//     const userId = localStorage.getItem("userId");
//     if (!text || !userId) return;

//     if (isEditing) {
//       await submitCommentEdit(text);
//     } else {
//       await submitCommentCreate(text, userId);
//     }
//   });
// }

// async function submitCommentEdit(text) {
//   const res = await fetch(
//     `http://localhost:8080/posts/${postId}/comments/${editingCommentId}`,
//     {
//       method: "PUT",
//       credentials: "include",
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ content: text }),
//     }
//   );

//   if (!res.ok) {
//     if (res.status === 401 || res.status === 403) {
//       alert("로그인이 만료되었습니다.");
//       window.location.href = "/login.html";
//     }
//     return;
//   }

//   editingCommentElement.textContent = text;

//   const dateEl = editingCommentElement
//     .closest(".comment_item")
//     .querySelector(".comment_date");

//   dateEl.textContent = `${formatDate(new Date())} (수정됨)`;

//   resetCommentForm();
// }

// async function submitCommentCreate(text, userId) {
//   const res = await fetch(
//     `http://localhost:8080/posts/${postId}/comments/${userId}`,
//     {
//       method: "POST",
//       credentials: "include",
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ content: text }),
//     }
//   );

//   if (!res.ok) {
//     if (res.status === 401 || res.status === 403) {
//       alert("로그인이 만료되었습니다.");
//       window.location.href = "/login.html";
//     }
//     return;
//   }

//   const json = await res.json();

//   const c = {
//     id: json.data.comment_id,
//     authorNickname: localStorage.getItem("nickname") || "익명",
//     authorProfileImage:
//       localStorage.getItem("profileImage") || "./img/profile.png",
//     content: text,
//     createdAt: new Date().toISOString(),
//   };

//   console.log(c);

//   commentList.prepend(createCommentElement(c));
//   commentCountEl.textContent = formatNumber(
//     parseInt(commentCountEl.textContent) + 1
//   );

//   resetCommentForm();
// }

// function resetCommentForm() {
//   isEditing = false;
//   editingCommentId = null;
//   editingCommentElement = null;
//   commentInput.value = "";
//   submitButton.textContent = "댓글 등록";
//   submitButton.disabled = true;
//   submitButton.style.backgroundColor = "#d9d9d9";
// }

// /*************************************
//  * 13. 댓글 수정/삭제
//  *************************************/
// let targetCommentToDelete = null;

// function setupCommentListEvent() {
//   commentList.addEventListener("click", (e) => {
//     const commentItem = e.target.closest(".comment_item");
//     if (!commentItem) return;

//     if (e.target.classList.contains("edit_comment_button")) {
//       const content = commentItem.querySelector(".comment_content");
//       editingCommentElement = content;
//       editingCommentId = commentItem.dataset.commentId;
//       isEditing = true;

//       commentInput.value = content.textContent;
//       submitButton.textContent = "댓글 수정";
//       submitButton.disabled = false;
//       submitButton.style.backgroundColor = "#4baa7d";
//       commentInput.focus();
//     }

//     if (e.target.classList.contains("delete_comment_button")) {
//       targetCommentToDelete = commentItem;
//       commentModalOverlay.classList.remove("hidden");
//       disableScroll();
//     }
//   });
// }

// /*************************************
//  * 14. 삭제 모달
//  *************************************/
// function setupDeleteModalEvents() {
//   const cancelButtons = document.querySelectorAll(".cancel_button");

//   postDeleteButton.addEventListener("click", () => {
//     postModalOverlay.classList.remove("hidden");
//     disableScroll();
//   });

//   cancelButtons.forEach((btn) => {
//     btn.addEventListener("click", () => closeModals());
//   });

//   document
//     .querySelector("#post_modal_overlay .confirm_button")
//     .addEventListener("click", deletePost);

//   commentDeleteButton.addEventListener("click", deleteComment);

//   window.addEventListener("click", (e) => {
//     if (e.target === postModalOverlay || e.target === commentModalOverlay) {
//       closeModals();
//     }
//   });
// }

// async function deletePost() {
//   const accessToken = localStorage.getItem("access_token");

//   const res = await fetch(`http://localhost:8080/posts/${postId}`, {
//     method: "DELETE",
//     credentials: "include",
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   });

//   if (res.status === 401 || res.status === 403) {
//     alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
//     window.location.href = "/login.html";
//     return;
//   }

//   if (!res.ok) {
//     alert("게시글 삭제 실패");
//     return;
//   }

//   window.location.href = "postList.html";
// }

// async function deleteComment() {
//   if (!targetCommentToDelete) return;

//   const id = targetCommentToDelete.dataset.commentId;
//   const accessToken = localStorage.getItem("access_token");

//   const res = await fetch(
//     `http://localhost:8080/posts/${postId}/comments/${id}`,
//     {
//       method: "DELETE",
//       credentials: "include",
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     }
//   );

//   if (res.status === 401 || res.status === 403) {
//     alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
//     window.location.href = "/login.html";
//     return;
//   }

//   if (!res.ok) {
//     alert("댓글 삭제 실패");
//     closeModals();
//     return;
//   }

//   // 삭제 성공 → UI에서 제거
//   targetCommentToDelete.remove();
//   commentCountEl.textContent = Math.max(
//     0,
//     Number(commentCountEl.textContent) - 1
//   );

//   closeModals();
// }

// /*************************************
//  * 15. 모달 & 스크롤
//  *************************************/
// function closeModals() {
//   postModalOverlay.classList.add("hidden");
//   commentModalOverlay.classList.add("hidden");
//   enableScroll();
// }

// function disableScroll() {
//   document.body.style.overflow = "hidden";
// }

// function enableScroll() {
//   document.body.style.overflow = "";
// }

// /*************************************
//  * 16. 프로필 로드
//  *************************************/
// async function loadUserProfile() {
//   try {
//     const userId = localStorage.getItem("userId");
//     if (!userId) return;

//     const res = await fetch(`http://localhost:8080/users/${userId}/profile`, {
//       credentials: "include",
//       headers: {
//         Authorization: `Bearer ${getAccessToken()}`,
//       },
//     });

//     if (!res.ok) return;

//     const json = await res.json();
//     const imgUrl = json.data.profileImage;

//     // 🔥 추가 — localStorage에 저장
//     localStorage.setItem(
//       "profileImage",
//       imgUrl
//         ? imgUrl.startsWith("http")
//           ? imgUrl
//           : `http://localhost:8080${imgUrl}`
//         : "./img/original_profile.png"
//     );

//     document.getElementById("profile_img").src =
//       localStorage.getItem("profileImage");
//   } catch (e) {
//     console.error("프로필 불러오기 실패:", e);
//   }
// }

// /*************************************
//  * 17. 유틸 함수
//  *************************************/
// function formatNumber(num) {
//   if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
//   if (num >= 1_000) return Math.floor(num / 1_000) + "K";
//   return num;
// }

// function formatDate(dateTime) {
//   const date = new Date(dateTime);
//   return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
//     2,
//     "0"
//   )}-${String(date.getDate()).padStart(2, "0")} ${String(
//     date.getHours()
//   ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
// }

import { apiRequest } from "./utils/api.js";

/*************************************
 * 1. 전역 변수
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
}

/*************************************
 * 10. 댓글 목록 조회
 *************************************/
async function loadComments() {
  const { ok, data } = await apiRequest(`/posts/${postId}/comments`);

  if (!ok || !data) return;

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

    await submitCommentCreate(text);
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
 * 13. 댓글 삭제
 *************************************/
let targetCommentToDelete = null;

function setupCommentListEvent() {
  commentList.addEventListener("click", (e) => {
    const commentItem = e.target.closest(".comment_item");
    if (!commentItem) return;

    if (e.target.classList.contains("delete_comment_button")) {
      targetCommentToDelete = commentItem;
      commentModalOverlay.classList.remove("hidden");
    }
  });
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
