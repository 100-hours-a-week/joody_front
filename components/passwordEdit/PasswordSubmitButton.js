import { h } from "../../vdom/Vdom.js";

export default function PasswordSubmitButton({ active }) {
  return h(
    "button",
    {
      id: "edited_button",
      disabled: !active,
      style: { backgroundColor: active ? "#4baa7d" : "#dcdbe3" },
    },
    "수정하기"
  );
}
