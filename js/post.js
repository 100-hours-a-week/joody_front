document.addEventListener("DOMContentLoaded", () => {
  const postModalOverlay = document.getElementById("post_modal_overlay");
  const postDeleteButton = document.getElementById("delete_button");

  const commentModalOverlay = document.getElementById("comment_modal_overlay");
  const commentDeleteButtons = document.querySelectorAll(
    ".delete_comment_button"
  );

  const cancelButtons = document.querySelectorAll(".cancel_button");
  const confirmButtons = document.querySelectorAll(".confirm_button");

  // === 1️⃣ 더미 게시글 데이터 ===
  const dummyPosts = [
    {
      id: 1,
      title: "첫 번째 게시글",
      author: "홍길동",
      date: "2025-11-05 12:00:00",
      image: "./img/post_img.jpeg",
      content: "이건 첫 번째 게시글의 내용입니다.",
      likes: 1000000,
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

  // === 2️⃣ URL에서 id 가져오기 ===
  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get("id"));

  // === 3️⃣ 해당 id의 게시글 찾기 ===
  const post = dummyPosts.find((p) => p.id === postId);

  // 게시글 삭제 버튼 클릭 시 모달 열기
  postDeleteButton.addEventListener("click", () => {
    postModalOverlay.classList.remove("hidden");
  });

  if (!post) {
    document.body.innerHTML = "<h2>게시글을 찾을 수 없습니다.</h2>";
    return;
  }

  // === 4️⃣ DOM 요소에 데이터 넣기 ===
  document.getElementById("post_title").textContent = post.title;
  document.getElementById("post_author").textContent = post.author;
  document.getElementById("post_date").textContent = post.date;
  document.getElementById("post_image").src = post.image;
  document.querySelector("#post_content p").textContent = post.content;
  document.getElementById("like_count").textContent = formatNumber(post.likes);
  document.getElementById("view_count").textContent = formatNumber(post.views);
  document.getElementById("comment_count").textContent = formatNumber(
    post.comments
  );

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

  if (post) {
    document.getElementById("post-title").textContent = post.title;
    document.getElementById("post-content").textContent = post.content;
  } else {
    document.body.innerHTML = "<p>게시글을 찾을 수 없습니다.</p>";
  }
});

// === 숫자 단위 변환 함수 (1K, 10K, 100K 등) ===
function formatNumber(num) {
  if (num >= 100000) return Math.floor(num / 1000) + "K";
  if (num >= 10000) return Math.floor(num / 1000) + "K";
  if (num >= 1000) return Math.floor(num / 1000) + "K";
  return num;
}
