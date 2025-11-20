import { h, createDom, updateElement } from "./common/Vdom.js";
import { initState, getState, setState, subscribe } from "./common/store.js";
import { debounce, throttle } from "../utils/common.js";
import { loadUserProfile } from "../utils/user.js";
import { apiRequest } from "../utils/api.js";

document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile();

  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get("id"));

  if (!postId) {
    alert("잘못된 접근입니다.");
    window.location.href = "postList.html";
    return;
  }

  // 초기 state
  initState({
    postId,
    title: "",
    content: "",
    imageFile: null,
    currentImageName: "",
    error: "",
  });

  /** 1) 먼저 게시글 데이터 로드 */
  await loadPost();

  /** 2) Virtual DOM mount는 딱 한 번! */
  const root = document.getElementById("edit_container");
  let oldNode = null;

  function update() {
    const newNode = render();
    updateElement(root, newNode, oldNode);
    oldNode = newNode;
  }

  /** 3) 구독 → state 변경 시 자동 update */
  subscribe(update);

  /** 4) 최초 렌더 */
  update();

  // 기존 게시글 정보 로드
  async function loadPost() {
    const { ok, data } = await apiRequest(`/posts/${postId}`);

    if (!ok || !data) {
      alert("게시글 로딩 중 오류 발생");
      window.location.href = "postList.html";
      return;
    }

    const post = data.data;

    console.log("로드된 게시글 :", post);

    setState({
      title: post.title,
      content: post.content,
      currentImageName: post.postImage
        ? post.postImage.split("/").pop()
        : "없음",
    });
  }

  /** ---------------- Virtual DOM 렌더 ---------------- */
  function render() {
    const state = getState();

    console.log(state);
    console.log(state.title);

    return h(
      "form",
      {
        id: "edit_form",
        onsubmit: async (e) => {
          e.preventDefault();
          await submitEdit();
        },
      },

      // ---- 제목 ----
      h(
        "div",
        { className: "form_group" },
        h("label", { for: "post_title_input" }, "제목*"),
        h("input", {
          type: "text",
          id: "post_title_input",
          name: "title",
          required: true,
          placeholder: "제목을 입력해주세요.(최대 26글자)",
          value: state.title,
          oninput: throttle((e) => {
            let v = e.target.value;
            if (v.length > 26) v = v.slice(0, 26);
            setState({ title: v });
          }, 150),
        })
      ),

      // ---- 내용 ----
      h(
        "div",
        { className: "form_group" },
        h("label", { for: "post_content_input" }, "내용*"),
        h("textarea", {
          id: "post_content_input",
          name: "content",
          rows: 10,
          required: true,
          placeholder: "내용을 입력해주세요.",
          value: state.content,
          oninput: (e) => {
            const text = e.target.value;
            if (text.length > 65535) {
              alert("본문이 너무 깁니다!");
              setState({ content: text.slice(0, 65535) });
            } else {
              setState({ content: text });
            }
          },
        })
      ),

      // helper text
      h("p", { className: "helper_text" }, state.helper),

      // ---- 이미지 ----
      h(
        "div",
        { className: "form_group" },
        h("label", { for: "post_image_input" }, "이미지"),
        h("input", {
          type: "file",
          id: "post_image_input",
          name: "image",
          accept: "image/*",
          onchange: handleImageChange,
        })
      ),

      // ---- 버튼 ----
      h(
        "button",
        {
          id: "submit_button",
          type: "submit",
        },
        "작성하기"
      )
    );
  }

  async function handleImageChange(e) {
    const file = e.target.files[0];

    if (!file) {
      setState({
        imageFile: null,
        currentImageName: "선택된 파일 없음",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      e.target.value = "";
      setState({ imageFile: null, currentImageName: "선택된 파일 없음" });
      return;
    }

    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("3MB 이하만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }

    setState({
      imageFile: file,
      currentImageName: `${file.name} (${(file.size / 1024).toFixed(1)}KB)`,
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

    const newId = data.data.post_id;
    window.location.href = `post.html?id=${newId}&t=${Date.now()}`;
  }
});
