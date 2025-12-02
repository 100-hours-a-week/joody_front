import { h } from "../../vdom/Vdom.js";
import { getState } from "../../vdom/Store.js";
import MainHeader from "../common/mainHeader.js";
import PasswordForm from "./passwordForm.js";
import PasswordToast from "./PasswordToast.js";

export function PasswordEditView(handlers) {
  const state = getState();

  return h(
    "div",
    {},
    MainHeader(),

    h("h2", { id: "passwordEdit_title" }, "비밀번호 수정"),

    h(
      "div",
      { id: "passwordEdit_container" },
      PasswordForm({ state, handlers }),
      PasswordToast({ message: state.toastMsg, show: state.showToast })
    )
  );
}
