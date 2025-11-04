// ...existing code...
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("avatar_input");
  const preview = document.getElementById("avatar_preview");
  const container = document.querySelector(".avatar-container");

  if (!input || !preview || !container) return;

  // 컨테이너(또는 +) 클릭 시 파일 선택창 열기
  container.addEventListener("click", function (e) {
    // 클릭이 실제 파일 입력에 가는 기본 동작이 아닐 경우 수동으로 열기
    input.click();
  });

  // 파일 선택 시 미리보기 및 클래스 토글
  input.addEventListener("change", function () {
    const file = input.files && input.files[0];
    if (!file) {
      preview.src = "./images/avatar-placeholder.png";
      container.classList.remove("has-avatar");
      return;
    }
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = function (ev) {
      preview.src = ev.target.result;
      container.classList.add("has-avatar");
    };
    reader.readAsDataURL(file);
  });
});
// ...existing code...
