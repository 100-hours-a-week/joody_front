/*************************************
 * 0. Virtual DOM 기초 유틸
 *************************************/
function h(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat(),
  };
}

function createElement(vnode) {
  if (vnode === null || vnode === undefined) return document.createTextNode("");
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
      const eventName = key.slice(2).toLowerCase();
      el.addEventListener(eventName, value);
    } else if (key === "dataset" && typeof value === "object") {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        el.dataset[dataKey] = dataValue;
      });
    } else if (key === "value") {
      // input / textarea 컨트롤
      if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
        el.value = value;
      } else {
        el.setAttribute(key, value);
      }
    } else if (key === "disabled") {
      if (value) el.setAttribute("disabled", "");
    } else {
      el.setAttribute(key, value);
    }
  }

  // children
  vnode.children.forEach((child) => {
    el.appendChild(createElement(child));
  });

  return el;
}

function render(vnode, container) {
  container.innerHTML = "";
  container.appendChild(createElement(vnode));
}

/*************************************
 * 1. 전역 state
 *************************************/
const state = {
  profileImage: "./img/original_profile.png",

  postId: null,
  post: null,

  comments: [],
  isEditing: false,
  editingCommentId: null,
  editingCommentContent: "",

  commentInputText: "",
  liked: false,
  likedPosts: [],

  modals: {
    postDeleteOpen: false,
    commentDeleteOpen: false,
  },
  targetCommentToDeleteId: null,

  isProfileOpen: false,
};

/*************************************
 * 2. 유틸 함수
 *************************************/
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return Math.floor(num / 1_000) + "K";
  return num;
}

function formatDate(dateTime) {
  if (!dateTime) return "-";
  const date = new Date(dateTime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function disableScroll() {
  document.body.style.overflow = "hidden";
}

function enableScroll() {
  document.body.style.overflow = "";
}

function setState(patch) {
  Object.assign(state, patch);
  renderApp();
}

/*************************************
 * 3. 공통 기능: 프로필 로드
 *************************************/
async function loadUserProfile() {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("로그인된 사용자 ID가 없습니다.");
      return;
    }

    const res = await fetch(`http://localhost:8080/users/${userId}/profile`);
    const json = await res.json();

    if (json.message === "read_success") {
      const imgUrl = json.data.profileImage;
      const profileImage = imgUrl
        ? imgUrl.startsWith("http")
          ? imgUrl
          : `http://localhost:8080${imgUrl}`
        : "./img/original_profile.png";

      setState({ profileImage });
    }
  } catch (err) {
    console.error("프로필 불러오기 실패:", err);
  }
}

/*************************************
 * 4. 데이터 로딩: 게시글 / 댓글
 *************************************/
async function fetchPost() {
  try {
    const response = await fetch(`http://localhost:8080/posts/${state.postId}`);
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    const post = result.data;

    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    const liked = likedPosts.includes(Number(state.postId));

    setState({
      post,
      liked,
      likedPosts,
    });
  } catch (error) {
    console.error("게시글 조회 실패:", error);
    alert("게시글을 불러오는 중 오류가 발생했습니다.");
  }
}

async function fetchComments() {
  try {
    const response = await fetch(
      `http://localhost:8080/posts/${state.postId}/comments`
    );
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    const comments = result.data?.content || [];

    setState({
      comments,
      post: {
        ...state.post,
        commentCount: result.data?.totalElements ?? comments.length,
      },
    });
  } catch (e) {
    console.error("댓글 조회 실패:", e);
  }
}

/*************************************
 * 5. 이벤트 핸들러들
 *************************************/

// 프로필 드롭다운
function toggleProfileDropdown(e) {
  e.stopPropagation();
  setState({ isProfileOpen: !state.isProfileOpen });
}

// 바깥 클릭 시 드롭다운 닫기
function handleWindowClick(e) {
  const menu = document.querySelector(".profile-menu");
  if (menu && !e.target.closest(".profile-menu") && state.isProfileOpen) {
    setState({ isProfileOpen: false });
  }
}

// 게시글 수정 버튼
function handleEditPost() {
  window.location.href = `postEdit.html?id=${state.postId}`;
}

// 게시글 삭제 모달 열기
function openPostDeleteModal() {
  disableScroll();
  setState({
    modals: { ...state.modals, postDeleteOpen: true },
  });
}

// 게시글 삭제 모달 닫기
function closePostDeleteModal() {
  enableScroll();
  setState({
    modals: { ...state.modals, postDeleteOpen: false },
  });
}

// 댓글 삭제 모달 열기
function openCommentDeleteModal(commentId) {
  disableScroll();
  setState({
    modals: { ...state.modals, commentDeleteOpen: true },
    targetCommentToDeleteId: commentId,
  });
}

// 댓글 삭제 모달 닫기
function closeCommentDeleteModal() {
  enableScroll();
  setState({
    modals: { ...state.modals, commentDeleteOpen: false },
    targetCommentToDeleteId: null,
  });
}

// 게시글 삭제
async function handleDeletePost() {
  try {
    const response = await fetch(
      `http://localhost:8080/posts/${state.postId}`,
      {
        method: "DELETE",
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message);

    window.location.href = "postList.html";
  } catch (e) {
    console.error("게시글 삭제 실패:", e);
    alert("게시글 삭제 중 오류가 발생했습니다.");
  } finally {
    closePostDeleteModal();
  }
}

// 댓글 입력 변화
function handleCommentInput(e) {
  setState({ commentInputText: e.target.value });
}

// 댓글 수정 시작
function startEditComment(comment) {
  disableScroll();
  setState({
    isEditing: true,
    editingCommentId: comment.id,
    editingCommentContent: comment.content,
    commentInputText: comment.content,
  });
}

// 댓글 폼 초기화
function resetCommentForm() {
  enableScroll();
  setState({
    isEditing: false,
    editingCommentId: null,
    editingCommentContent: "",
    commentInputText: "",
  });
}

// 댓글 등록/수정
async function handleSubmitComment() {
  const text = state.commentInputText.trim();
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("로그인이 필요합니다.");
    return;
  }
  if (!text) {
    alert("댓글 내용을 입력해주세요.");
    return;
  }

  // 수정 모드
  if (state.isEditing && state.editingCommentId) {
    try {
      const response = await fetch(
        `http://localhost:8080/posts/${state.postId}/comments/${state.editingCommentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "댓글 수정 실패");

      const updatedComments = state.comments.map((c) =>
        c.id === state.editingCommentId
          ? { ...c, content: text, updatedAt: new Date().toISOString() }
          : c
      );

      setState({ comments: updatedComments });
      resetCommentForm();
    } catch (e) {
      console.error("댓글 수정 실패:", e);
      alert("댓글 수정 중 오류가 발생했습니다.");
    }
    return;
  }

  // 작성 모드
  try {
    const response = await fetch(
      `http://localhost:8080/posts/${state.postId}/comments/${userId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "댓글 등록 실패");

    const newComment = {
      id: result.data.comment_id,
      authorNickname: localStorage.getItem("nickname") || "익명",
      authorProfileImage:
        localStorage.getItem("profileImage") || "./img/profile.png",
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newComments = [newComment, ...state.comments]; // 최신 댓글 위로
    const newCount = (state.post?.commentCount || 0) + 1;

    setState({
      comments: newComments,
      post: { ...state.post, commentCount: newCount },
      commentInputText: "",
    });
  } catch (err) {
    console.error("댓글 등록 실패:", err);
    alert("댓글 등록 중 오류가 발생했습니다.");
  }
}

// 댓글 삭제 확정
async function confirmDeleteComment() {
  const commentId = state.targetCommentToDeleteId;
  if (!commentId) return;

  try {
    const response = await fetch(
      `http://localhost:8080/posts/${state.postId}/comments/${commentId}`,
      { method: "DELETE" }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "댓글 삭제 실패");

    const filtered = state.comments.filter((c) => c.id !== commentId);
    const newCount = Math.max((state.post?.commentCount || 1) - 1, 0);

    setState({
      comments: filtered,
      post: { ...state.post, commentCount: newCount },
    });
  } catch (e) {
    console.error("댓글 삭제 실패:", e);
    alert("댓글 삭제 중 오류가 발생했습니다.");
  } finally {
    closeCommentDeleteModal();
  }
}

// 좋아요 토글
async function handleLikeToggle() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("로그인이 필요합니다.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/posts/${state.postId}/likes/toggle?userId=${userId}`,
      {
        method: "POST",
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "좋아요 요청 실패");

    const data = result.data;
    const liked = data.liked;
    const likeCount = data.like_count;

    let likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    if (liked && !likedPosts.includes(Number(state.postId))) {
      likedPosts.push(Number(state.postId));
    } else if (!liked) {
      likedPosts = likedPosts.filter((id) => id !== Number(state.postId));
    }
    localStorage.setItem("likedPosts", JSON.stringify(likedPosts));

    setState({
      liked,
      likedPosts,
      post: { ...state.post, likes: likeCount },
    });
  } catch (err) {
    console.error("좋아요 토글 실패:", err);
    alert("좋아요 처리 중 오류가 발생했습니다.");
  }
}

/*************************************
 * 6. V-DOM View 컴포넌트들
 *************************************/

// 헤더 (기존 HTML 구조 맞춤)
function HeaderView() {
  return h(
    "header",
    { id: "main_header" },
    h(
      "a",
      {
        href: "/postlist.html",
        id: "back_link",
        "aria-label": "뒤로가기",
      },
      h("img", {
        id: "back_button",
        src: "./img/back_1.png",
        alt: "뒤로가기",
      })
    ),
    h(
      "p",
      { id: "header_title" },
      h("img", {
        src: "./img/logo4.png",
        alt: "아무 말 대잔치 로고",
        id: "header_logo",
      })
    ),
    h(
      "div",
      { className: "profile-menu" },
      h("img", {
        id: "profile_img",
        src: state.profileImage,
        alt: "프로필 이미지",
        onClick: toggleProfileDropdown,
      }),
      h(
        "ul",
        {
          id: "dropdown_menu",
          className: state.isProfileOpen ? "" : "hidden",
        },
        h("li", {}, h("a", { href: "/profileEdit.html" }, "회원정보수정")),
        h("li", {}, h("a", { href: "/passwordEdit.html" }, "비밀번호수정")),
        h("li", {}, h("a", { href: "/login.html" }, "로그아웃"))
      )
    )
  );
}

// 게시글 컨테이너 (기존 #post_container 구조)
function PostContainerView() {
  const post = state.post;
  if (!post) {
    return h("div", { className: "loading" }, "게시글 불러오는 중...");
  }

  const postImageUrl = post.postImage
    ? post.postImage.startsWith("http")
      ? post.postImage
      : `http://localhost:8080/${post.postImage.replace(/^\/+/, "")}`
    : null;

  const authorProfileUrl = post.authorProfileImage
    ? post.authorProfileImage.startsWith("http")
      ? post.authorProfileImage
      : `http://localhost:8080${post.authorProfileImage}`
    : "./img/profile.png";

  return h(
    "div",
    { id: "post_container" },
    h("p", { id: "post_title" }, post.title),
    h(
      "div",
      { id: "post_info" },
      h("img", {
        id: "post_author_img",
        src: authorProfileUrl,
        alt: "작성자 프로필 이미지",
      }),
      h("p", { id: "post_author" }, post.author || "작성자"),
      h("p", { id: "post_date" }, formatDate(post.createdAt)),
      h("button", { id: "edit_button", onClick: handleEditPost }, "수정"),
      h("button", { id: "delete_button", onClick: openPostDeleteModal }, "삭제")
    ),
    h(
      "div",
      { id: "post_content" },
      postImageUrl
        ? h("img", {
            id: "post_image",
            src: postImageUrl + `?t=${Date.now()}`,
            alt: "게시글 이미지",
          })
        : null,
      h("p", {}, post.content)
    ),
    h(
      "div",
      { id: "post_infos" },
      h(
        "div",
        { className: "stat_item", id: "like_stat", onClick: handleLikeToggle },
        h("img", {
          src: state.liked ? "./img/like_on.svg" : "./img/like_off.svg",
          className: "stat_icon",
          id: "like_icon",
        }),
        h(
          "span",
          { id: "like_count", className: "stat_number" },
          formatNumber(post.likes)
        )
      ),
      h(
        "div",
        { className: "stat_item" },
        h("img", {
          src: "./img/comment.svg",
          className: "stat_icon",
        }),
        h(
          "span",
          { id: "comment_count", className: "stat_number" },
          formatNumber(post.commentCount || state.comments.length)
        )
      ),
      h(
        "div",
        { className: "stat_item" },
        h("img", {
          src: "./img/view.svg",
          className: "stat_icon",
        }),
        h(
          "span",
          { id: "view_count", className: "stat_number" },
          formatNumber(post.views)
        )
      )
    )
  );
}

// 댓글 입력 + 리스트 컨테이너 (기존 #comments_container 구조)
// function CommentInputView() {
//   const disabled = state.commentInputText.trim().length === 0;

//   return h(
//     "div",
//     { id: "comment_write_box" },
//     h("textarea", {
//       id: "comment_input",
//       placeholder: "댓글을 남겨주세요!",
//       value: state.commentInputText, // ← 추가
//       onInput: handleCommentInput,
//     }),
//     h(
//       "button",
//       {
//         id: "submit_comment_button",
//         disabled,
//         style: {
//           backgroundColor: disabled ? "#dcdbe3" : "#4baa7d",
//         },
//         onClick: handleSubmitComment,
//       },
//       state.isEditing ? "댓글 수정" : "댓글 등록"
//     )
//   );
// }

function CommentItemView(comment) {
  const avatar = comment.authorProfileImage
    ? comment.authorProfileImage.startsWith("http")
      ? comment.authorProfileImage
      : `http://localhost:8080${comment.authorProfileImage}`
    : "./img/original_profile.png";

  const nickname = comment.authorNickname || comment.author || "익명";

  const dateText =
    comment.updatedAt && comment.updatedAt !== comment.createdAt
      ? `${formatDate(comment.updatedAt)} (수정됨)`
      : formatDate(comment.createdAt);

  return h(
    "div",
    {
      className: "comment_item",
      dataset: { commentId: comment.id },
    },
    h("img", {
      className: "comment_author_img",
      src: avatar,
      alt: "작성자 프로필 이미지",
    }),
    h(
      "div",
      { className: "comment_body" },
      h(
        "div",
        { className: "comment_header" },
        h(
          "div",
          { className: "comment_info" },
          h("p", { className: "comment_author" }, nickname),
          h("p", { className: "comment_date" }, dateText)
        ),
        h(
          "div",
          { className: "comment_buttons" },
          h(
            "button",
            {
              className: "edit_comment_button",
              onClick: () => startEditComment(comment),
            },
            "수정"
          ),
          h(
            "button",
            {
              className: "delete_comment_button",
              onClick: () => openCommentDeleteModal(comment.id),
            },
            "삭제"
          )
        )
      ),
      h("p", { className: "comment_content" }, comment.content)
    )
  );
}

// function CommentsContainerView() {
//   return h(
//     "div",
//     { id: "comments_container" },
//     CommentInputView(),
//     h(
//       "div",
//       { id: "comment_list" },
//       state.comments.map((c) => CommentItemView(c))
//     )
//   );
// }

function CommentsContainerView() {
  return h(
    "div",
    { id: "comments_container" },
    h(
      "div",
      { id: "comment_list" },
      state.comments.map((c) => CommentItemView(c))
    )
  );
}

// 게시글 삭제 모달 (기존 HTML 구조)
function PostDeleteModalView() {
  return h(
    "div",
    {
      id: "post_modal_overlay",
      className: state.modals.postDeleteOpen ? "" : "hidden",
      onClick: (e) => {
        if (e.target.id === "post_modal_overlay") closePostDeleteModal();
      },
    },
    h(
      "div",
      { id: "post_delete_modal", className: "modal_box" },
      h("h2", {}, "게시글을 삭제하시겠습니까?"),
      h("p", {}, "삭제한 내용은 복구할 수 없습니다."),
      h(
        "div",
        { className: "modal_buttons" },
        h(
          "button",
          { className: "cancel_button", onClick: closePostDeleteModal },
          "취소"
        ),
        h(
          "button",
          { className: "confirm_button", onClick: handleDeletePost },
          "확인"
        )
      )
    )
  );
}

// 댓글 삭제 모달 (기존 HTML 구조)
function CommentDeleteModalView() {
  return h(
    "div",
    {
      id: "comment_modal_overlay",
      className: state.modals.commentDeleteOpen ? "" : "hidden",
      onClick: (e) => {
        if (e.target.id === "comment_modal_overlay") closeCommentDeleteModal();
      },
    },
    h(
      "div",
      { id: "comment_delete_modal", className: "modal_box" },
      h("h2", {}, "댓글을 삭제하시겠습니까?"),
      h("p", {}, "삭제한 내용은 복구할 수 없습니다."),
      h(
        "div",
        { className: "modal_buttons" },
        h(
          "button",
          { className: "cancel_button", onClick: closeCommentDeleteModal },
          "취소"
        ),
        h(
          "button",
          { id: "comment_confirm_button", onClick: confirmDeleteComment },
          "확인"
        )
      )
    )
  );
}

/*************************************
 * 7. 전체 App View + 렌더
 *************************************/
function AppView() {
  return h(
    "div",
    { id: "post_page" },
    HeaderView(),
    PostContainerView(),
    CommentsContainerView(),
    PostDeleteModalView(),
    CommentDeleteModalView()
  );
}

function renderApp() {
  const root = document.getElementById("post_root");
  if (!root) {
    console.error("#post_root 요소를 찾을 수 없습니다.");
    return;
  }

  const vnode = AppView();
  render(vnode, root);
  // textarea는 DOM이기 때문에 VDOM 렌더 후 값만 반영
  const textarea = document.getElementById("comment_input");
  if (textarea) {
    textarea.value = state.commentInputText;
  }
}

/*************************************
 * 8. 초기 실행부
 *************************************/
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");

  if (!postId) {
    alert("잘못된 접근입니다.");
    window.location.href = "postList.html";
    return;
  }

  state.postId = postId;

  // textarea(실제 DOM) 이벤트 연결
  const textarea = document.getElementById("comment_input");
  textarea.addEventListener("input", handleCommentInput);

  const submitBtn = document.getElementById("submit_comment_button");
  submitBtn.addEventListener("click", handleSubmitComment);

  window.addEventListener("click", handleWindowClick);

  renderApp(); // 초기 빈 상태 렌더
  await loadUserProfile();
  await fetchPost();
  await fetchComments();
});
