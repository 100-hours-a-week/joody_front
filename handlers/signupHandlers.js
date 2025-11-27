import { getState, setState } from "../vdom/Store.js";
import { validateNickname } from "../validators/signupValidators.js";
import { signupApi } from "../api/signupApi.js";
import {
  validateEmail,
  validatePassword,
  validatePasswordCheck,
} from "../validators/signupValidators.js";

export function handleNext(e) {
  e.preventDefault();
  const state = getState();
  const okEmail = validateEmail(state.email);
  const okPass = validatePassword(state.password);
  const okMatch = validatePasswordCheck(state.passwordCheck);
  if (!(okEmail && okPass && okMatch)) return;

  localStorage.setItem("signup_email", state.email.trim());
  localStorage.setItem("signup_password", state.password.trim());
  localStorage.setItem("signup_password_check", state.passwordCheck.trim());

  location.hash = "#/signup/step2";
}

export function handleNicknameInput(e) {
  let v = e.target.value.replace(/\s+/g, "");

  // 8자 넘김 처리
  if (v.length > 8) {
    v = v.slice(0, 8);
    setState({
      nickname: v,
      helperNickname: "* 닉네임은 최대 8자까지 가능합니다.",
    });
    return;
  }

  setState({ nickname: v });
  // 8 이하로 줄이면 바로 헬퍼 제거
  if (
    v.length <= 8 &&
    getState().helperNickname === "* 닉네임은 최대 8자까지 가능합니다."
  ) {
    setState({ helperNickname: "" });
  }

  if (v.length === 0) {
    setState({ helperNickname: "* 닉네임을 입력해주세요." });
    return;
  }

  setState({ helperNickname: "" });
}

export function handleNicknameBlur() {
  const v = getState().nickname.trim();
  const message = validateNickname(v);
  setState({ helperNickname: message });
}

export function preventSpace(e) {
  if (e.key === " ") {
    e.preventDefault();
    setState({ helperNickname: "* 공백은 입력할 수 없습니다." });
  }
}

export async function handleSubmit(e) {
  e.preventDefault();
  const state = getState();

  let avatarFile = state.avatar;

  // 기본 이미지 처리
  if (!avatarFile) {
    const defaultBlob = await fetch("./assets/img/default_profile.png").then(
      (res) => res.blob()
    );
    avatarFile = new File([defaultBlob], "default_profile.png", {
      type: defaultBlob.type,
    });
  }

  const email = localStorage.getItem("signup_email");
  const password = localStorage.getItem("signup_password");
  const password_check = localStorage.getItem("signup_password_check");

  const userData = {
    email,
    password,
    password_check,
    nickname: state.nickname,
  };
  setState({ isLoading: true });

  try {
    const data = await signupApi(userData, avatarFile);

    if (data.message === "success") {
      localStorage.clear();
      location.hash = "#/login";
      return;
    }

    if (data.message === "duplicate_email")
      setState({ helperNickname: "이미 존재하는 이메일입니다." });
    else if (data.message === "duplicate_nickname")
      setState({ helperNickname: "* 중복된 닉네임입니다." });
    else alert("회원가입 실패");
  } catch (err) {
    console.error(err);
    alert("서버 오류가 발생했습니다.");
  } finally {
    setState({ isLoading: false });
  }
}

export function attachAvatarEvents() {
  const avatarContainer = document.getElementById("avatar-container");
  const avatarInput = document.getElementById("avatar_input");
  const avatarPreview = document.getElementById("avatar_preview");
  const avatarHelper = document.querySelector(".profile_image_helper");

  if (!avatarContainer || !avatarInput || !avatarPreview) return;

  avatarContainer.addEventListener("click", () => avatarInput.click());

  avatarInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      avatarPreview.src = "";
      avatarContainer.classList.remove("has-avatar");
      avatarHelper.textContent = "* 프로필 사진을 추가하세요.";
      setState({ avatar: null, avatarPreview: "" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      avatarInput.value = "";
      avatarPreview.src = "";
      avatarContainer.classList.remove("has-avatar");
      avatarHelper.textContent = "* 이미지 파일만 업로드 가능합니다.";
      setState({ avatar: null, avatarPreview: "" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      avatarPreview.src = event.target.result;
      avatarContainer.classList.add("has-avatar");
      avatarHelper.textContent = "";
      setState({
        avatar: file,
        avatarPreview: event.target.result,
        helperAvatar: "",
      });
    };
    reader.readAsDataURL(file);
  };
}
