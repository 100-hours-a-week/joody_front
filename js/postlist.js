// // document.addEventListener("DOMContentLoaded", async () => {
// //   // 1️⃣ 더미 데이터 (→ 나중에 fetch()로 교체)
// //   const posts = [
// //     { id: 1, title: "첫 번째 게시글", likes: 1200, comments: 54, views: 12345 },
// //     {
// //       id: 2,
// //       title: "두 번째 게시글",
// //       likes: 23000,
// //       comments: 120,
// //       views: 105000,
// //     },
// //     { id: 3, title: "세 번째 게시글", likes: 500, comments: 2, views: 830 },
// //   ];

// //   // 2️⃣ 게시글 작성 버튼
// //   document.getElementById("write_post_button").addEventListener("click", () => {
// //     window.location.href = "postCreate.html";
// //   });

// //   // 3️⃣ 렌더링 함수
// //   const postList = document.getElementById("post_list");

// //   const formatNumber = (num) => {
// //     if (num >= 100000) return Math.floor(num / 1000) + "k";
// //     if (num >= 10000) return Math.floor(num / 1000) + "k";
// //     if (num >= 1000) return Math.floor(num / 1000) + "k";
// //     return num;
// //   };

// //   const truncate = (text, max) =>
// //     text.length > max ? text.slice(0, max) : text;

// //   const renderPosts = (posts) => {
// //     postList.innerHTML = posts
// //       .map(
// //         (post) => `
// //         <article class="post-card" data-id="${post.id}">
// //           <div class="post-content">
// //             <h3 class="post-title">${truncate(post.title, 26)}</h3>
// //             <div class="post-stats">
// //               <div class="stats-left">
// //                 <span class="likes">좋아요 <strong>${formatNumber(
// //                   post.likes
// //                 )}</strong></span>
// //                 <span class="comments">댓글 <strong>${formatNumber(
// //                   post.comments
// //                 )}</strong></span>
// //                 <span class="views">조회수 <strong>${formatNumber(
// //                   post.views
// //                 )}</strong></span>
// //               </div>
// //               <div class="post-date">2025-11-07 12:00:00</div>
// //             </div>
// //             <div class="post-author">
// //               <img class="author-avatar" src="./img/profile.png" alt="작성자" />
// //               <span class="author-name">작성자닉네임</span>
// //             </div>
// //           </div>
// //         </article>
// //       `
// //       )
// //       .join("");
// //   };

// //   renderPosts(posts);

// //   // 4️⃣ 이벤트 위임 (동적 렌더링에도 작동)
// //   postList.addEventListener("click", (e) => {
// //     const card = e.target.closest(".post-card");
// //     if (!card) return;
// //     const id = card.dataset.id;
// //     window.location.href = `post.html?id=${id}`;
// //   });
// // });

// // /*인티니티 스크롤 구현 해야돼. */

// document.addEventListener("DOMContentLoaded", async () => {
//   // 1️⃣ 기본 게시글 데이터 (서버 대신 더미)
//   const posts = [
//     { id: 1, title: "첫 번째 게시글", likes: 1200, comments: 54, views: 12345 },
//     {
//       id: 2,
//       title: "두 번째 게시글",
//       likes: 23000,
//       comments: 120,
//       views: 105000,
//     },
//     { id: 3, title: "세 번째 게시글", likes: 500, comments: 2, views: 830 },
//   ];

//   // ✅ 2️⃣ localStorage에서 수정된 게시글 반영
//   posts.forEach((post, i) => {
//     const savedPost = JSON.parse(localStorage.getItem(`post_${post.id}`));
//     if (savedPost) {
//       // 저장된 데이터(title, content, image) 중 필요한 정보만 반영
//       posts[i] = {
//         ...post,
//         title: savedPost.title,
//       };
//     }
//   });

//   // ✅ 3️⃣ 게시글 작성 버튼 클릭 시
//   document.getElementById("write_post_button").addEventListener("click", () => {
//     window.location.href = "postCreate.html";
//   });

//   // ✅ 4️⃣ 숫자 포맷 함수
//   const formatNumber = (num) => {
//     if (num >= 1000000) return (num / 1000).toFixed(0) + "k";
//     if (num >= 1000) return Math.floor(num / 1000) + "k";
//     return num;
//   };

//   // ✅ 5️⃣ 제목 길이 제한 함수
//   const truncate = (text, max) =>
//     text.length > max ? text.slice(0, max) + "…" : text;

//   // ✅ 6️⃣ 렌더링 함수
//   const postList = document.getElementById("post_list");

//   const renderPosts = (posts) => {
//     postList.innerHTML = posts
//       .map(
//         (post) => `
//         <article class="post-card" data-id="${post.id}">
//           <div class="post-content">
//             <h3 class="post-title">${truncate(post.title, 26)}</h3>
//             <div class="post-stats">
//               <div class="stats-left">
//                 <span class="likes">좋아요 <strong>${formatNumber(
//                   post.likes
//                 )}</strong></span>
//                 <span class="comments">댓글 <strong>${formatNumber(
//                   post.comments
//                 )}</strong></span>
//                 <span class="views">조회수 <strong>${formatNumber(
//                   post.views
//                 )}</strong></span>
//               </div>
//               <div class="post-date">2025-11-07 12:00:00</div>
//             </div>
//             <div class="post-author">
//               <img class="author-avatar" src="./img/profile.png" alt="작성자" />
//               <span class="author-name">작성자닉네임</span>
//             </div>
//           </div>
//         </article>
//       `
//       )
//       .join("");
//   };

//   renderPosts(posts);

//   // ✅ 7️⃣ 게시글 클릭 시 상세 페이지로 이동
//   postList.addEventListener("click", (e) => {
//     const card = e.target.closest(".post-card");
//     if (!card) return;
//     const id = card.dataset.id;
//     window.location.href = `post.html?id=${id}`;
//   });
// });

// document.addEventListener("DOMContentLoaded", async () => {
//   // ===== 1️⃣ 기본 더미 게시글 =====
//   const dummyPosts = [
//     { id: 1, title: "첫 번째 게시글", likes: 1200, comments: 54, views: 12345 },
//     {
//       id: 2,
//       title: "두 번째 게시글",
//       likes: 23000,
//       comments: 120,
//       views: 105000,
//     },
//     { id: 3, title: "세 번째 게시글", likes: 500, comments: 2, views: 830 },
//     { id: 4, title: "네 번째 게시글", likes: 700, comments: 14, views: 2500 },
//     { id: 5, title: "다섯 번째 게시글", likes: 150, comments: 3, views: 600 },
//   ];

//   // ===== 2️⃣ localStorage 게시글 불러오기 =====
//   const userPosts = JSON.parse(localStorage.getItem("posts")) || [];

//   // 최신글이 위로 오게 정렬 (localStorage 추가글 포함)
//   const allPosts = [...userPosts.reverse(), ...dummyPosts];

//   // ===== 3️⃣ 게시글 작성 버튼 =====
//   document.getElementById("write_post_button").addEventListener("click", () => {
//     window.location.href = "postCreate.html";
//   });

//   // ===== 4️⃣ 숫자 포맷 함수 =====
//   const formatNumber = (num) => {
//     if (num >= 1000000) return (num / 1000).toFixed(0) + "k";
//     if (num >= 1000) return Math.floor(num / 1000) + "k";
//     return num;
//   };

//   // ===== 5️⃣ 제목 길이 제한 =====
//   const truncate = (text, max) =>
//     text.length > max ? text.slice(0, max) + "…" : text;

//   // ===== 6️⃣ 렌더링 함수 =====
//   const postList = document.getElementById("post_list");

//   const renderPosts = (posts) => {
//     const html = posts
//       .map(
//         (post) => `
//         <article class="post-card" data-id="${post.id}">
//           <div class="post-content">
//             <h3 class="post-title">${truncate(post.title, 26)}</h3>
//             <div class="post-stats">
//               <div class="stats-left">
//                 <span class="likes">좋아요 <strong>${formatNumber(
//                   post.likes
//                 )}</strong></span>
//                 <span class="comments">댓글 <strong>${formatNumber(
//                   post.comments
//                 )}</strong></span>
//                 <span class="views">조회수 <strong>${formatNumber(
//                   post.views
//                 )}</strong></span>
//               </div>
//               <div class="post-date">${post.date || "2025-11-07 12:00:00"}</div>
//             </div>
//             <div class="post-author">
//               <img class="author-avatar" src="./img/profile_1.jpeg" alt="작성자" />
//               <span class="author-name">${post.author || "작성자닉네임"}</span>
//             </div>
//           </div>
//         </article>
//       `
//       )
//       .join("");

//     postList.insertAdjacentHTML("beforeend", html);
//   };

//   // ===== 7️⃣ 인피니티 스크롤 =====
//   let currentPage = 0;
//   const pageSize = 3; // 한 번에 불러올 개수
//   let isLoading = false;

//   const loadMorePosts = () => {
//     if (isLoading) return;
//     isLoading = true;

//     const start = currentPage * pageSize;
//     const end = start + pageSize;
//     const nextPosts = allPosts.slice(start, end);

//     if (nextPosts.length > 0) {
//       renderPosts(nextPosts);
//       currentPage++;
//     }

//     isLoading = false;
//   };

//   // 초기 로드
//   loadMorePosts();

//   // ===== 8️⃣ IntersectionObserver로 스크롤 감지 =====
//   const sentinel = document.createElement("div");
//   sentinel.id = "scroll_sentinel";
//   postList.after(sentinel);

//   const observer = new IntersectionObserver((entries) => {
//     if (entries[0].isIntersecting) {
//       loadMorePosts();
//     }
//   });

//   observer.observe(sentinel);

//   // ===== 9️⃣ 게시글 클릭 시 상세 페이지 이동 =====
//   postList.addEventListener("click", (e) => {
//     const card = e.target.closest(".post-card");
//     if (!card) return;
//     const id = card.dataset.id;
//     window.location.href = `post.html?id=${id}`;
//   });
// });

document.addEventListener("DOMContentLoaded", async () => {
  const postList = document.getElementById("post_list");
  const writeButton = document.getElementById("write_post_button");

  // ===== 1️⃣ 게시글 작성 버튼 =====
  writeButton.addEventListener("click", () => {
    window.location.href = "postCreate.html";
  });

  // ===== 2️⃣ 숫자 포맷 함수 =====
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000).toFixed(0) + "k";
    if (num >= 1000) return Math.floor(num / 1000) + "k";
    return num;
  };

  // ===== 3️⃣ 제목 길이 제한 =====
  const truncate = (text, max) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  // ===== 4️⃣ 렌더링 함수 =====
  const renderPosts = (posts) => {
    const html = posts
      .map(
        (post) => `
        <article class="post-card" data-id="${post.id}">
          <div class="post-content">
            <h3 class="post-title">${truncate(post.title, 26)}</h3>
            <div class="post-stats">
              <div class="stats-left">
                <span class="likes">좋아요 <strong>${formatNumber(
                  post.likeCount
                )}</strong></span>
                <span class="comments">댓글 <strong>${formatNumber(
                  post.commentCount
                )}</strong></span>
                <span class="views">조회수 <strong>${formatNumber(
                  post.viewCount
                )}</strong></span>
              </div>
              <div class="post-date">${post.createdAt
                ?.replace("T", " ")
                .slice(0, 19)}</div>
            </div>
            <div class="post-author">
              <img class="author-avatar" src="${
                post.authorProfileImage || "./img/profile_1.jpeg"
              }" alt="작성자" />
              <span class="author-name">${post.author || "익명"}</span>
            </div>
          </div>
        </article>
      `
      )
      .join("");
    postList.insertAdjacentHTML("beforeend", html);
  };

  // ===== 5️⃣ 인피니티 스크롤 구현 =====
  let nextCursor = null;
  let isLoading = false;
  let hasNext = true;

  async function loadPosts() {
    if (isLoading || !hasNext) return;
    isLoading = true;

    try {
      const url = new URL("http://localhost:8080/posts");
      if (nextCursor) url.searchParams.append("cursorCreatedAt", nextCursor);
      url.searchParams.append("size", 5); // 페이지당 5개
      const response = await fetch(url);
      const json = await response.json();

      if (json.message === "post_list_success") {
        const data = json.data;
        renderPosts(data.content);

        // 다음 페이지 커서 & 상태 갱신
        nextCursor = data.nextCursor;
        hasNext = data.hasNext;
      } else {
        console.error("게시글 목록 조회 실패:", json);
      }
    } catch (err) {
      console.error("게시글 불러오기 실패:", err);
    } finally {
      isLoading = false;
    }
  }

  // ===== 6️⃣ IntersectionObserver로 스크롤 감지 =====
  const sentinel = document.createElement("div");
  sentinel.id = "scroll_sentinel";
  postList.after(sentinel);

  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && !isLoading) {
      await loadPosts();
    }
  });

  observer.observe(sentinel);

  // ===== 7️⃣ 최초 게시글 로드 =====
  await loadPosts();

  // ===== 8️⃣ 게시글 클릭 시 상세 페이지 이동 =====
  postList.addEventListener("click", (e) => {
    const card = e.target.closest(".post-card");
    if (!card) return;
    const id = card.dataset.id;
    window.location.href = `post.html?id=${id}`;
  });
});
