document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("post_title_input");
  const contentInput = document.getElementById("post_content_input");
  const submitButton = document.getElementById("submit_button");
  const helperText = document.querySelector(".helper_text");
  const imageInput = document.getElementById("post_image_input");
  const form = document.getElementById("edit_form");

  // 초기 버튼 상태
  submitButton.disabled = true;
  submitButton.style.backgroundColor = "#aca0eb";

  // ===== 1️⃣ 제목 최대 26자 제한 =====
  titleInput.addEventListener("input", () => {
    if (titleInput.value.length > 26) {
      titleInput.value = titleInput.value.slice(0, 26);
    }
    updateButtonState();
  });

  // ===== 2️⃣ 내용 입력 감지 =====
  contentInput.addEventListener("input", updateButtonState);

  // ===== 3️⃣ 입력 상태에 따라 버튼 색상 업데이트 =====
  function updateButtonState() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (title.length > 0 && content.length > 0) {
      submitButton.disabled = false;
      submitButton.style.backgroundColor = "#7f6aee";
      helperText.textContent = "";
    } else {
      submitButton.disabled = true;
      submitButton.style.backgroundColor = "#aca0eb";
    }
  }

  // ===== 4️⃣ 제출 이벤트 처리 =====
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // 새로고침 방지

    const userId = localStorage.getItem("userId"); // ✅ 로그인한 유저 ID 가져오기
    if (!userId) {
      alert("로그인이 필요합니다.");
      window.location.href = "login.html";
      return;
    }

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const imageFile = imageInput.files[0];

    if (title === "" || content === "") {
      helperText.textContent = "* 제목, 내용을 모두 작성해주세요.";
      helperText.style.color = "red";
      return;
    }

    // === formData 구성 ===
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await fetch(`http://localhost:8080/posts/${userId}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const postId = result.data.post_id;
        // alert("게시글이 성공적으로 작성되었습니다!");
        // // ✅ localStorage에 저장
        localStorage.setItem("CreatedPostId", postId);
        window.location.href = "postList.html";
      } else {
        alert("게시글 작성 실패: " + (result.message || "오류"));
      }
    } catch (err) {
      console.error("게시글 작성 오류:", err);
      alert("서버 오류가 발생했습니다. 콘솔을 확인해주세요.");
    }
  });
});
