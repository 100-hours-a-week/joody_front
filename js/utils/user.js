import { apiRequest } from "./api.js";
const profileImg = document.getElementById("profile_img");
const dropdownMenu = document.getElementById("dropdown_menu");

profileImg.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

window.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-menu")) {
    dropdownMenu.classList.add("hidden");
  }
});

export async function loadUserProfile() {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.warn("로그인 정보가 없습니다.");
      window.location.href = "/login.html";
      return;
    }

    // fetch 대신 apiRequest 사용!
    const { ok, data } = await apiRequest(`/users/${userId}/profile`, {
      method: "GET",
    });

    if (!ok) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login.html";
      return;
    }

    const imgUrl = data.data.profileImage;

    profileImg.src = imgUrl
      ? imgUrl.startsWith("http")
        ? imgUrl
        : `http://localhost:8080${imgUrl}`
      : "./img/original_profile.png";
  } catch (err) {
    console.error("프로필 불러오기 실패:", err);
  }
}
