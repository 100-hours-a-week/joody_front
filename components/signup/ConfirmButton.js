import { h } from "../../vdom/Vdom.js";

export default function ConfirmButton({ active, loading, onclick }) {
  return h(
    "button",
    {
      id: "confirm_button",
      type: "submit",
      disabled: !active,
      onclick,
      className: active ? "active" : "",
      style: { cursor: active ? "pointer" : "default" },
    },
    loading ? "등록 중..." : "확인"
  );
}
