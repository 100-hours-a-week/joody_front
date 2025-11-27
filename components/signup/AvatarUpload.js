import { h } from "../../vdom/Vdom.js";

export default function AvatarUpload({ preview, helper }) {
  return h(
    "div",
    {},
    h(
      "div",
      { id: "avatar-container" },
      h("img", {
        id: "avatar_preview",
        src: preview || "",
        alt: "프로필 미리보기",
      }),
      h("input", {
        key: "avatar_input",
        type: "file",
        id: "avatar_input",
        accept: "image/*",
        style: { display: "none" },
      })
    ),
    h("p", { className: "profile_image_helper" }, helper)
  );
}
