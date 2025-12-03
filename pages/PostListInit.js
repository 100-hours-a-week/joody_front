import { debounce, throttle } from "../utils/common.js";
import { runSearch, loadPosts } from "../api/postApi.js";
import {
  handleWrite,
  handleSearchClick,
  handleEnterSearch,
  handleInputChange,
  handleIntersection,
} from "../handlers/postListHandlers.js";

export async function PostListInit() {
  const searchInput = document.getElementById("search_input");
  const searchButton = document.getElementById("search_icon");
  const writeButton = document.getElementById("write_post_button");
  const postList = document.getElementById("post_list");

  if (!searchInput || !searchButton || !writeButton || !postList)
    return { cleanup: () => {} };

  writeButton.addEventListener("click", handleWrite);

  // throttle
  const throttledSearch = throttle(runSearch, 1000);

  // 버튼 클릭 검색
  searchButton.addEventListener("click", () =>
    handleSearchClick(throttledSearch)
  );
  searchInput.addEventListener("keypress", (e) =>
    handleEnterSearch(e, throttledSearch)
  );

  // Enter 키 검색
  const debouncedInput = debounce(handleInputChange, 300);
  searchInput.addEventListener("input", debouncedInput);

  // 인피니티 스크롤
  const sentinel = document.createElement("div");
  sentinel.id = "scroll_sentinel";
  postList.after(sentinel);

  const observer = new IntersectionObserver(handleIntersection);
  observer.observe(sentinel);

  // 최초 로딩 (데이터 받아온 뒤에 한번만 렌더)
  await loadPosts();

  // cleanup 함수 반환 (이벤트/옵저버 해제)
  return {
    cleanup: () => {
      writeButton.removeEventListener("click", handleWrite);
      searchButton.removeEventListener("click", () =>
        handleSearchClick(throttledSearch)
      );
      searchInput.removeEventListener("keypress", handleEnterSearch);
      searchInput.removeEventListener("input", debouncedInput);
      observer.disconnect();
      sentinel.remove();
    },
  };
}
