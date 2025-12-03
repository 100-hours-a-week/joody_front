import { apiRequest } from "./authApi.js";
import { setState } from "../vdom/Store.js";
import { postState } from "../state/postListState.js";
import { renderPosts } from "../components/postlist/renderList.js";

/* 게시글 상세조회 API */
export async function fetchPostDetail(postId) {
  return apiRequest(`/posts/${postId}`);
}

export async function deletePostApi(postId) {
  return apiRequest(`/posts/${postId}`, { method: "DELETE" });
}

export async function loadPostData(postId) {
  const { ok, data } = await apiRequest(`/posts/${postId}`);

  if (!ok || !data) {
    alert("게시글 로딩 중 오류 발생!");
    location.href = "#/postlist";
    return;
  }

  setState({
    title: data.title,
    content: data.content,
    currentImageName: data.postImage ? data.postImage.split("/").pop() : "없음",
  });
}

/* 게시글 리스트 API */
export async function loadPosts(isSearch = postState.searchKeyword !== "") {
  if (postState.isLoading || !postState.hasNext) return;
  postState.isLoading = true;

  try {
    const url = new URL("http://localhost:8080/posts");
    url.searchParams.append("size", 5);

    if (postState.nextCursor) {
      url.searchParams.append("cursorCreatedAt", postState.nextCursor);
    }

    if (postState.searchKeyword) {
      url.searchParams.append("keyword", postState.searchKeyword);
    }

    const { ok, data } = await apiRequest(url.pathname + url.search);
    if (!ok) return;

    postState.posts = [...postState.posts, ...data.content];
    postState.nextCursor = data.nextCursor;
    postState.hasNext = data.hasNext;

    renderPosts();
  } finally {
    postState.isLoading = false;
  }
}

// 검색
export async function runSearch() {
  const searchInput = document.getElementById("search_input");
  postState.searchKeyword = searchInput.value.trim();

  // 검색 시작 / 검색어 변경 시 초기화
  postState.posts = [];
  postState.nextCursor = null;
  postState.hasNext = true;

  await loadPosts(); // 검색 모드에서 다시 요청

  renderPosts(); // 비워진 상태부터 UI 반영 (UX 좋음)
}
