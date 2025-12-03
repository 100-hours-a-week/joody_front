export const postState = {
  allPosts: [], // 전체 게시글 저장
  posts: [], // 화면에 렌더링되는 게시글
  nextCursor: null,
  hasNext: true,
  isLoading: false,
  searchKeyword: "",
};

export function resetPostState() {
  postState.allPosts = [];
  postState.posts = [];
  postState.nextCursor = null;
  postState.hasNext = true;
  postState.isLoading = false;
  postState.searchKeyword = "";
}
