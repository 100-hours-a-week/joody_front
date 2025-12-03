import { apiRequest } from "./authApi.js";
import { getState, setState } from "../vdom/Store.js";
import { showToast } from "../utils/common.js";

export async function loadProfile() {
  const state = getState();
  const { userId } = state;
  if (!userId) return;

  try {
    const { ok, data } = await apiRequest(`/users/${userId}/profile`);
    if (!ok) return;

    const { profileImage, email, nickname } = data;
    const resolvedProfileImage = profileImage
      ? profileImage.startsWith("http")
        ? profileImage
        : `http://localhost:8080${profileImage}`
      : "../assets/img/default_profile.png";

    localStorage.setItem("email", email || "");
    localStorage.setItem("nickname", nickname || "");
    localStorage.setItem("profileImage", resolvedProfileImage);

    setState({
      email,
      nickname,
      profileImage: resolvedProfileImage,
    });
  } catch (e) {
    console.error("프로필 로드 실패:", e);
  }
}

// 프로필 수정 요청
export async function submitProfile() {
  const { userId, nickname, pendingFile } = getState();
  const nextNickname = (nickname || "").trim();
  if (!userId) return;
  if (!pendingFile && !nextNickname) return;

  try {
    setState({ uploading: true });

    const isFileUpload = !!pendingFile;
    const body = isFileUpload
      ? (() => {
          const fd = new FormData();
          fd.append("profile_image", pendingFile);
          if (nextNickname) fd.append("nickname", nextNickname);
          return fd;
        })()
      : JSON.stringify({ nickname: nextNickname });

    const { ok, data } = await apiRequest(`/users/${userId}/profile`, {
      method: "PUT",
      body,
    });

    if (ok) {
      if (nextNickname) localStorage.setItem("nickname", nextNickname);
      await loadProfile();
      showToast("수정완료");
      setState({ helper: "", editEnabled: false, pendingFile: null });
    } else if (data?.message === "duplicate_nickname") {
      setState({ helper: "* 이미 사용 중인 닉네임입니다." });
    } else {
      setState({ helper: "* 닉네임 수정 실패" });
    }
  } catch (e) {
    console.error("프로필 수정 중 오류:", e);
  } finally {
    setState({ uploading: false });
  }
}

// 회원 탈퇴
export async function withdrawUser() {
  const { userId } = getState();
  const { ok, data } = await apiRequest(`/users/${userId}`, {
    method: "DELETE",
  });

  if (ok && data.message === "withdraw_success") {
    localStorage.clear();
    window.location.hash = "#/login";
  } else {
    showToast("회원탈퇴 실패");
  }
  setState({ modalOpen: false });
}
