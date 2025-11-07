document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("post_title_input");
  const contentInput = document.getElementById("post_content_input");
  const imageInput = document.getElementById("post_image_input");
  const submitButton = document.getElementById("submit_button");
  const form = document.getElementById("edit_form");

  // ✅ URL에서 id 가져오기
  const params = new URLSearchParams(window.location.search);
  const postId = parseInt(params.get("id"));

  // ✅ 더미 게시글 데이터 (백엔드 연동 전 임시 데이터)
  const dummyPosts = [
    {
      id: 1,
      title: "첫 번째 게시글",
      content: "이건 첫 번째 게시글의 내용입니다.",
      image: "./img/post_img.jpeg",
    },
    {
      id: 2,
      title: "두 번째 게시글",
      content: "이건 두 번째 게시글의 내용입니다.",
      image: "./img/post_img.jpeg",
    },
  ];

  // ✅ localStorage에서 수정된 게시글 불러오기 (있으면 우선 적용)
  const savedPost = JSON.parse(localStorage.getItem(`post_${postId}`));

  // ✅ 해당 id 게시글 찾기 (localStorage > dummy)
  const post = savedPost
    ? { ...dummyPosts.find((p) => p.id === postId), ...savedPost }
    : dummyPosts.find((p) => p.id === postId);

  if (!post) {
    alert("게시글 정보를 불러올 수 없습니다.");
    window.location.href = "postList.html";
    return;
  }

  // === 기존 게시글 데이터 채우기 ===
  titleInput.value = post.title;
  contentInput.value = post.content;

  // ✅ 파일명 표시 (기존 이미지)
  const imageFileName = document.createElement("p");
  imageFileName.id = "image_file_name";
  imageFileName.textContent = `현재 이미지 파일: ${post.image
    .split("/")
    .pop()}`;
  imageFileName.style.marginTop = "8px";
  imageFileName.style.fontSize = "14px";
  imageFileName.style.color = "#555";
  imageInput.insertAdjacentElement("afterend", imageFileName);

  // ✅ 새 파일 선택 시 파일명 변경
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
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
    imageFileName.textContent = `선택된 파일: ${file.name}`;
  });

  // === 제목 26자 제한 ===
  titleInput.addEventListener("input", () => {
    if (titleInput.value.length > 26) {
      alert("제목은 최대 26자까지만 입력 가능합니다!");
      titleInput.value = titleInput.value.slice(0, 26);
    }
  });

  // === 본문 길이 제한 (LONGTEXT 유사 처리) ===
  contentInput.addEventListener("input", () => {
    const length = contentInput.value.length;
    if (length > 65535) {
      alert("본문이 너무 깁니다! (MySQL LONGTEXT 한도 초과)");
      contentInput.value = contentInput.value.slice(0, 65535);
    }
  });

  // === 수정 버튼 클릭 시 ===
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const updatedPost = {
      id: post.id,
      title: titleInput.value.trim(),
      content: contentInput.value.trim(),
      image: imageInput.files[0]
        ? imageInput.files[0].name
        : post.image.split("/").pop(),
    };

    if (!updatedPost.title || !updatedPost.content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    // ✅ localStorage에 수정된 게시글 저장
    localStorage.setItem(`post_${updatedPost.id}`, JSON.stringify(updatedPost));

    alert("게시글이 수정되었습니다!");

    // ✅ 상세 페이지로 이동
    window.location.href = `post.html?id=${updatedPost.id}`;
  });
});
