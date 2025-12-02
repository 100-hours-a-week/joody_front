import { h } from "../../vdom/Vdom.js";
import { setState } from "../../vdom/Store.js";

export default function ProfileWithdrawButton({ onClick }) {
  return h(
    "a",
    {
      href: "#",
      id: "profileDelete_link",
      onclick: (e) => {
        e.preventDefault();
        setState({ modalOpen: true });
      },
    },
    "회원탈퇴"
  );
}
