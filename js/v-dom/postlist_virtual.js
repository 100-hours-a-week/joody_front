import { loadUserProfile } from "../utils/user.js";

function h(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat(),
  };
}

function createElement(vnode) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(vnode);
  }

  const el = document.createElement(vnode.type);

  // props 설정
  for (const [key, value] of Object.entries(vnode.props || {})) {
    if (key === "className") {
      el.className = value;
    } else if (key === "style" && typeof value === "object") {
      Object.assign(el.style, value);
    } else if (key.startsWith("on") && typeof value === "function") {
      // 이벤트 핸들러 (onClick, onInput 등)
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else if (key === "dataset" && typeof value === "object") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else {
      el.setAttribute(key, value);
    }
  }

  // children 처리
  vnode.children.forEach((child) => {
    el.appendChild(createElement(child));
  });

  return el;
}

// 전체를 diff까지 구현하기엔 과하니까, 여기서는 postList 영역만 통째로 다시 렌더
function render(vnode, container) {
  container.innerHTML = "";
  container.appendChild(createElement(vnode));
}

// =====================
// 2. 기존 유틸 함수들 (그대로 사용)
// =====================
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000).toFixed(0) + "k";
  if (num >= 1000) return Math.floor(num / 1000) + "k";
  return num;
};

const truncate = (text, max) =>
  text.length > max ? text.slice(0, max) + "…" : text;

// =====================
// 3. 전역 상태 (state) 정의
// =====================
const state = {
  posts: [],
  nextCursor: null,
  hasNext: true,
  isLoading: false,
  searchKeyword: "",
};

// =====================
// 6. 게시글 리스트를 Virtual DOM으로 렌더
// =====================
function PostListView(posts) {
  // post-card 클릭 핸들러
  const handleCardClick = (id) => () => {
    window.location.href = `post.html?id=${id}`;
  };

  return h(
    "div",
    {}, // postList 최상단 래퍼 (필수는 아니지만 하나 두면 깔끔)
    posts.map((post) =>
      h(
        "article",
        {
          className: "post-card",
          dataset: { id: post.id },
          onClick: handleCardClick(post.id),
        },
        h(
          "div",
          { className: "post-content" },
          h("h3", { className: "post-title" }, truncate(post.title, 26)),
          // 통계 영역
          h(
            "div",
            { className: "post-stats" },
            h(
              "div",
              { className: "stats-left" },

              h(
                "div",
                { className: "stat-item" },
                h("img", {
                  src: "../img/like_on.svg",
                  className: "stat-icon",
                  alt: "좋아요",
                }),
                h(
                  "span",
                  { className: "stat-number" },
                  formatNumber(post.likeCount)
                )
              ),

              h(
                "div",
                { className: "stat-item" },
                h("img", {
                  src: "../img/comment.svg",
                  className: "stat-icon",
                  alt: "댓글",
                }),
                h(
                  "span",
                  { className: "stat-number" },
                  formatNumber(post.commentCount)
                )
              ),

              h(
                "div",
                { className: "stat-item" },
                h("img", {
                  src: "../img/view.svg",
                  className: "stat-icon",
                  alt: "조회수",
                }),
                h(
                  "span",
                  { className: "stat-number" },
                  formatNumber(post.viewCount)
                )
              )
            ),
            h(
              "div",
              { className: "post-date" },
              post.createdAt
                ? post.createdAt.replace("T", " ").slice(0, 19)
                : ""
            )
          ),
          // 작성자 영역
          h(
            "div",
            { className: "post-author" },
            h("img", {
              className: "author-avatar",
              src: post.authorProfileImage
                ? post.authorProfileImage.startsWith("http")
                  ? post.authorProfileImage
                  : `http://localhost:8080${post.authorProfileImage}`
                : "./img/profile_1.jpeg",
            }),
            h("span", { className: "author-name" }, post.author || "익명")
          )
        )
      )
    )
  );
}

function renderPosts() {
  const postList = document.getElementById("post_list");
  const vnode = PostListView(state.posts);
  render(vnode, postList);
}

// =====================
// 7. 데이터 로딩 로직 (인피니티 스크롤 + 검색 그대로 사용)
// =====================
async function loadPosts(isSearch = state.searchKeyword !== "") {
  if (state.isLoading || !state.hasNext) return;
  state.isLoading = true;

  try {
    const url = new URL("http://localhost:8080/posts");
    if (isSearch) {
      // 검색 모드 → 한 번에 많이 가져오기
      url.searchParams.append("size", 1000);
      // 검색에서는 커서를 안 쓰거나, 써도 되고 서버 구현에 따라 선택
    } else {
      // 전체 목록 모드 → 5개씩 페이징
      url.searchParams.append("size", 5);
      if (state.nextCursor) {
        url.searchParams.append("cursorCreatedAt", state.nextCursor);
      }
    }

    // 검색어가 있으면 항상 keyword 파라미터 추가해야 함!
    if (state.searchKeyword) {
      url.searchParams.append("keyword", state.searchKeyword);
    }

    const response = await fetch(url);
    const json = await response.json();

    if (json.message === "post_list_success") {
      const data = json.data;

      // 기존 posts에 새로 받아온 content를 이어붙임
      state.posts = [...state.posts, ...data.content];
      state.nextCursor = data.nextCursor;
      state.hasNext = data.hasNext;

      //Virtual DOM 렌더
      renderPosts();
    } else {
      console.error("게시글 목록 조회 실패:", json);
    }
  } catch (err) {
    console.error("게시글 불러오기 실패:", err);
  } finally {
    state.isLoading = false;
  }
}

async function runSearch() {
  const searchInput = document.getElementById("search_input");
  state.searchKeyword = searchInput.value.trim();

  // 검색어 없으면 전체 모드
  state.nextCursor = null;
  state.hasNext = true;
  state.posts = []; // 기존 목록 초기화
  renderPosts(); // 비워진 상태로 먼저 렌더

  await loadPosts(true); // 검색 모드 표시
}

// =====================
// 8. DOMContentLoaded 이후 초기화
// =====================
document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile();

  const searchInput = document.getElementById("search_input");
  const searchButton = document.getElementById("search_icon");
  const writeButton = document.getElementById("write_post_button");
  const postList = document.getElementById("post_list");

  //   console.log(localStorage.getItem("userId"));

  // 게시글 작성 버튼
  writeButton.addEventListener("click", () => {
    window.location.href = "postCreate.html";
  });

  // 검색 버튼 클릭
  searchButton.addEventListener("click", () => {
    runSearch();
  });

  // Enter로 검색
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") runSearch();
  });

  // 검색창 비워지면 전체 목록 자동 재로드
  searchInput.addEventListener("input", async () => {
    if (searchInput.value.trim() === "") {
      state.searchKeyword = "";
      state.nextCursor = null;
      state.hasNext = true;
      state.posts = [];
      renderPosts();
      await loadPosts();
    }
  });

  // IntersectionObserver로 인피니티 스크롤
  const sentinel = document.createElement("div");
  sentinel.id = "scroll_sentinel";
  postList.after(sentinel);

  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && !state.isLoading) {
      // 검색 중이면 검색 모드로, 아니면 전체 모드로
      await loadPosts(state.searchKeyword !== "");
    }
  });

  observer.observe(sentinel);

  // 초기 렌더 + 첫 페이지 로드
  renderPosts(); // 초기엔 빈 상태
  await loadPosts();
});
