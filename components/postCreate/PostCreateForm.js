import { h } from "../../vdom/Vdom.js";
import PostCreateTitleInput from "./PostCreateTitleInput.js";
import PostCreateContentInput from "./PostCreateContentInput.js";
import PostCreateImageInput from "./PostCreateImageInput.js";
import PostCreateButton from "./PostCreateButton.js";
import HelperText from "../common/HelperText.js";

export default function PostCreateForm({ state, handlers }) {
  return h(
    "form",
    { id: "edit_form" },

    PostCreateTitleInput({
      value: state.title,
      oninput: handlers.handleTitleInput,
    }),

    PostCreateContentInput({
      value: state.content,
      oninput: handlers.handleContentInput,
    }),

    PostCreateImageInput({
      onSelect: handlers.handleImageSelect,
    }),

    PostCreateButton({
      active: state.submitActive,
      onSubmit: handlers.handleSubmit,
    })
  );
}
