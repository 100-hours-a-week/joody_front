document.addEventListener("DOMContentLoaded", () => {
  const avatarInput = document.getElementById("avatar_input");
  const avatarPreview = document.getElementById("avatar_preview");
  const avatarContainer = document.getElementById("avatar-container");
  const avatarHelper = document.querySelector(".profile_image_helper");
  const nicknameInput = document.getElementById("nickname");
  const nicknameHelper = document.querySelector(".nickname_helper");
  const confirmButton = document.getElementById("confirm_button");

  const nicknameRegex = /^[^\s]{1,8}$/;

  const showHelper = (target, message, color = "red") => {
    target.textContent = message;
    target.style.color = color;
  };

  const checkInputs = () => {
    const nickname = nicknameInput.value.trim();
    const avatarUploaded = avatarInput.files.length > 0;
    const nicknameValid = nicknameRegex.test(nickname);
    const step2Complete = avatarUploaded && nicknameValid;

    // ✅ 프로필 사진 미선택 시 헬퍼 문구 표시
    if (!avatarUploaded) {
      showHelper(avatarHelper, "* 프로필 사진을 추가하세요.");
    } else {
      showHelper(avatarHelper, ""); // 선택하면 문구 제거
    }

    confirmButton.disabled = !step2Complete;
    confirmButton.classList.toggle("active", step2Complete);
  };

  nicknameInput.addEventListener("input", checkInputs);

  // ===== 프로필 이미지 업로드 =====

  avatarContainer.addEventListener("click", () => avatarInput.click());

  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    // 파일 선택 취소한 경우 (기존 이미지 초기화)
    if (!file) {
      avatarPreview.src = "";
      avatarContainer.classList.remove("has-avatar");
      showHelper(avatarHelper, "* 프로필 사진을 추가하세요.");
      checkInputs();
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      avatarInput.value = ""; // 입력값 초기화
      avatarPreview.src = ""; // 기본 이미지로 복원
      avatarContainer.classList.remove("has-avatar");
      showHelper(avatarHelper, "* 이미지 파일만 업로드 가능합니다.");
      checkInputs();
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      avatarPreview.src = event.target.result;
      avatarContainer.classList.add("has-avatar");
      showHelper(avatarHelper, ""); // ✅ 선택 시 문구 제거
      checkInputs();
    };
    reader.readAsDataURL(file);
  });

  // ===== 확인 버튼 클릭 시 회원가입 요청 =====
  confirmButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const nickname = nicknameInput.value.trim();
    const avatarFile = avatarInput.files[0];

    const email = localStorage.getItem("signup_email");
    const password = localStorage.getItem("signup_password");
    const password_check = localStorage.getItem("signup_password_check");

    if (!email || !password || !nickname || !avatarFile) {
      alert("입력값을 모두 확인해주세요.");
      return;
    }

    const userData = { email, password, password_check, nickname };
    const formData = new FormData();
    formData.append(
      "user",
      new Blob([JSON.stringify(userData)], { type: "application/json" })
    );
    formData.append("profile_image", avatarFile);

    try {
      const response = await fetch("http://localhost:8080/users/signup", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.clear();
        location.href = "/login.html";
      } else if (data.message === "duplicate_email") {
        alert("이미 존재하는 이메일입니다.");
      } else if (data.message === "duplicate_nickname") {
        showHelper(nicknameHelper, "* 중복된 닉네임입니다.");
      } else {
        alert(data.message || "회원가입 실패");
      }
    } catch (err) {
      console.error("회원가입 요청 오류:", err);
      alert("서버 연결에 실패했습니다. 다시 시도해주세요.");
    }
  });
});
