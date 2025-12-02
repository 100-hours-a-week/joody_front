import { h } from "../../vdom/Vdom.js";

export default function ProfileAvatar({ profileImage, uploading, onSelect }) {
  return h(
    "div",
    { className: "avatar-container has-avatar" },

    h("img", { id: "current_avatar", src: profileImage }),

    h(
      "button",
      {
        id: "change_button",
        onclick: (e) => {
          e.preventDefault();
          document.getElementById("avatar_input").click();
        },
      },
      uploading ? "업로드 중..." : "변경"
    ),

    h("input", {
      type: "file",
      id: "avatar_input",
      accept: "image/*",
      style: "display:none;",
      onchange: onSelect,
    })
  );
}
