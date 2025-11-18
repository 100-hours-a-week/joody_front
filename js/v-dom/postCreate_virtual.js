import { loadUserProfile } from "../utils/user.js";
import { h, createDom, updateElement } from "./common/Vdom.js";
import { initState, getState, setState, subscribe } from "./common/store.js";
import { debounce, throttle } from "../utils/common.js";

initState({
  title: "",
  content: "",
  helper: "",
  submitActive: false,
  image: null,
  previewURL: null, // 미리보기
});

function validateForm() {
  const state = getState();
  const title = state.title.trim();
  const content = state.content.trim();

  const valid = title.length > 0 && content.length > 0;

  setState({
    submitActive: valid,
    helper: valid ? "" : state.helper,
  });
}

// 제목 입력 디바운싱 전
/*function handleTitleInput(e) {
  let v = e.target.value;

  if (v.length > 26) {
    v = v.slice(0, 26);
  }

  setState({ title: v });
  validateForm();
} */
// 제목 입력 디바운싱 처리
const handleTitleInput = debounce((e) => {
  let v = e.target.value;

  if (v.length > 26) {
    v = v.slice(0, 26);
  }

  setState({ title: v });
  validateForm();
}, 80);

// 내용 입력 디바운싱 처리 전
// function handleContentInput(e) {
//   setState({ content: e.target.value });
//   validateForm();
// }
// 내용 입력 디바운싱 처리
const handleContentInput = debounce((e) => {
  setState({ content: e.target.value });
  validateForm();
}, 80);

// 이미지 선택 스로틀링 전
/*function handleImageSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  setState({
    image: file,
    previewURL: URL.createObjectURL(file),
  });
}*/
// 이미지 선택 스로틀링 처리
const handleImageSelect = throttle((e) => {
  const file = e.target.files[0];
  if (!file) return;

  setState({
    image: file,
    previewURL: URL.createObjectURL(file),
  });
}, 300);

// 게시글 작성 스로틀링 처리 전
/*async function handleSubmit(e) {
  e.preventDefault();

  const state = getState();

  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
    return;
  }

  const title = state.title.trim();
  const content = state.content.trim();
  const image = state.image;

  if (!title || !content) {
    setState({ helper: "* 제목과 내용을 모두 입력해주세요." });
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  if (image) formData.append("image", image);

  try {
    const response = await fetch(`http://localhost:8080/posts/${userId}`, {
      method: "POST",
      body: formData,
    });

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
}*/

// 게시글 작성 제출 스로틀링 처리
const handleSubmit = throttle(async (e) => {
  e.preventDefault();

  const state = getState();

  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
    return;
  }

  const title = state.title.trim();
  const content = state.content.trim();
  const image = state.image;

  if (!title || !content) {
    setState({ helper: "* 제목과 내용을 모두 입력해주세요." });
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
  if (image) formData.append("image", image);

  try {
    const response = await fetch(`http://localhost:8080/posts/${userId}`, {
      method: "POST",
      body: formData,
    });

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
}, 2000); // 2초 동안 중복 submit 방지 */

//  VDOM 컴포넌트
function App() {
  const state = getState();
  const active = state.submitActive;

  return h(
    "div",
    { className: "postCreate_wrapper" },

    h(
      "form",
      { id: "edit_form" },

      // 제목
      h("p", { className: "label" }, "제목"),
      h("input", {
        id: "post_title_input",
        value: state.title,
        placeholder: "제목을 입력하세요 (최대 26자)",
        autocomplete: "off",
        oninput: handleTitleInput,
      }),

      // 내용
      h("p", { className: "label" }, "내용"),
      h("textarea", {
        id: "post_content_input",
        placeholder: "내용을 입력하세요.",
        value: state.content,
        oninput: handleContentInput,
      }),

      // 이미지 선택
      h("p", { className: "label" }, "이미지 업로드"),
      h("input", {
        type: "file",
        id: "post_image_input",
        accept: "image/*",
        onchange: handleImageSelect,
      }),

      // 이미지 미리보기
      state.previewURL
        ? h("img", {
            src: state.previewURL,
            id: "preview_img",
            style: {
              width: "180px",
              height: "180px",
              objectFit: "cover",
              borderRadius: "12px",
              marginTop: "10px",
            },
          })
        : null,

      // 헬퍼 텍스트
      h("p", { className: "helper_text" }, state.helper),

      // 버튼
      h(
        "button",
        {
          id: "submit_button",
          type: "submit",
          disabled: !active,
          onclick: handleSubmit,
          style: {
            backgroundColor: active ? "#4baa7d" : "#d9d9d9",
            cursor: active ? "pointer" : "default",
            color: "#fff",
            border: "none",
            marginTop: "20px",
            padding: "10px",
            borderRadius: "8px",
          },
        },
        "작성하기"
      )
    )
  );
}

//  렌더링
const root = document.getElementById("postCreate_app");
let oldVNode = null;

function render() {
  const newVNode = App();
  if (!oldVNode) {
    root.innerHTML = "";
    root.appendChild(createDom(newVNode));
  } else {
    updateElement(root, newVNode, oldVNode);
  }
  oldVNode = newVNode;
}

subscribe(render);

document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile();
  render();
});
