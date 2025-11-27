import { h, createDom, updateElement } from "../vdom/Vdom.js";
import { initState, getState, setState, subscribe } from "../vdom/Store.js";
import SignupHeader from "../components/signup/SignupHeader.js";
import EmailInput from "../components/signup/EmailInput.js";
import { PasswordInput } from "../components/signup/PasswordInput.js";
import { PasswordCheckInput } from "../components/signup/PasswordInputCheck.js";
import { handleNext } from "../handlers/signupHandlers.js";

initState({
  email: "",
  password: "",
  passwordCheck: "",
  helperEmail: "",
  helperPassword: "",
  helperPasswordCheck: "",
});

// ============= 정규식 & validator =============
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const pwRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

// 완료 여부 판단
const isComplete = () => {
  const s = getState();
  const emailValid = emailRegex.test(s.email);
  const passwordValid = pwRegex.test(s.password) && !/\s/.test(s.password);
  const match = s.password && s.password === s.passwordCheck;
  return emailValid && passwordValid && match;
};

function View() {
  const s = getState();
  const active = isComplete();

  return h(
    "div",
    { className: "signup_vdom_wrapper" },

    // HEADER
    SignupHeader({ backPath: "#/login" }),

    // MAIN
    h(
      "main",
      { id: "signup_container" },

      h(
        "h2",
        { id: "signup_title" },
        "이메일과 비밀번호를",
        h("br"),
        "입력해주세요"
      ),

      h(
        "form",
        { id: "signup_form", style: {} },

        // EMAIL

        EmailInput(emailRegex),
        // PASSWORD
        PasswordInput(pwRegex),

        // PASSWORD CHECK
        PasswordCheckInput(pwRegex),
        // NEXT BUTTON
        h(
          "button",
          {
            id: "next_button",
            disabled: !active,
            onclick: handleNext,
            className: active ? "active" : "",
          },
          "다음"
        )
      )
    )
  );
}

export default function SignupPage(root) {
  let oldVNode = null;

  setState({
    email: "",
    password: "",
    passwordCheck: "",
    helperEmail: "",
    helperPassword: "",
    helperPasswordCheck: "",
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

  // 상태 변경 시 VDOM 렌더
  const unsubscribe = subscribe(renderApp);

  // 초기 렌더
  renderApp();

  // cleanup 반환(라우터가 실행)
  return () => unsubscribe();
}
