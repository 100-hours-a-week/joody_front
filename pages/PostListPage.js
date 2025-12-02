import { loadUserProfile } from "../api/userService.js";
import { render } from "../vdom/Vdom.js";
import { apiRequest } from "../api/authApi.js";
import { formatNumber, truncate } from "../utils/common.js";
import { setupHeaderEvents, teardownHeaderEvents } from "../utils/common.js";
import PostListLayout from "../components/postlist/postListLayout.js";

// =====================
// 1. 헬퍼 / 유틸
// =====================
function h(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat(),
  };
}

// =====================
// 2. 로컬 상태
// =====================
const state = {
  allPosts: [], // 전체 게시글 저장 (변하지 않음)
  posts: [], // 화면에 렌더링되는 게시글
  nextCursor: null,
  hasNext: true,
  isLoading: false,
  searchKeyword: "",
};

function resetState() {
  state.allPosts = [];
  state.posts = [];
  state.nextCursor = null;
  state.hasNext = true;
  state.isLoading = false;
  state.searchKeyword = "";
}

// =====================
// 3. VDOM View
// =====================

// 게시글 리스트
function PostListView(posts) {
  const handleCardClick = (id) => () => {
    location.hash = `#/postDetail?id=${id}`;
  };

  return h(
    "div",
    {},
    posts.map((post) =>
      h(
        "article",
        {
          key: post.id,
          className: "post-card",
          dataset: { id: post.id },
          onClick: handleCardClick(post.id),
        },
        h(
          "div",
          { className: "post-content" },
          // 제목
          h(
            "h3",
            { className: "post-title", key: `title-${post.id}` },
            truncate(post.title, 26)
          ),

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
                  src: "../assets/img/like_on.svg",
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
                  src: "../assets/img/comment.svg",
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
                  src: "../assets/img/view.svg",
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

// 전체 페이지 프레임 (Header + 검색 + 리스트 컨테이너)
function renderPage() {
  const app = document.getElementById("app");

  if (!app) return;

  // 기존 vnode/DOM 초기화 후 새로 렌더
  app.innerHTML = "";
  app._prevVNode = null;

  const vnode = PostListLayout();

  render(vnode, app);
}

// postList diff + patch 반영
function renderPosts() {
  const postList = document.getElementById("post_list");
  if (!postList) return;

  const parent = postList.parentNode;

  const vnode = PostListView(state.posts);

  // ⭐ postList 내부 style 제거
  const searchBox = document.getElementById("search_box");
  if (searchBox) searchBox.removeAttribute("style");

  // 📌 post_list 전체를 새로운 vnode로 교체
  const newContainer = document.createElement("div");
  newContainer.id = "post_list";
  parent.replaceChild(newContainer, postList);

  render(vnode, newContainer); // 여기!
}

// =====================
// 4. 데이터 로딩 / 검색
// =====================

async function loadPosts(isSearch = state.searchKeyword !== "") {
  if (state.isLoading || !state.hasNext) return;
  state.isLoading = true;

  try {
    const url = new URL("http://localhost:8080/posts");
    url.searchParams.append("size", 5);

    if (state.nextCursor) {
      url.searchParams.append("cursorCreatedAt", state.nextCursor);
    }

    if (state.searchKeyword) {
      url.searchParams.append("keyword", state.searchKeyword);
    }

    const { ok, data } = await apiRequest(url.pathname + url.search);
    if (!ok) return;

    state.posts = [...state.posts, ...data.content];
    state.nextCursor = data.nextCursor;
    state.hasNext = data.hasNext;

    renderPosts();
  } finally {
    state.isLoading = false;
  }
}

// ===== 검색 =====
async function runSearch() {
  const searchInput = document.getElementById("search_input");
  state.searchKeyword = searchInput.value.trim();

  // 검색 시작 / 검색어 변경 시 초기화
  state.posts = [];
  state.nextCursor = null;
  state.hasNext = true;

  await loadPosts(); // 검색 모드에서 다시 요청

  renderPosts(); // 비워진 상태부터 UI 반영 (UX 좋음)
}

// =====================
// 5. 이벤트 / 초기화
// =====================

async function initPostListPage() {
  const searchInput = document.getElementById("search_input");
  const searchButton = document.getElementById("search_icon");
  const writeButton = document.getElementById("write_post_button");
  const postList = document.getElementById("post_list");

  if (!searchInput || !searchButton || !writeButton || !postList)
    return { cleanup: () => {} };

  // 글쓰기 버튼
  const handleWrite = () => {
    window.location.href = "#/postCreate";
  };
  writeButton.addEventListener("click", handleWrite);

  const throttle = (fn, delay) => {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last > delay) {
        last = now;
        fn(...args);
      }
    };
  };

  // debounce
  const debounce = (fn, delay) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  };

  // throttle
  const throttledSearch = throttle(runSearch, 1000); // ⬅️ 한 번만 생성

  // 🚀 버튼 클릭 검색
  const handleSearchClick = throttledSearch;
  searchButton.addEventListener("click", handleSearchClick);

  // 🚀 Enter 키 검색
  const handleKeypress = (e) => {
    if (e.key === "Enter") throttledSearch(); // ⬅️ 동일한 throttle
  };
  searchInput.addEventListener("keypress", handleKeypress);

  // === searchInput
  const handleInput = debounce(async () => {
    if (searchInput.value.trim() === "") {
      state.searchKeyword = "";
      state.posts = [];
      state.nextCursor = null;
      state.hasNext = true;

      renderPosts(); // 초기화 리렌더
      await loadPosts(false); // 전체목록 다시 불러오기
    }
  }, 300);
  searchInput.addEventListener("input", handleInput);

  // 인피니티 스크롤
  const sentinel = document.createElement("div");
  sentinel.id = "scroll_sentinel";
  postList.after(sentinel);

  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting && !state.isLoading && state.hasNext) {
      await loadPosts();
    }
  });

  observer.observe(sentinel);

  // 최초 로딩 (데이터 받아온 뒤에 한번만 렌더)
  await loadPosts();

  // cleanup 함수 반환 (이벤트/옵저버 해제)
  return {
    cleanup: () => {
      writeButton.removeEventListener("click", handleWrite);
      searchButton.removeEventListener("click", handleSearchClick);
      searchInput.removeEventListener("keypress", handleKeypress);
      searchInput.removeEventListener("input", handleInput);
      observer.disconnect();
      sentinel.remove();
    },
  };
}

// =====================
// 6. 페이지 엔트리 포인트
// =====================

export default function PostListPage(root) {
  resetState();

  let cleanupObj = null;

  async function mount() {
    // 프로필 이미지 등 상태 먼저 세팅
    await loadUserProfile();

    renderPage(); // Layout 렌더

    // DOM 생성 보장
    await Promise.resolve();

    teardownHeaderEvents();
    setupHeaderEvents();

    cleanupObj = await initPostListPage();
  }

  mount();

  return () => {
    teardownHeaderEvents();
    cleanupObj?.cleanup?.();
    resetState();
  };
}
