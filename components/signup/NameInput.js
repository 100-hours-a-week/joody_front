import { h } from "../../vdom/Vdom.js";

export default function NicknameInput({
  value,
  helper,
  onkeydown,
  oninput,
  onblur,
}) {
  return h(
    "div",
    { className: "input_group" },

    h("label", { for: "nickname" }, "닉네임"),

    h(
      "div",
      { className: "input_wrapper" },
      h("input", {
        key: "nickname_input",
        type: "text",
        id: "nickname",
        placeholder: "닉네임을 입력해주세요.",
        value,
        onkeydown,
        oninput,
        onblur,
      })
    ),

    h(
      "p",
      { className: "nickname_helper", key: "nickname_helper" },
      helper || ""
    )
  );
}
