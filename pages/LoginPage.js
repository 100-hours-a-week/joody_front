// pages/LoginPage.js
import { h, createDom, updateElement } from "../vdom/Vdom.js";
import { getState, setState, subscribe, initState } from "../vdom/Store.js";

import Input from "../components/login/Input.js";
import Button from "../components/login/Button.js";
import HelperText from "../components/common/HelperText.js";

import {
  handleEmailInput,
  handlePasswordInput,
  handleLogin,
} from "../handlers/loginHandlers.js";

initState({
  email: "",
  password: "",
  helper: "",
  isLoading: false,
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,}$/;

function View() {
  const state = getState();
  const isActive =
    emailRegex.test(state.email) && passwordRegex.test(state.password);

  return h(
    "div",
    { className: "login_vdom_wrapper" },

    h(
      "div",
      { id: "logo_wrapper" },
      h("img", { src: "./assets/img/logo.png", id: "login_logo" })
    ),

    h(
      "div",
      { className: "login_wrapper" },

      h(
        "form",
        { id: "login_form" },
        h("p", { class: "email_label" }, "이메일"),
        Input({
          id: "username",
          type: "email",
          value: state.email,
          placeholder: "이메일을 입력해주세요.",
          oninput: handleEmailInput,
        }),

        h("p", { class: "password_label" }, "비밀번호"),
        Input({
          id: "password",
          type: "password",
          value: state.password,
          placeholder: "비밀번호를 입력해주세요.",
          oninput: handlePasswordInput,
        }),

        HelperText({ message: state.helper })
      ),

      Button({
        id: "login_button",
        disabled: !isActive,
        onclick: handleLogin,
        children: state.isLoading ? "로딩 중..." : "로그인",
        style: {
          backgroundColor: isActive ? "#4BAA7D" : "#dcdbe3",
          color: "#fff",
        },
      }),

      h(
        "a",
        { id: "signup_link", onclick: () => (location.hash = "#/signup") },
        "회원가입"
      )
    )
  );
}

export default function LoginPage(root) {
  let oldVNode = null;

  //페이지 진입 시 state 초기화
  setState({
    email: "",
    password: "",
    helper: "",
    isLoading: false,
  });

  function renderApp() {
    const newVNode = View();
    if (!oldVNode) {
      root.innerHTML = "";
      root.appendChild(createDom(newVNode));
    } else {
      updateElement(root, newVNode, oldVNode);
    }
    oldVNode = newVNode;
  }

  const unsubscribe = subscribe(renderApp);

  renderApp();

  return () => unsubscribe();
}
