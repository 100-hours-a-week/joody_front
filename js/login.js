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

  // focusout될 때(이메일 입력 안 한 채 넘어갈 때 처리)
  emailInput.addEventListener("blur", () => {
    const email = emailInput.value.trim();
    if (email.length === 0) {
      showHelper("* 이메일을 입력해주세요.");
    }
    updateButtonState();
  });

  // focusout될 때 ( 비밀번호 입력 안 한 채 넘어갈 때 처리)
  passwordInput.addEventListener("blur", () => {
    const password = passwordInput.value.trim();
    if (password.length === 0) {
      showHelper("* 비밀번호를 입력해주세요.");
    }
    updateButtonState();
  });

  // 로그인 버튼 클릭 시 실제 API 요청
  loginButton.addEventListener("click", async (e) => {
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

    try {
      // 2️⃣ 로그인 요청
      const response = await fetch("http://localhost:8080/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // 3️⃣ 로그인 성공
      if (response.ok) {
        showHelper("", "#999");
        // alert("로그인 성공!");

        // ✅ 예시: 토큰 저장 (JWT가 포함된 경우)
        if (data.data && data.data.token) {
          localStorage.setItem("accessToken", data.data.token);
        }

        // ✅ 사용자 정보 저장 (예: userId, nickname)
        if (data.data && data.data.user) {
          localStorage.setItem("userId", data.data.user.id);
          localStorage.setItem("nickname", data.data.user.nickname);
        }

        // ✅ 게시글 목록 페이지로 이동
        window.location.href = "/postlist.html";
      } else {
        // 4️⃣ 로그인 실패
        if (data.message === "emailOrPassword_mismatch") {
          console.log(data.message);
          showHelper("* 아이디 또는 비밀번호를 확인해주세요.");
        } else {
          showHelper(data.message || "로그인 실패. 다시 시도해주세요.");
        }
      }
    } catch (error) {
      console.error("로그인 요청 오류:", error);
      showHelper("서버 연결에 실패했습니다. 다시 시도해주세요.");
    }
  });

  // 회원가입 링크 클릭 시
  signupLink.addEventListener("click", (e) => {
    e.preventDefault(); // 기본 링크 동작 막기 (안 써도 무방하지만 안전하게)
    window.location.href = "/signup.html"; // 회원가입 페이지로 이동
  });
});
