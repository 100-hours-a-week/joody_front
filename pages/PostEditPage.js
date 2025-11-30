// pages/PostEditPage.js
import { loadUserProfile } from "../api/userService.js";
import { h, updateElement, createDom } from "../vdom/Vdom.js";
import { initState, getState, setState, subscribe } from "../vdom/Store.js";
import { throttle, setupHeaderEvents, teardownHeaderEvents } from "../utils/common.js";
import { apiRequest } from "../api/authApi.js";
import PostHeader from "../components/posts/postHeader.js";

export default function PostEditPage(root) {
  if (!root) return;

  const params = new URLSearchParams(location.hash.split("?")[1]);
  const postId = parseInt(params.get("id"));

  if (!postId) {
    alert("잘못된 접근입니다.");
    location.href = "#/postlist";
    return;
  }

  initState({
    postId,
    title: "",
    content: "",
    imageFile: null,
    currentImageName: "",
    helper: "",
    profileImage: "./assets/img/original_profile.png",
  });

  let oldNode = null;
  let unsubscribe = null;

  function update() {
    const newNode = render();
    if (!oldNode) {
      root.innerHTML = "";
      root.appendChild(createDom(newNode));
    } else {
      updateElement(root, newNode, oldNode);
    }
    oldNode = newNode;
    setupHeaderEvents();
  }

  async function init() {
    unsubscribe = subscribe(update);
    update(); // 초기 렌더
    await loadUserProfile();
    await loadPost();
  }

  init();

  return () => {
    if (unsubscribe) unsubscribe();
    teardownHeaderEvents();
  };

  async function loadPost() {
    const { ok, data } = await apiRequest(`/posts/${postId}`);
    if (!ok || !data) {
      alert("게시글 로딩 중 오류 발생!");
      location.href = "#/postlist";
      return;
    }

    const post = data.data;
    setState({
      title: post.title,
      content: post.content,
      currentImageName: post.postImage
        ? post.postImage.split("/").pop()
        : "없음",
    });
  }

  function render() {
    const state = getState();

    return h(
      "div",
      {},
      PostHeader({ backPath: "#/postlist" }),
      h(
        "main",
        { id: "edit_container" },
        h(
          "form",
          {
            id: "edit_form",
            onsubmit: async (e) => {
              e.preventDefault();
              await submitEdit();
            },
          },

          h(
            "div",
            { className: "form_group" },
            h("label", { for: "post_title_input" }, "제목*"),
            h("input", {
              type: "text",
              id: "post_title_input",
              value: state.title,
              placeholder: "제목 (최대 26글자)",
              oninput: throttle((e) => {
                let v = e.target.value;
                if (v.length > 26) v = v.slice(0, 26);
                setState({ title: v });
              }, 150),
            })
          ),

          h(
            "div",
            { className: "form_group" },
            h("label", { for: "post_content_input" }, "내용*"),
            h("textarea", {
              id: "post_content_input",
              rows: 10,
              value: state.content,
              oninput: (e) => setState({ content: e.target.value }),
            })
          ),

          h("p", { className: "helper_text" }, state.helper || ""),

          h(
            "div",
            { className: "form_group" },
            h("label", { for: "post_image_input" }, "이미지"),
            h("input", {
              type: "file",
              accept: "image/*",
              onchange: handleImageChange,
            })
          ),

          h("button", { id: "submit_button", type: "submit" }, "수정하기")
        )
      )
    );
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("3MB 이하만 업로드 가능합니다.");
      return;
    }

    setState({
      imageFile: file,
      currentImageName: file.name,
    });
  }

  async function submitEdit() {
    const state = getState();
    if (!state.title.trim() || !state.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요!");
      return;
    }

    const formData = new FormData();
    formData.append("title", state.title);
    formData.append("content", state.content);
    if (state.imageFile) formData.append("image", state.imageFile);

    const { ok, data } = await apiRequest(`/posts/${state.postId}`, {
      method: "PUT",
      body: formData,
    });

    if (!ok) {
      alert("수정 실패: " + (data?.message || "오류"));
      return;
    }

    location.href = `#/postDetail?id=${data.data.post_id}`;
  }
}
