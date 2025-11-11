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

async function loadUserProfile() {
  try {
    const userId = localStorage.getItem("userId"); // ✅ 로그인 시 저장해둬야 함

    if (!userId) {
      console.warn("로그인된 사용자 ID가 없습니다.");
      return;
    }

    const res = await fetch(`http://localhost:8080/users/${userId}/profile`);
    const json = await res.json();

    // console.log(json.data.profileImage);

    if (json.message === "read_success") {
      const imgUrl = json.data.profileImage;

      profileImg.src = imgUrl
        ? imgUrl.startsWith("http")
          ? imgUrl
          : `http://localhost:8080${imgUrl}`
        : "./img/profile.png";
    }
  } catch (err) {
    console.error("프로필 불러오기 실패:", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile(); // ✅ 동적 userId 사용
  const titleInput = document.getElementById("post_title_input");
  const contentInput = document.getElementById("post_content_input");
  const imageInput = document.getElementById("post_image_input");
  const submitButton = document.getElementById("submit_button");
  const form = document.getElementById("edit_form");

  // ✅ URL에서 id 가져오기
  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get("id"));

  if (!postId) {
    alert("잘못된 접근입니다.");
    window.location.href = "postList.html";
    return;
  }

  // 기존 게시글 불러오기
  try {
    const response = await fetch(`http://localhost:8080/posts/${postId}`);
    const result = await response.json();

    if (!response.ok)
      throw new Error(result.message || "게시글을 불러오지 못했습니다.");

    const post = result.data;
    titleInput.value = post.title;
    contentInput.value = post.content;

    // 기존 이미지 파일명 표시
    const imageFileName = document.createElement("p");
    imageFileName.id = "image_file_name";
    imageFileName.textContent = `현재 이미지 파일: ${
      post.postImage ? post.postImage.split("/").pop() : "없음"
    }`;
    imageFileName.style.marginTop = "8px";
    imageFileName.style.fontSize = "14px";
    imageFileName.style.color = "#555";
    imageInput.insertAdjacentElement("afterend", imageFileName);

    // 새 파일 선택 시 파일명 변경
    imageInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      console.log(file.size);
      if (!file) {
        imageFileName.textContent = "선택된 파일이 없습니다.";
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 업로드 가능합니다.");
        imageInput.value = "";
        imageFileName.textContent = "선택된 파일이 없습니다.";
        return;
      }
      const maxSize = 3 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(
          `파일 용량이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(
            2
          )}MB)\n5MB 이하만 업로드 가능합니다.`
        );
        e.target.value = "";
        imageFileName.textContent = "선택된 파일이 없습니다.";
        return;
      }

      // 정상 파일이면 파일명 표시
      imageFileName.textContent = `선택된 파일: ${file.name} (${(
        file.size / 1024
      ).toFixed(1)}KB)`;
    });
  } catch (err) {
    console.error("게시글 불러오기 오류:", err);
    alert("게시글 정보를 불러오는 중 오류가 발생했습니다.");
    window.location.href = "postList.html";
    return;
  }

  // 제목 26자 제한
  titleInput.addEventListener("input", () => {
    if (titleInput.value.length > 26) {
      alert("제목은 최대 26자까지만 입력 가능합니다!");
      titleInput.value = titleInput.value.slice(0, 26);
    }
  });

  // 본문 길이 제한
  contentInput.addEventListener("input", () => {
    const length = contentInput.value.length;
    if (length > 65535) {
      alert("본문이 너무 깁니다! (MySQL LONGTEXT 한도 초과)");
      contentInput.value = contentInput.value.slice(0, 65535);
    }
  });

  // 수정 버튼 클릭 시
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const imageFile = imageInput.files[0];

    if (!title || !content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // formData 구성
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (imageFile) formData.append("image", imageFile);

    try {
      const response = await fetch(`http://localhost:8080/posts/${postId}`, {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        window.location.href = `post.html?id=${
          result.data.post_id
        }&t=${Date.now()}`;
      } else {
        alert("게시글 수정 실패: " + (result.message || "서버 오류"));
      }
    } catch (err) {
      console.error("게시글 수정 중 오류:", err);
      alert("서버와의 통신 중 오류가 발생했습니다.");
    }
  });
});
