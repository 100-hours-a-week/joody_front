import { h } from "../../vdom/Vdom.js";
import { isComplete } from "../../validators/signupValidators.js";

export function NextButton(handleNext) {
  const active = isComplete();
  return h(
    "button",
    {
      id: "next_button",
      disabled: !active,
      onclick: handleNext,
      className: active ? "active" : "",
      onclick: handleNext,
    },
    "다음"
  );
}
