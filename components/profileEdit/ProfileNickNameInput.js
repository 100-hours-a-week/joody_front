import { h } from "../../vdom/Vdom.js";

export default function ProfileNicknameInput({ value, helper, oninput }) {
  return h(
    "div",
    { className: "input_group" }, // ⭐ 감싸주는 wrapper 추가

    h("p", { className: "nickname_label" }, "닉네임*"),

    h("input", {
      id: "nickname",
      value,
      placeholder: "닉네임을 입력하세요.",
      autocomplete: "off",
      oninput,
    }),

    h("p", { className: "nickname_helper" }, helper)
  );
}
