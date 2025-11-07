document.addEventListener("DOMContentLoaded", async () => {
  // 1️⃣ 더미 데이터 (→ 나중에 fetch()로 교체)
  const posts = [
    { id: 1, title: "첫 번째 게시글", likes: 1200, comments: 54, views: 12345 },
    {
      id: 2,
      title: "두 번째 게시글",
      likes: 23000,
      comments: 120,
      views: 105000,
    },
    { id: 3, title: "세 번째 게시글", likes: 500, comments: 2, views: 830 },
  ];

  // 2️⃣ 게시글 작성 버튼
  document.getElementById("write_post_button").addEventListener("click", () => {
    window.location.href = "postCreate.html";
  });

  // 3️⃣ 렌더링 함수
  const postList = document.getElementById("post_list");

  const formatNumber = (num) => {
    if (num >= 100000) return Math.floor(num / 1000) + "k";
    if (num >= 10000) return Math.floor(num / 1000) + "k";
    if (num >= 1000) return Math.floor(num / 1000) + "k";
    return num;
  };

  const truncate = (text, max) =>
    text.length > max ? text.slice(0, max) : text;

  const renderPosts = (posts) => {
    postList.innerHTML = posts
      .map(
        (post) => `
        <article class="post-card" data-id="${post.id}">
          <div class="post-content">
            <h3 class="post-title">${truncate(post.title, 26)}</h3>
            <div class="post-stats">
              <div class="stats-left">
                <span class="likes">좋아요 <strong>${formatNumber(
                  post.likes
                )}</strong></span>
                <span class="comments">댓글 <strong>${formatNumber(
                  post.comments
                )}</strong></span>
                <span class="views">조회수 <strong>${formatNumber(
                  post.views
                )}</strong></span>
              </div>
              <div class="post-date">2025-11-07 12:00:00</div>
            </div>
            <div class="post-author">
              <img class="author-avatar" src="./img/profile.png" alt="작성자" />
              <span class="author-name">작성자닉네임</span>
            </div>
          </div>
        </article>
      `
      )
      .join("");
  };

  renderPosts(posts);

  // 4️⃣ 이벤트 위임 (동적 렌더링에도 작동)
  postList.addEventListener("click", (e) => {
    const card = e.target.closest(".post-card");
    if (!card) return;
    const id = card.dataset.id;
    window.location.href = `post.html?id=${id}`;
  });
});

/*인티니티 스크롤 구현 해야돼. */
