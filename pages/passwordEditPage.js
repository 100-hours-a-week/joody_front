import { subscribe, initState } from "../vdom/Store.js";
import { createDom, updateElement } from "../vdom/Vdom.js";
import { setupHeaderEvents } from "../utils/common.js";
import { loadUserProfile } from "../api/userService.js";
import { PasswordEditView } from "../components/passwordEdit/passwordEditView.js";

export default function PasswordEditPage(app) {
  initState({
    password: "",
    passwordCheck: "",
    helperPassword: "",
    helperPasswordCheck: "",
    buttonActive: false,
    toastMsg: "",
    showToast: false,
  });

  // app 내부에 container 생성
  const root = document.createElement("div");
  root.id = "passwordEdit_root";
  app.appendChild(root);

  let prev = null;

  function render() {
    const next = PasswordEditView();

    if (!prev) {
      root.appendChild(createDom(next));
    } else {
      updateElement(root, next, prev);
    }
    prev = next;
    setupHeaderEvents();
  }

  subscribe(render);

  async function init() {
    await loadUserProfile(); // 프로필 이미지 상태 선반영
    render();
  }

  init();
}
