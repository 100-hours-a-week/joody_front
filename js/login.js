document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("login_button");
  const emailInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const helperText = document.getElementById("helper_text");
  const signupLink = document.getElementById("signup_link");

  // 정규식 정의
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+~\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  // 헬퍼텍스트 출력 함수
  const showHelper = (message, color = "red") => {
    helperText.textContent = message;
    helperText.style.color = color;
  };

  // 버튼 색상 업데이트 함수
  const updateButtonState = () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = passwordRegex.test(password);

    if (isEmailValid && isPasswordValid) {
      // 이메일,비밀번호 모두 유효한 경우
      loginButton.style.backgroundColor = "#7f6aee";
      loginButton.style.cursor = "pointer";
    } else {
      loginButton.style.backgroundColor = "#aca0eb";
      loginButton.style.cursor = "default";
    }
  };

  // 입력 실시간 검증
  emailInput.addEventListener("input", () => {
    const email = emailInput.value.trim();
    if (email.length === 0) {
      showHelper(
        "* 올바른 이메일 주소 형식을 입력해주세요.(예) example@example.com)"
      );
    } else if (!emailRegex.test(email)) {
      showHelper(
        "* 올바른 이메일 주소 형식을 입력해주세요.(예) example@example.com)"
      );
    } else {
      helperText.textContent = "";
    }
    updateButtonState();
  });

  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value.trim();
    if (password.length === 0) {
      showHelper("* 비밀번호를 입력해주세요.");
    } else if (!passwordRegex.test(password)) {
      showHelper(
        "* 비밀번호는 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다."
      );
    } else {
      helperText.textContent = "";
    }
    updateButtonState();
  });

  // ===== focusout 시에도 검사 (입력 안 한 채 넘어갈 때 처리) =====
  passwordInput.addEventListener("blur", () => {
    const password = passwordInput.value.trim();
    if (password.length === 0) {
      showHelper("* 비밀번호를 입력해주세요.");
    }
    updateButtonState();
  });

  // 로그인 버튼 클릭 시 최종 검증
  loginButton.addEventListener("click", (e) => {
    e.preventDefault(); // 기본 제출 막기

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // 1️⃣ 이메일 검사
    if (email.length === 0 || !emailRegex.test(email)) {
      showHelper(
        "* 올바른 이메일 주소 형식을 입력해주세요.(예) example@example.com)"
      );
      emailInput.focus();
      return;
    }

    // 2️⃣ 비밀번호 검사
    if (password.length === 0) {
      showHelper("* 비밀번호를 입력해주세요.");
      passwordInput.focus();
      return;
    }

    if (!passwordRegex.test(password)) {
      showHelper(
        "* 비밀번호는 대문자, 소문자, 숫자, 특수문자를 모두 포함해야 합니다."
      );
      passwordInput.focus();
      return;
    }

    // 3️⃣ 로그인 요청 (예시) -> 실제 서버와 연동!!!!
    // 실제 서버 요청 대신 가짜 로그인 검증
    const dummyEmail = "example@example.com";
    const dummyPassword = "Test1234!";

    if (email === dummyEmail && password === dummyPassword) {
      showHelper("", "#999");
      //   alert("로그인 성공!");
      window.location.href = "/postlist.html"; // 로그인 성공하면 게시글 목록 조회 페이지 이동
    } else {
      showHelper("* 아이디 또는 비밀번호를 확인해주세요.");
    }
  });

  // 회원가입 링크 클릭 시
  signupLink.addEventListener("click", (e) => {
    e.preventDefault(); // 기본 링크 동작 막기 (안 써도 무방하지만 안전하게)
    window.location.href = "/signup.html"; // 회원가입 페이지로 이동
  });
});
