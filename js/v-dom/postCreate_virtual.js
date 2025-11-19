import { loadUserProfile } from "../utils/user.js";
import { h, createDom, updateElement } from "./common/Vdom.js";
import { initState, getState, setState, subscribe } from "./common/store.js";
import { debounce, throttle } from "../utils/common.js";

// -------------------- 초기 상태 --------------------
initState({
  title: "",
  content: "",
  helper: "",
  submitActive: false,
  image: null,
  previewURL: null,
});

// -------------------- 유효성 검사 --------------------
function validateForm() {
  const s = getState();
  const valid = s.title.trim().length > 0 && s.content.trim().length > 0;

  setState({
    submitActive: valid,
    helper: valid ? "" : s.helper,
  });
}

// -------------------- 입력 핸들러 --------------------
const handleTitleInput = debounce((e) => {
  let v = e.target.value;
  if (v.length > 26) v = v.slice(0, 26);
  setState({ title: v });
  validateForm();
}, 80);

const handleContentInput = debounce((e) => {
  setState({ content: e.target.value });
  validateForm();
}, 80);

const handleImageSelect = throttle((e) => {
  const file = e.target.files[0];
  if (!file) return;
  setState({
    image: file,
    previewURL: URL.createObjectURL(file),
  });
}, 300);

// -------------------- 제출 핸들러 --------------------
const handleSubmit = throttle(async (e) => {
  e.preventDefault();

  const s = getState();
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login.html";
    return;
  }

  if (!s.title.trim() || !s.content.trim()) {
    setState({ helper: "* 제목과 내용을 모두 입력해주세요." });
    return;
  }

  const formData = new FormData();
  formData.append("title", s.title.trim());
  formData.append("content", s.content.trim());
  if (s.image) formData.append("image", s.image);

  try {
    const token = localStorage.getItem("access_token");

    const response = await fetch(`http://localhost:8080/posts/${userId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (response.status === 401 || response.status === 403) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login.html";
      return;
    }

    const result = await response.json();
    if (response.ok) {
      const postId = result.data.post_id;
      localStorage.setItem("CreatedPostId", postId);
      window.location.href = "postList.html";
    } else {
      alert("게시글 작성 실패: " + (result.message || "오류"));
    }
  } catch (err) {
    console.error("게시글 작성 오류:", err);
    alert("서버 오류가 발생했습니다.");
  }
}, 2000);

// -------------------- VDOM 컴포넌트 --------------------
function App() {
  const s = getState();
  const active = s.submitActive;

  return h(
    "form",
    { id: "edit_form" },

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
        value: s.title,
        oninput: handleTitleInput,
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
        value: s.content,
        oninput: handleContentInput,
      })
    ),

    // helper text
    h("p", { className: "helper_text" }, s.helper),

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
        onchange: handleImageSelect,
      })
    ),

    // ---- 버튼 ----
    h(
      "button",
      {
        key: "submit",
        id: "submit_button",
        type: "submit",
        disabled: active ? null : "disabled",
        onclick: handleSubmit,
        style: {
          backgroundColor: active ? "#4baa7d" : "#d9d9d9",
          cursor: active ? "pointer" : "default",
        },
      },
      "작성하기"
    )
  );
}

// -------------------- 렌더링 --------------------
const root = document.getElementById("edit_container");
let oldVNode = null;

function render() {
  const newVNode = App();

  if (!oldVNode) {
    root.innerHTML = "";
    root.appendChild(createDom(newVNode));
  } else {
    updateElement(root, newVNode, oldVNode); // ⭐ diff 기반 업데이트
  }

  oldVNode = newVNode;
}

subscribe(render);

// -------------------- 초기 실행 --------------------
document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile();
  render();
});
