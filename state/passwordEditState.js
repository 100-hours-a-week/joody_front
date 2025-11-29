import { initState } from "../vdom/Store.js";

export function initPasswordEditState() {
  initState({
    password: "",
    passwordCheck: "",
    helperPassword: "",
    helperPasswordCheck: "",
    buttonActive: false,
    toastMsg: "",
    showToast: false,
  });
}
