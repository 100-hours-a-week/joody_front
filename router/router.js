import LoginPage from "../pages/LoginPage.js";
import SignupPage from "../pages/SignupPage.js";
import Signup2Page from "../pages/Signup2Page.js";
import PostListPage from "../pages/PostListPage.js";
import PasswordEditPage from "../pages/passwordEditPage.js";
import ProfileEditPage from "../pages/profileEditPage.js";
import PostCreatePage from "../pages/postCreatePage.js";
import PostEditPage from "../pages/PostEditPage.js";

let currentPageUnmount = null; // 🔥 현재 페이지 unmount 저장
let currentPath = null; // 🔥 동일 경로 연속 진입 방지

const routes = {
  "/login": {
    page: LoginPage,
    css: "./assets/css/login.css",
  },
  "/signup": {
    page: SignupPage,
    css: "/assets/css/signup_1.css",
  },
  "/signup/step2": {
    page: Signup2Page,
    css: "/assets/css/signup_2.css",
  },
  "/postlist": {
    page: PostListPage,
    css: "./assets/css/postlist.css",
  },
  "/passwordEdit": {
    page: PasswordEditPage,
    css: "./assets/css/passwordEdit.css",
  },
  "/profileEdit": {
    page: ProfileEditPage,
    css: "./assets/css/profileEdit.css",
  },
  "/postCreate": {
    page: PostCreatePage,
    css: "./assets/css/postCreate.css",
  },
  "/postEdit": {
    page: PostEditPage,
    css: "./assets/css/postEdit.css",
  },
};

function loadCSS(href) {
  // 이미 로드된 CSS 제거
  document
    .querySelectorAll("link[data-page-style]")
    .forEach((el) => el.remove());

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-page-style", "true");
  document.head.appendChild(link);
}

export function router() {
  const app = document.getElementById("app");

  let path = location.hash.replace(/^#/, "");
  if (!path.startsWith("/")) path = "/" + path;
  if (path === "/") path = "/login";

  const isLoggedIn = !!localStorage.getItem("access_token");

  if (
    !isLoggedIn &&
    path !== "/login" &&
    path !== "/signup" &&
    path !== "/signup/step2"
  ) {
    location.hash = "#/login";
    return;
  }

  if (
    isLoggedIn &&
    (path === "/login" || path === "/signup" || path === "/signup/step2")
  ) {
    location.hash = "#/postlist";
    return;
  }

  const route = routes[path];
  if (!route) {
    app.innerHTML = "<h1>404 Not Found</h1>";
    return;
  }

  // ================================
  // 🔥 이전 페이지 cleanup 먼저 실행
  // ================================
  if (typeof currentPageUnmount === "function") {
    currentPageUnmount();
    currentPageUnmount = null;
  }

  // ================================
  // 🔥 cleanup 후에 동일 경로 체크
  // ================================
  if (path === currentPath) {
    return;
  }
  currentPath = path;

  if (route.css) loadCSS(route.css);

  app.innerHTML = "";

  // ================================
  // 🔥 페이지 실행 및 unmount 저장
  // ================================
  const unmount = route.page(app);
  if (typeof unmount === "function") {
    currentPageUnmount = unmount;
  }
}
