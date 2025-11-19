import { loadUserProfile } from "../utils/user.js";

import { createDom } from "./common/Vdom.js";

// ==== 성능 테스트 전용 유틸 ====
// document
//   .getElementById("perf_start")
//   .addEventListener("click", () => perf.start());
// document.getElementById("perf_end").addEventListener("click", () => perf.end());

const perf = {
  apiCalls: 0,
  inputEvents: 0,
  scrollEvents: 0,
  startTime: 0,

  start() {
    console.log(
      "%c[PERF] 성능 테스트 시작",
      "color: green; font-weight: bold;"
    );
    this.apiCalls = 0;
    this.inputEvents = 0;
    this.scrollEvents = 0;
    this.startTime = performance.now();
  },

  end() {
    const duration = (performance.now() - this.startTime).toFixed(2);
    console.log("%c===== 성능 결과 =====", "color: blue; font-weight: bold;");
    console.table({
      "API 호출 수": this.apiCalls,
      "input 이벤트 수": this.inputEvents,
      "스크롤 이벤트 수": this.scrollEvents,
      "총 수행 시간(ms)": duration,
    });
  },
};
// =========================

function h(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat(),
  };
}

// postList 영역만 통째로 다시 렌더
function render(vnode, container) {
  container.innerHTML = "";
  container.appendChild(createDom(vnode));
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000).toFixed(0) + "k";
  if (num >= 1000) return Math.floor(num / 1000) + "k";
  return num;
};

const truncate = (text, max) =>
  text.length > max ? text.slice(0, max) + "…" : text;

// 전역 상태 (state) 정의
const state = {
  posts: [],
  nextCursor: null,
  hasNext: true,
  isLoading: false,
  searchKeyword: "",
};

// 게시글 리스트를 Virtual DOM으로 렌더
function PostListView(posts) {
  // post-card 클릭 핸들러
  const handleCardClick = (id) => () => {
    window.location.href = `post.html?id=${id}`;
  };

  return h(
    "div",
    {},
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

// 데이터 로딩 로직 (인피니티 스크롤 + 검색 그대로 사용)
async function loadPosts(isSearch = state.searchKeyword !== "") {
  perf.apiCalls++; // 🚀 API 호출 수 기록
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

    // const response = await fetch(url);
    // 인증 토큰 추가
    const accessToken = localStorage.getItem("access_token");
    console.log(accessToken);

    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // ⭐ 쿠키 포함
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    });

    // ⭐ 401 / 403 처리
    if (response.status === 401) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login.html";
      return;
    }
    if (response.status === 403) {
      alert("권한이 없습니다. 다시 로그인해주세요.");
      window.location.href = "/login.html";
      return;
    }

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

// DOMContentLoaded 이후 초기화
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
  // searchButton.addEventListener("click", () => {
  //   runSearch();
  // });

  // // Enter로 검색
  // searchInput.addEventListener("keypress", (e) => {
  //   if (e.key === "Enter") runSearch();
  // });

  // 검색버튼 및 enter키 스로틀링 처리s
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

  searchButton.addEventListener("click", throttle(runSearch, 1000));
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") throttle(runSearch, 1000)();
  });

  // // 검색창 비워지면 전체 목록 자동 재로드
  // searchInput.addEventListener("input", async () => {
  //   perf.inputEvents++; // 🚀 입력 이벤트 기록
  //   if (searchInput.value.trim() === "") {
  //     state.searchKeyword = "";
  //     state.nextCursor = null;
  //     state.hasNext = true;
  //     state.posts = [];
  //     renderPosts();
  //     await loadPosts();
  //   }
  // });

  // 디바운싱 처리
  const debounce = (fn, delay) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  };

  searchInput.addEventListener(
    "input",
    debounce(async () => {
      perf.inputEvents++; // 🚀 입력 이벤트 기록
      if (searchInput.value.trim() === "") {
        state.searchKeyword = "";
        state.nextCursor = null;
        state.hasNext = true;
        state.posts = [];
        renderPosts();
        await loadPosts();
      }
    }, 300)
  );

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
