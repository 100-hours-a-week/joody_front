function h(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: children.flat(),
  };
}

import MainHeader from "../common/mainHeader.js";

export default function PostListLayout() {
  return h(
    "div",
    { id: "post_page" },
    MainHeader(),
    h(
      "main",
      { id: "post_container" },

      h(
        "button",
        { id: "write_post_button" },
        h("img", {
          src: "../assets/img/writing_btn.png",
          className: "btn-icon",
        })
      ),

      h(
        "div",
        { id: "search_box" },
        h("input", {
          id: "search_input",
          type: "text",
          placeholder: "검색어를 입력하세요.",
          autocomplete: "off",
          autocorrect: "off",
          autocapitalize: "off",
        }),
        h("img", {
          id: "search_icon",
          src: "../assets/img/search_btn.svg",
        })
      ),

      h("div", { id: "post_list" })
    )
  );
}
