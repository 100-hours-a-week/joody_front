import { fetchPostDetail } from "../api/postApi.js";
import { fetchComments } from "../api/commentApi.js";

import { renderPost } from "../components/postDetail/renderPosts.js";
import { renderComments } from "../components/postDetail/renderComments.js";

import { setupPostEvents } from "../events/postEvent.js";
import { setupCommentEvents } from "../events/commentEvents.js";
import { setupLikeEvents } from "../events/likeEvent.js";
import { setupModalEvents } from "../events/modalEvent.js";

import { loadUserProfile } from "../api/userService.js";

import { createDom } from "../vdom/Vdom.js";
import PostHeader from "../components/posts/postHeader.js";
import PostDetailLayout from "../components/postDetail/postDetailLayout.js";
import { setupHeaderEvents, dropdownHeaderEvents } from "../utils/common.js";

export default function PostDetailPage(root) {
  let postId = null;

  async function init() {
    root.innerHTML = "";
    root.appendChild(createDom(PostDetailLayout()));

    // URL 파라미터
    const params = new URLSearchParams(location.hash.split("?")[1]);
    postId = params.get("id");

    if (!postId) {
      alert("잘못된 접근입니다.");
      location.hash = "#/postlist";
      return;
    }

    // 프로필 먼저 로드 → 헤더 렌더 시 바로 이미지 반영
    await loadUserProfile();

    // 헤더 mount + 이벤트
    const header = PostHeader({ backPath: "#/postlist" });
    document.body.prepend(createDom(header));
    setupHeaderEvents();

    // 게시글 상세 로드
    const { ok: okPost, data: post } = await fetchPostDetail(postId);
    if (okPost) renderPost(post);

    // 댓글 로드
    const { ok: okCm, data: cm } = await fetchComments(postId);
    if (okCm) renderComments(cm.content);

    // 이벤트 세팅
    setupPostEvents(postId);
    setupCommentEvents(postId);
    setupLikeEvents(postId);
    setupModalEvents();
  }

  function unmount() {
    dropdownHeaderEvents();

    // Header DOM 제거
    const header = document.getElementById("mainHeader");
    if (header) header.remove();
  }

  init();
  return unmount;
}
