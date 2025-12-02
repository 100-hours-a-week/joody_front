import { h } from "../../vdom/Vdom.js";

export default function PostEditButton() {
  return h("button", { id: "submit_button", type: "submit" }, "수정하기");
}
