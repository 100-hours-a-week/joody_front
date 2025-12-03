import { postState } from "../state/postListState.js";
import { renderPosts } from "../components/postlist/renderList.js";
import { loadPosts } from "../api/postApi.js";

export const handleWrite = () => {
  window.location.href = "#/postCreate";
};

export const handleSearchClick = (throttledSearch) => throttledSearch();

export const handleEnterSearch = (e, throttledSearch) => {
  if (e.key === "Enter") throttledSearch();
};

export const handleInputChange = async (e) => {
  if (e.target.value.trim() === "") {
    postState.searchKeyword = "";
    postState.posts = [];
    postState.nextCursor = null;
    postState.hasNext = true;

    renderPosts();
    await loadPosts(false);
  }
};

export const handleIntersection = async (entries) => {
  if (entries[0].isIntersecting && !postState.isLoading && postState.hasNext) {
    await loadPosts();
  }
};
