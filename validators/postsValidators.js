import { getState, setState } from "../vdom/Store.js";

export function validateForm() {
  const s = getState();
  const valid = s.title.trim().length > 0 && s.content.trim().length > 0;

  setState({
    submitActive: valid,
    helper: valid ? "" : s.helper,
  });
}
