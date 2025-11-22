document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const emailHelper = document.querySelector(".email_helper");
  const passwordInput = document.getElementById("password");
  const passwordHelper = document.querySelector(".password_helper");
  const passwordCheckInput = document.getElementById("password_check");
  const passwordCheckHelper = document.querySelector(".passwordCheck_helper");
  const nextButton = document.getElementById("next_button");

  // ===== 정규식 =====
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

  const showHelper = (target, message, color = "red") => {
    target.textContent = message;
    target.style.color = color;
  };

  // 입력 유효성 검사
  const checkInputs = () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const passwordCheck = passwordCheckInput.value.trim();

    const emailValid = emailRegex.test(email);
    const passwordValid = passwordRegex.test(password) && !/\s/.test(password);
    const match = password === passwordCheck;

    const step1Complete = emailValid && passwordValid && match;
    nextButton.disabled = !step1Complete;
    nextButton.classList.toggle("active", step1Complete);
  };

  // 이메일 검사
  emailInput.addEventListener("blur", () => {
    const email = emailInput.value.trim();
    if (email === "") {
      showHelper(emailHelper, "* 이메일을 입력해주세요.");
    } else if (!emailRegex.test(email)) {
      showHelper(
        emailHelper,
        "* 올바른 이메일 주소 형식을 입력해주세요. (예: test@test.com)"
      );
    } else {
      showHelper(emailHelper, "");
    }
    checkInputs();
  });

  // 입력 도중에도 즉시 유효성 검사 (추가 부분)
  emailInput.addEventListener("input", () => {
    const email = emailInput.value.trim();

    // 입력 도중에도 실시간 검사
    if (email === "") {
      showHelper(emailHelper, "* 이메일을 입력해주세요.");
    } else if (!emailRegex.test(email)) {
      showHelper(
        emailHelper,
        "* 올바른 이메일 주소 형식을 입력해주세요. (예: test@test.com)"
      );
    } else {
      // ✅ 올바른 형식이면 헬퍼 문구 즉시 제거
      showHelper(emailHelper, "");
    }

    checkInputs();
  });

  // 실시간 비밀번호 입력 공백 검사
  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;

    if (/\s/.test(password)) {
      showHelper(passwordHelper, "* 비밀번호에는 공백을 포함할 수 없습니다.");
    } else {
      showHelper(passwordHelper, "");
    }

    checkInputs();
  });

  // blur 시 상세 비밀번호 유효성 검사
  passwordInput.addEventListener("blur", () => {
    const password = passwordInput.value.trim();
    if (password === "") {
      showHelper(passwordHelper, "* 비밀번호를 입력해주세요.");
    }
    // 공백 포함 여부 검사 추가
    else if (/\s/.test(password)) {
      showHelper(passwordHelper, "* 비밀번호에는 공백을 포함할 수 없습니다.");
    }

    // 비밀번호 유효성 검사 && 공백 포함 여부 검사 추가
    else if (!passwordRegex.test(password) || /\s/.test(password)) {
      showHelper(
        passwordHelper,
        "* 비밀번호는 8자 이상, 20자 이하이며 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다."
      );
    } else {
      showHelper(passwordHelper, "");
    }
    checkInputs();
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
    checkInputs();
  });

  // ===== 비밀번호 확인도 실시간 검사 추가 (✅ focus 아웃 없이 버튼 활성화됨) =====
  passwordCheckInput.addEventListener("input", () => {
    const password = passwordInput.value.trim();
    const passwordCheck = passwordCheckInput.value.trim();

    if (passwordCheck === "") {
      showHelper(passwordCheckHelper, "* 비밀번호를 한번 더 입력해주세요.");
    } else if (password !== passwordCheck) {
      showHelper(passwordCheckHelper, "* 비밀번호가 다릅니다.");
    } else {
      showHelper(passwordCheckHelper, "");
    }
    checkInputs();
  });

  // ===== 다음 버튼 클릭 시 =====
  nextButton.addEventListener("click", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const password_check = passwordCheckInput.value.trim();

    localStorage.setItem("signup_email", email);
    localStorage.setItem("signup_password", password);
    localStorage.setItem("signup_password_check", password_check);

    location.href = "/signup_2.html";
  });
});
