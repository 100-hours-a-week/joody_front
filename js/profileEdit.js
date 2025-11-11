const profileImg = document.getElementById("profile_img");
const dropdownMenu = document.getElementById("dropdown_menu");

// 프로필 이미지 변경 버튼 기능
const changeButton = document.getElementById("change_button");
const avatarInput = document.getElementById("avatar_input");
const currentAvatar = document.getElementById("current_avatar");

profileImg.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

// 드롭다운 바깥 클릭 시 닫기
window.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-menu")) {
    dropdownMenu.classList.add("hidden");
  }
});

async function loadUserProfile() {
  try {
    const userId = localStorage.getItem("userId"); // 로그인 시 저장해둬야 함

    if (!userId) {
      console.warn("로그인된 사용자 ID가 없습니다.");
      return;
    }

    const res = await fetch(`http://localhost:8080/users/${userId}/profile`);
    const json = await res.json();

    if (json.message === "read_success") {
      const imgUrl = json.data.profileImage;

      const finalUrl = imgUrl
        ? imgUrl.startsWith("http")
          ? imgUrl
          : `http://localhost:8080${imgUrl}`
        : "./img/profile.png";

      // 헤더 프로필 이미지 변경
      profileImg.src = finalUrl;

      // 프로필 수정 페이지 미리보기 이미지 변경
      if (currentAvatar) {
        currentAvatar.src = finalUrl;
      }
    }
  } catch (err) {
    console.error("프로필 불러오기 실패:", err);
  }
}

// 프로필 이미지 변경 가능
// 변경 버튼 누르면 파일 선택창 열기
changeButton.addEventListener("click", (e) => {
  e.preventDefault(); // form 전송 방지
  avatarInput.click(); // 파일 업로드창 열기
});

// 파일 선택 시 이미지 미리보기 + 서버 업로드
avatarInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 미리보기
  const reader = new FileReader();
  reader.onload = (event) => {
    currentAvatar.src = event.target.result;
  };
  reader.readAsDataURL(file);

  // 서버 프로필 이미지 업로드 요청
  try {
    const userId = localStorage.getItem("userId");
    const formData = new FormData();
    formData.append("profile_image", file);

    const res = await fetch(
      `http://localhost:8080/users/${userId}/profile/image`,
      {
        method: "POST",
        body: formData,
      }
    );

    const json = await res.json();

    if (json.message === "profile_image_uploaded") {
      const uploadedUrl = json.data; // 서버에서 반환된 full URL

      // 헤더 프로필 이미지 즉시 변경
      profileImg.src = uploadedUrl;

      // 프로필 수정 페이지 이미지도 변경
      currentAvatar.src = uploadedUrl;

      console.log("업로드 성공:", uploadedUrl);
    } else {
      console.error("업로드 실패:", json);
    }
  } catch (err) {
    console.error("이미지 업로드 중 오류:", err);
  }
});

// 회원탈퇴 모달 제어
// DomContentLoaded한 이유 : “HTML이 전부 다 로드되고 나서, 그 안의 요소들을 안전하게 조작할 수 있을 때” 실행하기 위해
document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile(); // ✅ 동적 userId 사용

  const nicknameInput = document.getElementById("nickname");
  const nicknameHelper = document.querySelector(".nickname_helper");
  const editButton = document.getElementById("edited_button");
  const toast = document.getElementById("toast");
  // 여기 안에는 html 요소들이 다 로드된 상태에서 실행이 되는 부분!!
  // 취소 버튼이 눌린 후에, 이 모달창이 띄워져야 하기 때문에 DomContentLoaded 안에 작성
  const deleteLink = document.getElementById("prodileDelete_link");
  const modalOverlay = document.getElementById("modal_overlay");
  const cancelButton = document.getElementById("cancel_button");
  const confirmButton = document.getElementById("confirm_button");

  // 현재 로그인한 유저 ID (로그인 시 저장해둔 값 사용)
  const userId = localStorage.getItem("userId") || 1;

  // 헬퍼 텍스트 출력 함수
  const showHelper = (message, color = "red") => {
    nicknameHelper.textContent = message;
    nicknameHelper.style.color = color;
  };

  // 닉네임 유효성 검사 함수
  const validateNickname = () => {
    const nickname = nicknameInput.value.trim();

    if (nickname === "") {
      showHelper("* 닉네임을 입력해주세요.");
      return false;
    }

    if (nickname.length > 10) {
      showHelper("* 닉네임은 최대 10자까지 작성 가능합니다.");
      return false;
    }

    // 유효한 경우
    showHelper("");
    return true;
  };

  // 토스트 메시지 표시 함수
  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("show");
    toast.classList.remove("hidden");

    // 2.5초 후 사라짐
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.classList.add("hidden"), 300);
    }, 2500);
  };

  // 닉네임 수정 API 연동
  editButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const isValid = validateNickname();
    if (!isValid) return;

    const nickname = nicknameInput.value.trim();

    try {
      const response = await fetch(
        `http://localhost:8080/users/${userId}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nickname }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast("수정완료");
        nicknameHelper.textContent = "";
        // console.log(response);
      } else if (data.message === "duplicate_nickname") {
        showHelper("* 이미 사용 중인 닉네임입니다.");
      } else if (data.message === "user_not_found") {
        showHelper("* 존재하지 않는 사용자입니다.");
      } else {
        showHelper("* 닉네임 수정에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("닉네임 수정 요청 중 오류:", error);
      showHelper("* 서버 연결에 실패했습니다. 다시 시도해주세요.");
    }
  });

  // 회원탈퇴 클릭 → 모달 열기
  deleteLink.addEventListener("click", (e) => {
    e.preventDefault();
    modalOverlay.classList.remove("hidden");
  });

  // 취소 클릭 → 닫기
  cancelButton.addEventListener("click", (e) => {
    e.preventDefault();
    modalOverlay.classList.add("hidden");
  });

  // 확인 클릭 → 회원탈퇴 API 요청
  confirmButton.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.message === "withdraw_success") {
        localStorage.clear(); // 저장된 로그인 정보 제거
        window.location.href = "/signup.html"; // 회원가입 페이지로 이동
      } else {
        showToast("회원탈퇴에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("회원탈퇴 요청 중 오류:", error);
      alert("서버 연결에 실패했습니다.");
    } finally {
      modalOverlay.classList.add("hidden");
    }
  });
});
