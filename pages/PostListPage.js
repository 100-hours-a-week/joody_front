import { loadUserProfile } from "../api/userService.js";
import { setupHeaderEvents, dropdownHeaderEvents } from "../utils/common.js";
import { resetPostState } from "../state/postListState.js";
import { renderPage } from "../components/postlist/renderList.js";
import { PostListInit } from "./PostListInit.js";

export default function PostListPage(root) {
  resetPostState();

  let cleanupObj = null;

  async function mount() {
    // 프로필 이미지 등 상태 먼저 세팅
    await loadUserProfile();

    renderPage(); // Layout 렌더

    // DOM 생성 보장
    await Promise.resolve();

    dropdownHeaderEvents();
    setupHeaderEvents();

    cleanupObj = await PostListInit();
  }

  mount();

  return () => {
    dropdownHeaderEvents();
    cleanupObj?.cleanup?.();
    resetPostState();
  };
}
