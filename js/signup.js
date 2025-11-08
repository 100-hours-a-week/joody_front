document.addEventListener("DOMContentLoaded", function () {
  const preview = document.getElementById("avatar_preview");
  const container = document.querySelector(".avatar-container");
  const signupButton = document.getElementById("signup_button");
  const avatarInput = document.getElementById("avatar_input");
  const avatarHelper = document.querySelector(".profile_image_helper");
  const emailInput = document.getElementById("username");
  const emailHelper = document.querySelector(".email_helper");
  const passwordInput = document.getElementById("password");
  const passwordHelper = document.querySelector(".password_helper");
  const passwordCheckInput = document.getElementById("password_check");
  const passwordCheckHelper = document.querySelector(".passwordCheck_helper");
  const nicknameInput = document.getElementById("nickname");
  const nicknameHelper = document.querySelector(".nickname_helper");
  const loginLink = document.getElementById("login_link");

  let fileDialogOpened = false; // 파일 선택창 열림 여부 추적

  if (!avatarInput || !preview || !container) return;

  // 컨테이너(또는 +) 클릭 시 파일 선택창 열기
  container.addEventListener("click", function (e) {
    if (!container.classList.contains("has-avatar")) {
      avatarInput.click();
    }
  });

  // 파일 선택창이 열릴 때 (즉, 업로드 시도 시작 시점)
  avatarInput.addEventListener("click", () => {
    fileDialogOpened = true;
    // 혹시 기존 헬퍼 문구가 남아 있다면 초기화
    showHelper(avatarHelper, "");
  });

  // 사용자가 파일 선택창을 닫을 때 (업로드 안 하고 취소한 경우)
  window.addEventListener("focus", () => {
    // 파일 선택창이 막 닫힌 직후인데, 파일이 선택되지 않은 상태라면!
    if (fileDialogOpened && avatarInput.files.length === 0) {
      showHelper(avatarHelper, "* 프로필 사진을 추가하세요.");
    }
    fileDialogOpened = false; // 상태 초기화
  });

  // 파일 선택 시 미리보기 및 클래스 토글
  avatarInput.addEventListener("change", () => {
    const file = avatarInput.files && avatarInput.files[0];
    if (!file) {
      container.classList.remove("has-avatar");
      showHelper(avatarHelper, "* 프로필 사진을 추가하세요.");
      updateButtonState();
      return;
    }
    if (!file.type.startsWith("image/")) {
      showHelper(avatarHelper, "* 이미지 파일만 업로드 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (ev) {
      preview.src = ev.target.result;
      container.classList.add("has-avatar");
      showHelper(avatarHelper, ""); // 성송 시 헬퍼 문구 제거
      updateButtonState();
    };
    reader.readAsDataURL(file);
  });

  // 정규식 정의
  const emailRegex =
    /^[A-Za-z0-9][A-Za-z0-9._%+-]*@[A-Za-z0-9-]+\.[A-Za-z]{2,}$/;
  // "@"과 "." 포함
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;
  const nicknameRegex = /^[^\s]{1,10}$/; // 띄어쓰기 불가, 10자 이내

  // 헬퍼텍스트 출력 함수
  const showHelper = (target, message, color = "red") => {
    target.textContent = message;
    target.style.color = color;
  };

  // 버튼 활성화 함수
  const updateButtonState = () => {
    const emailValid = emailRegex.test(emailInput.value.trim());
    const passwordValid = passwordRegex.test(passwordInput.value.trim());
    const passwordMatch =
      passwordInput.value.trim() === passwordCheckInput.value.trim() &&
      passwordInput.value.trim() !== "";
    const nicknameValid = nicknameRegex.test(nicknameInput.value.trim());
    const avatarUploaded = avatarInput.files.length > 0;

    if (
      emailValid &&
      passwordValid &&
      passwordMatch &&
      nicknameValid &&
      avatarUploaded
    ) {
      signupButton.style.backgroundColor = "#7f6aee";
      signupButton.style.cursor = "pointer";
    } else {
      signupButton.style.backgroundColor = "#aca0eb";
      signupButton.style.cursor = "default";
    }
  };

  // 이메일 검사
  emailInput.addEventListener("blur", () => {
    const email = emailInput.value.trim();
    if (email === "") {
      showHelper(emailHelper, "* 이메일을 입력해주세요.");
    } else if (!emailRegex.test(email)) {
      showHelper(
        emailHelper,
        "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@example.com)"
      );
    } else if (email === "test@example.com") {
      // 중복 예시 (나중에 서버 연결 시 수정)
      showHelper(emailHelper, "* 중복된 이메일입니다.");
    } else {
      showHelper(emailHelper, "");
    }
    updateButtonState();
  });

  /* 비밀번호 이벤트 처리 */
  // 비밀번호 띄어쓰기 차단
  // passwordInput.addEventListener("keydown", (e) => {
  //   if (e.key === " ") {
  //     e.preventDefault(); // 입력 자체 차단
  //     showHelper(passwordHelper, "* 비밀번호는 띄어쓰기를 할 수 없습니다.");
  //   }
  // });

  // 비밀번호 검사
  passwordInput.addEventListener("blur", () => {
    const password = passwordInput.value.trim();
    if (password === "") {
      showHelper(passwordHelper, "* 비밀번호를 입력해주세요.");
    }
    // // 공백 포함 여부 검사 추가 -> 일단 요구사항에 없기 때문에 차후에 반영
    // else if (/\s/.test(password)) {
    //   showHelper(passwordHelper, "* 비밀번호에는 공백을 포함할 수 없습니다.");
    // }

    // 비밀번호 유효성 검사 && 공백 포함 여부 검사 추가
    else if (!passwordRegex.test(password) || /\s/.test(password)) {
      showHelper(
        passwordHelper,
        "* 비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다."
      );
    } else {
      showHelper(passwordHelper, "");
    }
    updateButtonState();
  });

  // 비밀번호 확인 검사
  passwordCheckInput.addEventListener("blur", () => {
    const password = passwordInput.value.trim();
    const passwordCheck = passwordCheckInput.value.trim();

    if (passwordCheck === "") {
      showHelper(passwordCheckHelper, "* 비밀번호를 한번 더 입력해주세요.");
    } else if (password !== passwordCheck) {
      showHelper(passwordCheckHelper, "* 비밀번호가 다릅니다.");
    } else {
      showHelper(passwordCheckHelper, "");
    }
    updateButtonState();
  });

  // 닉네임 검사
  nicknameInput.addEventListener("blur", () => {
    const nickname = nicknameInput.value.trim();

    if (nickname === "") {
      showHelper(nicknameHelper, "* 닉네임을 입력해주세요.");
    } else if (/\s/.test(nicknameInput.value)) {
      // nicknameInput.value = nicknameInput.value.replace(/\s/g, "");
      showHelper(nicknameHelper, "* 띄어쓰기를 없애주세요.");
    } else if (nickname.length > 10) {
      showHelper(nicknameHelper, "* 닉네임은 최대 10자까지 작성 가능합니다.");
    } else if (nickname === "admin" || nickname === "user1") {
      // 중복 예시
      showHelper(nicknameHelper, "* 중복된 닉네임입니다.");
    } else {
      showHelper(nicknameHelper, "");
    }
    updateButtonState();
  });

  // 입력 실시간 감시 → 버튼 활성화 상태 갱신
  [emailInput, passwordInput, passwordCheckInput, nicknameInput].forEach((el) =>
    el.addEventListener("input", updateButtonState)
  );

  // ===== 회원가입 요청 =====
  signupButton.addEventListener("click", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const password_check = passwordCheckInput.value.trim();
    const nickname = nicknameInput.value.trim();
    const avatarFile = avatarInput.files[0];

    const emailValid = emailRegex.test(email);
    const passwordValid = passwordRegex.test(password);
    const passwordMatch = password === password_check && password !== "";
    const nicknameValid = nicknameRegex.test(nickname);
    const avatarUploaded = !!avatarFile;

    if (
      !emailValid ||
      !passwordValid ||
      !passwordMatch ||
      !nicknameValid ||
      !avatarUploaded
    ) {
      alert("입력값을 다시 확인해주세요.");
      return;
    }

    try {
      // === multipart/form-data 구성 ===
      const userData = { email, password, password_check, nickname };
      const formData = new FormData();
      formData.append(
        "user",
        new Blob([JSON.stringify(userData)], { type: "application/json" })
      );
      formData.append("profile_image", avatarFile);

      const response = await fetch("http://localhost:8080/users/signup", {
        method: "POST",
        body: formData, // ⚡ Content-Type 자동 설정
      });

      const data = await response.json();

      if (response.ok) {
        alert("회원가입이 완료되었습니다!");
        window.location.href = "/login.html";
      } else {
        alert(data.message || "회원가입 실패");
      }
    } catch (err) {
      console.error("회원가입 요청 오류:", err);
      alert("서버 연결에 실패했습니다. 다시 시도해주세요.");
    }
  });

  // ===== 로그인 이동 =====
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/login.html";
  });
});
