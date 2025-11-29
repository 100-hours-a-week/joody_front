import { h } from "../../vdom/Vdom.js";
import { getState } from "../../vdom/Store.js";

export default function MainHeader() {
  const s = getState();

  return h(
    "header",
    { id: "mainHeader" },
    h(
      "p",
      {
        id: "header_title",
        onclick: () => {
          window.location.hash = "#/postlist"; // ⭐ 로고 클릭 시 PostList 이동
        },
      },
      h("img", {
        id: "header_logo",
        src: "../assets/img/logo.png",
        alt: "아무 말 대잔치 로고",
      })
    ),
    h(
      "div",
      { className: "profile-menu" },
      h("img", {
        id: "profile_img",
        src: s.profileImage || "../assets/img/default_profile.png", // ← 상태 기반 렌더링
        alt: "프로필 이미지",
      }),
      h(
        "ul",
        { id: "dropdown_menu", className: "hidden" },
        h("li", {}, h("button", { id: "profileEdit" }, "회원정보수정")),
        h("li", {}, h("button", { id: "passwordEdit" }, "비밀번호수정")),
        h("li", {}, h("button", { id: "logout_btn" }, "로그아웃"))
      )
    )
  );
}
