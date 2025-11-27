import LoginPage from "../pages/LoginPage.js";
import SignupPage from "../pages/SignupPage.js";
import Signup2Page from "../pages/Signup2Page.js";

const routes = {
  "/login": LoginPage,
  "/signup": SignupPage,
  "/signup/step2": Signup2Page,
};

export function router() {
  const app = document.getElementById("app");
  let path = location.hash.replace("#", "") || "/login";

  const Page = routes[path];
  if (!Page) {
    app.innerHTML = `<h1>404 Not Found</h1>`;
    return;
  }

  app.innerHTML = ""; // 기존 화면 제거
  Page(app); // 페이지 렌더
}
