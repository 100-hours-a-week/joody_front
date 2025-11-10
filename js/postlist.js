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

    console.log(json.data.profileImage);
    console.log(json);

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

  console.log(localStorage.getItem("userId"));

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
    console.log(posts);
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
                post.authorProfileImage
                  ? post.authorProfileImage.startsWith("http")
                    ? post.authorProfileImage
                    : `http://localhost:8080${post.authorProfileImage}`
                  : "./img/profile_1.jpeg"
              }" />
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
