const profileImg = document.getElementById("profile_img");
const dropdownMenu = document.getElementById("dropdown_menu");

// 프로필 이미지 드롭다운
profileImg.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});
// 바깥 클릭 시 드롭다운 닫기
window.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-menu")) {
    dropdownMenu.classList.add("hidden");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const passwordInput = document.getElementById("password");
  const passwordHelper = document.querySelector(".password_helper");
  const passwordCheckInput = document.getElementById("passwordCheck");
  const passwordCheckHelper = document.querySelector(".passwordCheck_helper");
  const editButton = document.getElementById("edited_button");
  const toast = document.getElementById("toast"); // 토스트 요소 추가 필요

  // 비밀번호 정규식 (대문자, 소문자, 숫자, 특수문자 최소 1개씩 포함, 8~20자)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

  // 헬퍼 문구 출력 함수
  const showHelper = (target, message, color = "red") => {
    target.textContent = message;
    target.style.color = color;
  };

  //비밀번호 개별 검사 함수
  const checkPassword = () => {
    const password = passwordInput.value.trim();

    if (password === "") {
      showHelper(passwordHelper, "* 비밀번호를 입력해주세요.");
      return false;
    } else if (!passwordRegex.test(password)) {
      showHelper(
        passwordHelper,
        "* 비밀번호는 8자 이상 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다."
      );
      return false;
    } else {
      showHelper(passwordHelper, "");
      return true;
    }
  };

  // 비밀번호 확인 개별 검사 함수
  const checkPasswordCheck = () => {
    const password = passwordInput.value.trim();
    const passwordCheck = passwordCheckInput.value.trim();

    if (passwordCheck === "") {
      showHelper(passwordCheckHelper, "* 비밀번호를 한번 더 입력해주세요.");
      return false;
    } else if (password !== passwordCheck) {
      showHelper(passwordCheckHelper, "* 비밀번호와 다릅니다.");
      return false;
    } else {
      showHelper(passwordCheckHelper, "");
      return true;
    }
  };

  // 통합 유효성 검사 (버튼 클릭 및 색상 업데이트 시 사용)
  const validatePassword = () => {
    const isPasswordValid = checkPassword();
    const isCheckValid = checkPasswordCheck();
    updateButtonState(isPasswordValid && isCheckValid);
    return isPasswordValid && isCheckValid;
  };

  // 버튼 색상 업데이트
  const updateButtonState = (isValid) => {
    if (isValid) {
      editButton.style.backgroundColor = "#7f6aee";
      editButton.style.cursor = "pointer";
    } else {
      editButton.style.backgroundColor = "#aca0eb";
      editButton.style.cursor = "default";
    }
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

  //포커스 아웃 시 검사 및 버튼 상태 반영
  passwordInput.addEventListener("blur", validatePassword);
  passwordCheckInput.addEventListener("blur", validatePassword);

  // 입력 시 실시간 검사
  [passwordInput, passwordCheckInput].forEach((input) =>
    input.addEventListener("input", validatePassword)
  );

  // 버튼 클릭 시 전체 검사 + 토스트
  editButton.addEventListener("click", (e) => {
    e.preventDefault();

    const isValid = validatePassword();

    if (isValid) {
      showToast("수정 완료");
    }
  });
});
