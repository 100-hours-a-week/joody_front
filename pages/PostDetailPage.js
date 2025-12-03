// PostDetailPage.js
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
import { setupHeaderEvents, dropdownHeaderEvents } from "../utils/common.js";

export default function PostDetailPage(root) {
  let postId = null;

  async function init() {
    root.innerHTML = `

      <div id="post_container">
        <p id="post_title"></p>
        <div id="post_info">
          <img id="post_author_img" alt="작성자 프로필 이미지"/>
          <p id="post_author"></p>
          <p id="post_date"></p>
          <button id="edit_button">수정</button>
          <button id="delete_button">삭제</button>
        </div>

        <div id="post_content">
          <img id="post_image" src="" alt="게시글 이미지"/>
          <p></p>
        </div>

        <div id="post_infos">
          <div class="stat_item" id="like_stat">
            <img src="./assets/img/like_off.svg" class="stat_icon" id="like_icon"/>
            <span id="like_count" class="stat_number"></span>
          </div>

          <div class="stat_item">
            <img src="./assets/img/comment.svg" class="stat_icon"/>
            <span id="comment_count" class="stat_number"></span>
          </div>

          <div class="stat_item">
            <img src="./assets/img/view.svg" class="stat_icon"/>
            <span id="view_count" class="stat_number"></span>
          </div>
        </div>
      </div>

      <div id="comments_container">
        <div id="comment_write_box">
          <textarea id="comment_input" placeholder="댓글을 남겨주세요!" aria-label="댓글 입력"></textarea>
          <button
            id="submit_comment_button"
            disabled
            style="background-color: #d9d9d9"
          >
            댓글 등록
          </button>
        </div>

        <div id="comment_list"></div>
      </div>

      <div id="post_modal_overlay" class="hidden">
        <div id="post_delete_modal" class="modal_box">
          <h2>게시글을 삭제하시겠습니까?</h2>
          <p>삭제한 내용은 복구할 수 없습니다.</p>
          <div class="modal_buttons">
            <button class="cancel_button">취소</button>
            <button class="confirm_button">확인</button>
          </div>
        </div>
      </div>

      <div id="comment_modal_overlay" class="hidden">
        <div id="comment_delete_modal" class="modal_box">
          <h2>댓글을 삭제하시겠습니까?</h2>
          <p>삭제한 내용은 복구할 수 없습니다.</p>
          <div class="modal_buttons">
            <button class="cancel_button">취소</button>
            <button id="comment_confirm_button">확인</button>
          </div>
        </div>
      </div>
    `;

    // URL 파라미터
    const params = new URLSearchParams(location.hash.split("?")[1]);
    postId = params.get("id");

    if (!postId) {
      alert("잘못된 접근입니다.");
      location.hash = "#/postlist";
      return;
    }

    // 1. 프로필 먼저 로드 → 헤더 렌더 시 바로 이미지 반영
    await loadUserProfile();

    // 2. 헤더 mount + 이벤트
    const header = PostHeader({ backPath: "#/postlist" });
    document.body.prepend(createDom(header));
    setupHeaderEvents();

    // 3. 게시글 상세 로드
    const { ok: okPost, data: post } = await fetchPostDetail(postId);
    if (okPost) renderPost(post);

    // 4. 댓글 로드
    const { ok: okCm, data: cm } = await fetchComments(postId);
    if (okCm) renderComments(cm.content);

    // 5. 이벤트 세팅
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
