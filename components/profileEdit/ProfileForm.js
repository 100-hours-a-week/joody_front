import { h } from "../../vdom/Vdom.js";
import ProfileAvatar from "./profileAvatar.js";
import ProfileNicknameInput from "./profileNickNameInput.js";
import ProfileSubmitButton from "./ProfileSubmitButton.js";
import ProfileWithdrawButton from "./ProfileWithdrawButton.js";
import {
  handleFileSelect,
  handleNicknameInput,
} from "../../handlers/profileEditHandlers.js";
import { submitProfile } from "../../api/profileApi.js";

export default function ProfileForm({ state, handlers }) {
  const canSubmit = state.editEnabled || !!state.pendingFile;

  return h(
    "form",
    { id: "profileEdit_form", enctype: "multipart/form-data" },

    h("p", { className: "profile_image" }, "프로필 사진*"),

    ProfileAvatar({
      profileImage: state.profileImage,
      uploading: state.uploading,
      onSelect: handleFileSelect,
    }),

    h("p", { className: "email_label" }, "이메일"),
    h("p", { id: "email_display" }, state.email),

    ProfileNicknameInput({
      value: state.nickname,
      helper: state.helper,
      oninput: handleNicknameInput,
    }),

    ProfileSubmitButton({
      canSubmit,
      onSubmit: submitProfile,
    }),

    ProfileWithdrawButton({
      onClick: handlers.openWithdrawModal,
    })
  );
}
