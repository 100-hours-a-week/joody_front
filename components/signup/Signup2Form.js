import { h } from "../../vdom/Vdom.js";
import AvatarUpload from "./AvatarUpload.js";
import NameInput from "./NameInput.js";
import ConfirmButton from "./ConfirmButton.js";

export default function Signup2Form({ s, active, handlers }) {
  return h(
    "form",
    { id: "signup_form" },

    AvatarUpload({ preview: s.avatarPreview, helper: s.helperAvatar }),

    NameInput({
      value: s.nickname,
      helper: s.helperNickname,
      onkeydown: handlers.preventSpace,
      oninput: handlers.handleNicknameInput,
      onblur: handlers.handleNicknameBlur,
    }),

    ConfirmButton({
      active,
      loading: s.isLoading,
      onclick: handlers.handleSubmit,
    })
  );
}
