import { h } from "../../vdom/Vdom.js";

export default function SignupHeader({ backPath }) {
  return h(
    "header",
    { id: "main_header" },
    h(
      "a",
      { id: "back_link", onclick: () => (location.hash = backPath) },
      h("img", {
        id: "back_button",
        src: "./assets/img/back_1.png",
        alt: "뒤로가기",
      })
    )
  );
}
