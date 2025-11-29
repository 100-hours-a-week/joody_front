import { h, createDom, updateElement } from "../vdom/Vdom.js";
import { initState, getState, setState, subscribe } from "../vdom/Store.js";
import { apiRequest } from "../api/authApi.js";
import { withdrawUserApi } from "../api/profileApi.js";
import MainHeader from "../components/common/mainHeader.js";
import { setupHeaderEvents, teardownHeaderEvents } from "../utils/common.js";

// 토스트 메시지
function showToast(msg) {
  setState({ toastMsg: msg, showToast: true });
  setTimeout(() => setState({ showToast: false }), 2500);
}

// ========== API ==========
async function loadProfile() {
  const state = getState();
  const { userId } = state;
  if (!userId) return;

  try {
    const { ok, data } = await apiRequest(`/users/${userId}/profile`);
    if (!ok) return;

    const { profileImage, email, nickname } = data.data;
    const resolvedProfileImage = profileImage
      ? profileImage.startsWith("http")
        ? profileImage
        : `http://localhost:8080${profileImage}`
      : "../assets/img/default_profile.png";

    if (email) localStorage.setItem("email", email);
    if (nickname) localStorage.setItem("nickname", nickname);
    localStorage.setItem("profileImage", resolvedProfileImage);

    setState({
      email,
      nickname: nickname || state.nickname || "",
      profileImage: resolvedProfileImage,
    });
  } catch (e) {
    console.error("프로필 로드 실패:", e);
  }
}

async function submitProfile() {
  const { userId, nickname, pendingFile } = getState();
  const nextNickname = (nickname || "").trim();

  if (!userId) return;
  if (!pendingFile && !nextNickname) return; // 변경 사항 없음

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
      await loadProfile(); // 최신 데이터 동기화
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

async function withdrawUser() {
  const { userId } = getState();
  //   const { ok, data } = await apiRequest(`/users/${userId}`, {
  //     method: "DELETE",
  //   });
  const { ok, data } = await withdrawUserApi(userId);

  if (ok && data.message === "withdraw_success") {
    localStorage.clear();
    window.location.href = "/signup_1.html";
  } else {
    showToast("회원탈퇴 실패");
  }
  setState({ modalOpen: false });
}

// ========== 이벤트 ==========
function handleOutsideClick(e) {
  if (!e.target.closest(".profile-menu")) setState({ dropdownOpen: false });
}
function handleFileSelect(e) {
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
function handleNicknameInput(e) {
  const v = e.target.value.replace(/\s+/g, "");
  let msg = "";
  let active = false;

  if (/\s/.test(e.target.value)) msg = "* 닉네임에 공백은 사용할 수 없습니다.";
  else if (v === "") msg = "* 닉네임을 입력해주세요.";
  else if (v.length > 10) msg = "* 닉네임은 최대 10자까지 작성 가능합니다.";
  else active = true;

  setState({ nickname: v, helper: msg, editEnabled: active });
}

// ========== 뷰 ==========
function App() {
  const state = getState();
  const canSubmit = state.editEnabled || !!state.pendingFile;
  const activeStyle = canSubmit
    ? { backgroundColor: "#4baa7d", color: "#fff", cursor: "pointer" }
    : { backgroundColor: "#dcdbe3", color: "#fff", cursor: "default" };

  return h(
    "div",
    { id: "profileEdit_root" },
    // 헤더
    MainHeader(),

    // 본문
    h("h1", { id: "profileEdit_title" }, "회원정보수정"),
    h(
      "div",
      { id: "profileEdit_container" },
      h(
        "form",
        { id: "profileEdit_form", enctype: "multipart/form-data" },
        h("p", { className: "profile_image" }, "프로필 사진*"),
        h(
          "div",
          { className: "avatar-container has-avatar" },
          h("img", {
            id: "current_avatar",
            src: state.profileImage,
          }),
          h(
            "button",
            {
              id: "change_button",
              onclick: (e) => {
                e.preventDefault();
                document.getElementById("avatar_input").click();
              },
            },
            state.uploading ? "업로드 중..." : "변경"
          ),
          h("input", {
            type: "file",
            id: "avatar_input",
            accept: "image/*",
            style: "display:none;",
            onchange: handleFileSelect,
          })
        ),

        h("p", { className: "email_label" }, "이메일"),
        h("p", { id: "email_display" }, state.email || "example@example.com"),

        h("p", { className: "nickname_label" }, "닉네임*"),
        h("input", {
          id: "nickname",
          value: state.nickname || "",
          placeholder: "닉네임을 입력하세요.",
          maxlength: 10,
          autocomplete: "off",
          oninput: handleNicknameInput,
        }),
        h("p", { className: "nickname_helper" }, state.helper),
        h(
          "button",
          {
            id: "edited_button",
            type: "submit",
            onclick: (e) => {
              e.preventDefault();
              submitProfile();
            },
            style: activeStyle,
            disabled: !canSubmit,
          },
          "수정하기"
        )
      ),
      h(
        "a",
        {
          href: "#",
          id: "profileDelete_link",
          onclick: (e) => {
            e.preventDefault();
            setState({ modalOpen: true });
          },
        },
        "회원탈퇴"
      ),
      h(
        "div",
        { id: "toast", className: state.showToast ? "show" : "hidden" },
        state.toastMsg
      )
    ),

    // 모달
    h(
      "div",
      { id: "modal_overlay", className: state.modalOpen ? "" : "hidden" },
      h(
        "div",
        { id: "delete_modal" },
        h("h2", null, "회원탈퇴 하시겠습니까?"),
        h("p", null, "작성된 게시글과 댓글은 삭제됩니다."),
        h(
          "div",
          { className: "modal_buttons" },
          h(
            "button",
            {
              id: "cancel_button",
              onclick: () => setState({ modalOpen: false }),
            },
            "취소"
          ),
          h("button", { id: "confirm_button", onclick: withdrawUser }, "확인")
        )
      )
    )
  );
}

export default function ProfileEditPage(root) {
  const storedUserId = localStorage.getItem("userId");
  const storedEmail = localStorage.getItem("email");
  const storedNickname = localStorage.getItem("nickname");
  const storedProfileImage = localStorage.getItem("profileImage");
  const fallbackProfileImage = "../assets/img/default_profile.png";

  initState({
    userId: storedUserId && storedUserId !== "undefined" ? storedUserId : "",
    email: storedEmail && storedEmail !== "undefined" ? storedEmail : "",
    profileImage:
      storedProfileImage && storedProfileImage !== "undefined"
        ? storedProfileImage
        : fallbackProfileImage,
    nickname:
      storedNickname && storedNickname !== "undefined" ? storedNickname : "",
    pendingFile: null,
    helper: "",
    dropdownOpen: false,
    modalOpen: false,
    toastMsg: "",
    showToast: false,
    editEnabled: false,
    uploading: false,
  });

  let oldVNode = null;

  function render() {
    const newVNode = App();
    if (!oldVNode) {
      root.innerHTML = "";
      root.appendChild(createDom(newVNode));
    } else updateElement(root, newVNode, oldVNode);
    oldVNode = newVNode;
  }

  async function init() {
    subscribe(render); // 상태 변경 시 자동 렌더
    render(); // DOM 생성 후
    setupHeaderEvents(); // 헤더 요소 존재할 때 이벤트 바인딩
    await loadProfile(); // 서버 데이터로 동기화
    window.addEventListener("click", handleOutsideClick);
  }

  init();

  return () => {
    window.removeEventListener("click", handleOutsideClick);
    teardownHeaderEvents();
  };
}
