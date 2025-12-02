import { h } from "../../vdom/Vdom.js";
import PostEditTitleInput from "./PostEditTitleInput.js";
import PostEditContentInput from "./PostEditContentInput.js";
import PostEditImageInput from "./PostEditImageInput.js";
import PostEditButton from "./PostEditButton.js";
import { handlesubmitEdit } from "../../handlers/postEditHandlers.js";

export default function PostEditForm({ state, handlers }) {
  return h(
    "form",
    {
      id: "edit_form",
      onsubmit: (e) => {
        e.preventDefault();
        handlesubmitEdit();
      },
    },

    PostEditTitleInput({
      value: state.title,
      oninput: handlers.handleTitleInput,
    }),

    PostEditContentInput({
      value: state.content,
      oninput: handlers.handleContentInput,
    }),

    PostEditImageInput({
      onChange: handlers.handleImageChange,
    }),

    PostEditButton()
  );
}
