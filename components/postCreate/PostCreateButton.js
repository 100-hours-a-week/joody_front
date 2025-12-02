import { h } from "../../vdom/Vdom.js";

export default function PostCreateButton({ active, onSubmit }) {
  return h(
    "button",
    {
      id: "submit_button",
      type: "submit",
      disabled: !active,
      onclick: onSubmit,
      style: {
        backgroundColor: active ? "#4baa7d" : "#d9d9d9",
        cursor: active ? "pointer" : "default",
      },
    },
    "작성하기"
  );
}
