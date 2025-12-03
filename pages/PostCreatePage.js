import { loadUserProfile } from "../api/userService.js";
import { createDom, updateElement } from "../vdom/Vdom.js";
import { initState, getState, subscribe } from "../vdom/Store.js";
import { setupHeaderEvents, dropdownHeaderEvents } from "../utils/common.js";

import {
  handleContentInput,
  handleImageSelect,
  handleTitleInput,
  handleSubmit,
} from "../handlers/postCreateHandlers.js";

import PostCreateView from "../components/postCreate/PostCreateView.js";

export default function PostCreatePage(root) {
  initState({
    title: "",
    content: "",
    helper: "",
    submitActive: false,
    image: null,
    previewURL: null,
  });

  let oldVNode = null;
  let unsubscribe = null;

  function render() {
    const state = getState();
    const handlers = {
      handleTitleInput,
      handleContentInput,
      handleImageSelect,
      handleSubmit,
    };
    const newVNode = PostCreateView({ state, handlers });

    if (!oldVNode) {
      root.innerHTML = "";
      root.appendChild(createDom(newVNode));
    } else {
      updateElement(root, newVNode, oldVNode);
    }
    oldVNode = newVNode;
    setupHeaderEvents();
  }

  async function init() {
    unsubscribe = subscribe(render); // 상태 변경 시 자동 리렌더
    await loadUserProfile(); // 프로필 불러오기
    render(); // 초기 렌더
  }

  init();

  return () => {
    if (unsubscribe) unsubscribe();
    dropdownHeaderEvents();
  };
}
