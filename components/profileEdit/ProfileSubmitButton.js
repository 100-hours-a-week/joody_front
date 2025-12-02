import { h } from "../../vdom/Vdom.js";
import { submitProfile } from "../../api/profileApi.js";

export default function ProfileSubmitButton({ canSubmit, onSubmit }) {
  const style = canSubmit
    ? { backgroundColor: "#4baa7d", color: "#fff", cursor: "pointer" }
    : { backgroundColor: "#dcdbe3", color: "#fff", cursor: "default" };

  return h(
    "button",
    {
      id: "edited_button",
      onclick: (e) => {
        e.preventDefault();
        submitProfile();
      },
      style,
      disabled: !canSubmit,
    },
    "수정하기"
  );
}
