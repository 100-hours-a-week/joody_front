import { h, createDom, updateElement } from "../vdom/Vdom.js";
import { initState, getState, setState, subscribe } from "../vdom/Store.js";
import SignupHeader from "../components/signup/SignupHeader.js";
import Signup2Form from "../components/signup/Signup2Form.js";

import {
  preventSpace,
  handleNicknameInput,
  handleNicknameBlur,
  handleSubmit,
  attachAvatarEvents,
} from "../handlers/signupHandlers.js";

const nicknameRegex = /^[^\s]{1,8}$/;

// // 초기 상태
setState({
  nickname: "",
  avatar: null,
  avatarPreview: "",
  helperAvatar: "",
  helperNickname: "",
  isLoading: false,
});

// View
function View() {
  const s = getState();
  const nicknameValid = nicknameRegex.test(s.nickname);
  const active = nicknameValid;

  return h(
    "div",
    {},
    SignupHeader({ backPath: "#/signup" }),

    h(
      "main",
      { id: "signup_container" },
      h(
        "h2",
        { id: "signup2_title" },
        "프로필 사진과",
        h("br"),
        "닉네임을 설정해주세요"
      ),

      Signup2Form({
        s,
        active,
        handlers: {
          preventSpace,
          handleNicknameInput,
          handleNicknameBlur,
          handleSubmit,
        },
      })
    )
  );
}

// ===================== PAGE EXPORT =====================
export default function SignupStep2Page(root) {
  let oldVNode = null;
  let isEventAttached = false;

  function renderApp() {
    const newVNode = View();
    if (!oldVNode) {
      root.innerHTML = "";
      root.appendChild(createDom(newVNode));
    } else {
      updateElement(root, newVNode, oldVNode);
    }
    oldVNode = newVNode;

    if (!isEventAttached) {
      attachAvatarEvents();
      isEventAttached = true;
    }
  }

  const unsubscribe = subscribe(renderApp);
  renderApp();
  return () => unsubscribe();
}
