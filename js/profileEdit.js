const profileImg = document.getElementById("profile_img");
const dropdownMenu = document.getElementById("dropdown_menu");

// 프로필 이미지 변경 버튼 기능
const changeButton = document.getElementById("change_button");
const avatarInput = document.getElementById("avatar_input");
const currentAvatar = document.getElementById("current_avatar");

profileImg.addEventListener("click", () => {
  dropdownMenu.classList.toggle("hidden");
});

// 바깥 클릭 시 닫기
window.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-menu")) {
    dropdownMenu.classList.add("hidden");
  }
});

// 프로필 이미지 변경 가능
// 변경 버튼 누르면 파일 선택창 열기
changeButton.addEventListener("click", (e) => {
  e.preventDefault(); // form 전송 방지
  avatarInput.click(); // ✅ 파일 업로드창 열기
});

// 파일 선택 시 이미지 미리보기 변경
avatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      currentAvatar.src = event.target.result; // ✅ 미리보기 교체
    };
    reader.readAsDataURL(file);
  }
});

// 회원탈퇴 모달 제어
// DomContentLoaded한 이유 : “HTML이 전부 다 로드되고 나서, 그 안의 요소들을 안전하게 조작할 수 있을 때” 실행하기 위해
document.addEventListener("DOMContentLoaded", () => {
  // 여기 안에는 html 요소들이 다 로드된 상태에서 실행이 되는 부분!!
  // 취소 버튼이 눌린 후에, 이 모달창이 띄워져야 하기 때문에 DomContentLoaded 안에 작성
  const deleteLink = document.getElementById("prodileDelete_link");
  const modalOverlay = document.getElementById("modal_overlay");
  const cancelButton = document.getElementById("cancel_button");
  const confirmButton = document.getElementById("confirm_button");

  // 회원탈퇴 클릭 → 모달 열기
  deleteLink.addEventListener("click", (e) => {
    e.preventDefault();
    modalOverlay.classList.remove("hidden");
  });

  // 취소 클릭 → 닫기
  cancelButton.addEventListener("click", (e) => {
    e.preventDefault();
    modalOverlay.classList.add("hidden");
  });

  // 확인 클릭 → 닫기 (또는 실제 탈퇴 처리)
  confirmButton.addEventListener("click", (e) => {
    e.preventDefault();
    // alert("회원탈퇴가 완료되었습니다.");
    modalOverlay.classList.add("hidden");
  });
});
