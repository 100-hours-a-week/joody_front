import { createDom, updateElement } from "../vdom/Vdom.js";
import { initState, getState, setState, subscribe } from "../vdom/Store.js";
import ProfileEditView from "../components/profileEdit/profileEditView.js";
import { setupHeaderEvents, dropdownHeaderEvents } from "../utils/common.js";
import { loadProfile, submitProfile, withdrawUser } from "../api/profileApi.js";
import {
  handleOutsideClick,
  handleFileSelect,
  handleNicknameInput,
} from "../handlers/profileEditHandlers.js";

export default function ProfileEditPage(root) {
  const storedUserId = localStorage.getItem("userId");
  const storedEmail = localStorage.getItem("email");
  const storedNickname = localStorage.getItem("nickname");
  const storedProfileImage = localStorage.getItem("profileImage");
  const fallbackProfileImage = "../assets/img/default_profile.png";

  initState({
    userId: storedUserId || "",
    email: storedEmail || "",
    profileImage: storedProfileImage || fallbackProfileImage,
    nickname: storedNickname || "",
    pendingFile: null,
    helper: "",
    dropdownOpen: false,
    modalOpen: false,
    toastMsg: "",
    showToast: false,
    editEnabled: false,
    uploading: false,
  });

  let oldVNode = null;

  function render() {
    const state = getState();
    const handlers = {
      submitProfile,
      withdrawUser,
      handleNicknameInput,
      handleFileSelect,
      openWithdrawModal: () => setState({ modalOpen: true }),
      closeWithdrawModal: () => setState({ modalOpen: false }),
    };

    const newVNode = ProfileEditView({ state, handlers });

    if (!oldVNode) {
      root.innerHTML = "";
      root.appendChild(createDom(newVNode));
    } else {
      updateElement(root, newVNode, oldVNode);
    }
    oldVNode = newVNode;
  }

  async function init() {
    subscribe(render);
    render();
    setupHeaderEvents();
    await loadProfile();
    window.addEventListener("click", handleOutsideClick);
  }

  init();

  return () => {
    window.removeEventListener("click", handleOutsideClick);
    dropdownHeaderEvents();
  };
}
