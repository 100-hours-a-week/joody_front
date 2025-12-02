import { updateElement, createDom } from "../vdom/Vdom.js";
import { initState, getState, setState, subscribe } from "../vdom/Store.js";
import { loadUserProfile } from "../api/userService.js";
import { loadPostData } from "../api/postApi.js";
import {
  throttle,
  setupHeaderEvents,
  teardownHeaderEvents,
} from "../utils/common.js";
import {
  handleImageChange,
  handlesubmitEdit,
} from "../handlers/postEditHandlers.js";
import PostEditView from "../components/postEdit/PostEditView.js";

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
    profileImage: "../assets/img/default_profile.png",
  });

  let oldNode = null;
  let unsubscribe = null;

  function update() {
    const state = getState();
    const handlers = {
      handleTitleInput: throttle((e) => {
        let v = e.target.value;
        if (v.length > 26) v = v.slice(0, 26);
        setState({ title: v });
      }, 150),

      handleContentInput: (e) => setState({ content: e.target.value }),
      handleImageChange,
      handlesubmitEdit,
    };
    const newNode = PostEditView({ state, handlers });
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
    await loadPostData(postId);
  }

  init();

  return () => {
    if (unsubscribe) unsubscribe();
    teardownHeaderEvents();
  };
}
