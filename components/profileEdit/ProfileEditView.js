import { h } from "../../vdom/Vdom.js";

import MainHeader from "../common/mainHeader.js";
import ProfileForm from "./profileForm.js";
import ProfileWithdrawModal from "./ProfileWithdrawModal.js";
import ProfileToast from "./ProfileToast.js";

export default function ProfileEditView({ state, handlers }) {
  return h(
    "div",
    { id: "profileEdit_root" },

    MainHeader(),

    h("h1", { id: "profileEdit_title" }, "회원정보수정"),

    h(
      "div",
      { id: "profileEdit_container" }, // ⭐ Form wrapper
      ProfileForm({ state, handlers })
    ),

    ProfileWithdrawModal({
      open: state.modalOpen,
      onCancel: handlers.closeWithdrawModal,
      onConfirm: handlers.withdrawUser,
    }),

    ProfileToast({
      show: state.showToast,
      message: state.toastMsg,
    })
  );
}
