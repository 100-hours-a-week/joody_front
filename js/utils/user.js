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
    const accessToken = localStorage.getItem("access_token");

    if (!userId || !accessToken) {
      console.warn("로그인 정보가 없습니다.");
      window.location.href = "/login.html";
      return;
    }

    const res = await fetch(`http://localhost:8080/users/${userId}/profile`, {
      method: "GET",
      credentials: "include", // ⭐ refresh token 자동 포함
      headers: {
        Authorization: `Bearer ${accessToken}`, // ⭐ access token 직접 포함
      },
    });

    // Access Token 만료 → 백엔드에서 401 제공
    if (res.status === 401) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login.html";
      return;
    }

    const json = await res.json();

    if (json.message === "read_success") {
      const imgUrl = json.data.profileImage;

      profileImg.src = imgUrl
        ? imgUrl.startsWith("http")
          ? imgUrl
          : `http://localhost:8080${imgUrl}`
        : "./img/original_profile.png";
    }
  } catch (err) {
    console.error("프로필 불러오기 실패:", err);
  }
}
