import { setState } from "../vdom/Store.js";

export const preventSpaceAndHint = (field) => (e) => {
  if (e.key === " ") {
    e.preventDefault();
    if (field === "email") {
      setState({ helperEmail: "* 공백은 입력할 수 없습니다." });
    } else if (field === "password") {
      setState({ helperPassword: "* 공백은 사용할 수 없습니다." });
    } else {
      setState({ helperPasswordCheck: "* 공백은 입력할 수 없습니다." });
    }
  }
};

export function formatDate(dateTime) {
  const date = new Date(dateTime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000).toFixed(0) + "k";
  if (num >= 1000) return Math.floor(num / 1000) + "k";
  return num;
};

export const truncate = (text, max) =>
  text.length > max ? text.slice(0, max) + "…" : text;

let headerCleanup = null;

export function setupHeaderEvents() {
  // 이전 바인딩 제거 (페이지 이동 후 복귀 대비)
  if (typeof headerCleanup === "function") {
    headerCleanup();
    headerCleanup = null;
  }

  const profileImg = document.getElementById("profile_img");
  const dropdown = document.getElementById("dropdown_menu");
  const logoutBtn = document.getElementById("logout_btn");
  const profileEditBtn = document.getElementById("profileEdit");
  const passwordEditBtn = document.getElementById("passwordEdit");

  if (!profileImg || !dropdown) return;

  const onProfileClick = () => dropdown.classList.toggle("hidden");
  const onWindowClick = (e) => {
    if (!e.target.closest(".profile-menu")) dropdown.classList.add("hidden");
  };

  profileImg.addEventListener("click", onProfileClick);
  window.addEventListener("click", onWindowClick);

  const onLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userId");
    window.location.href = "#/login";
  };
  logoutBtn?.addEventListener("click", onLogout);

  const onProfileEdit = () => {
    window.location.hash = "#/profileEdit";
  };
  profileEditBtn?.addEventListener("click", onProfileEdit);

  const onPasswordEdit = () => {
    window.location.hash = "#/passwordEdit";
  };
  passwordEditBtn?.addEventListener("click", onPasswordEdit);

  // 이후 재호출 시 제거할 핸들러 저장
  headerCleanup = () => {
    profileImg.removeEventListener("click", onProfileClick);
    window.removeEventListener("click", onWindowClick);
    logoutBtn?.removeEventListener("click", onLogout);
    profileEditBtn?.removeEventListener("click", onProfileEdit);
    passwordEditBtn?.removeEventListener("click", onPasswordEdit);
  };
}

export function dropdownHeaderEvents() {
  if (typeof headerCleanup === "function") {
    headerCleanup();
    headerCleanup = null;
  }
}

export const throttle = (fn, delay) => {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last > delay) {
      last = now;
      fn(...args);
    }
  };
};

// debounce
export const debounce = (fn, delay) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
};

export function canEditPost(authorId) {
  return String(authorId) === String(localStorage.getItem("userId"));
}

export function canEditComment(authorId) {
  return String(authorId) === String(localStorage.getItem("userId"));
}

// 토스트 메시지
export function showToast(message) {
  setState({ toastMsg: message, showToast: true });
  setTimeout(() => setState({ showToast: false }), 2500);
}

// helperText

export function setHelper(target, msg) {
  target === "password"
    ? setState({ helperPassword: msg })
    : setState({ helperPasswordCheck: msg });
}
