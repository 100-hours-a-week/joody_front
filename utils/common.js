import { setState } from "../vdom/Store.js";

export const preventSpaceAndHint = (field) => (e) => {
  if (e.key === " ") {
    e.preventDefault();
    if (field === "email") {
      setState({ helperEmail: "* 공백은 입력할 수 없습니다." });
    } else if (field === "password") {
      setState({ helperPassword: "* 공백은 사용할 수 없습니다." });
    } else {
      setState({ helperPasswordCheck: "* 공백은 입력할 수 없습니다." });
    }
  }
};
