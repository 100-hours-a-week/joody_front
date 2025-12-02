import { setState } from "../vdom/Store.js";

export function handleOutsideClick(e) {
  if (!e.target.closest(".profile-menu")) setState({ dropdownOpen: false });
}
export function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    setState({
      profileImage: ev.target.result,
      pendingFile: file,
      editEnabled: true,
      helper: "",
    });
  };
  reader.readAsDataURL(file);
}

export function handleNicknameInput(e) {
  const v = e.target.value.replace(/\s+/g, "");
  let msg = "";
  let active = false;

  if (/\s/.test(e.target.value)) {
    msg = "* 닉네임에 공백은 사용할 수 없습니다.";
    active = false; // 버튼 비활성화
  } else if (v === "") {
    msg = "* 닉네임을 입력해주세요.";
    active = false; // 버튼 비활성화
  } else if (v.length > 8) {
    msg = "* 닉네임은 최대 8자까지 작성 가능합니다.";
    active = false; // 버튼 비활성화
  } else {
    active = true; // 조건 통과 시 활성화
  }

  setState({ nickname: v, helper: msg, editEnabled: active });
}
