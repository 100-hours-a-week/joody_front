import LoginPage from "../pages/LoginPage.js";

const routes = {
  login: LoginPage,
};

export function router() {
  const app = document.getElementById("app");
  let path = location.hash.replace("#/", "");

  if (!path) {
    location.hash = "#/login";
    return;
  }

  const Page = routes[path];
  if (Page) Page(app);
}
