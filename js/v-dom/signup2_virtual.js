import { h, createDom, updateElement } from "./common/Vdom.js";
import { initState, getState, setState, subscribe } from "./common/store.js";

initState({
  nickname: "",
  avatar: null,
  avatarPreview: "",
  helperAvatar: "",
  helperNickname: "",
  isLoading: false,
});

// ========== 유효성 검사 ==========
const nicknameRegex = /^[^\s]{1,8}$/;

// ========== 이벤트 ==========
function handleAvatarClick() {
  const input = document.getElementById("avatar_input");
  if (input) input.click(); // ✅ 사용자 직접 클릭으로만 실행됨 → 브라우저 경고 없음
}

// ========== 이벤트 ==========
function preventSpace(e) {
  if (e.key === " ") {
    e.preventDefault();
    setState({ helperNickname: "* 공백은 입력할 수 없습니다." });
  }
}

function handleNicknameInput(e) {
  const v = e.target.value.replace(/\s+/g, "");
  if (v.length > 8) return;
  setState({ nickname: v });
  if (!nicknameRegex.test(v)) {
    setState({
      helperNickname: "* 닉네임은 공백 없이 1~8자까지 입력 가능합니다.",
    });
  } else {
    setState({ helperNickname: "" });
  }
}

// ========== 이미지 업로드 ==========
function attachAvatarEvents() {
  const avatarContainer = document.getElementById("avatar-container");
  const avatarInput = document.getElementById("avatar_input");
  const avatarPreview = document.getElementById("avatar_preview");
  const avatarHelper = document.querySelector(".profile_image_helper");

  if (!avatarContainer || !avatarInput || !avatarPreview) return;

  // 클릭 시 업로드 창 열기
  avatarContainer.onclick = () => avatarInput.click();

  // 파일 변경 시
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

// ✅ 확인 버튼 클릭 시
async function handleSubmit(e) {
  e.preventDefault();
  const state = getState();

  const nickname = state.nickname.trim();
  const avatarFile = state.avatar;

  if (!avatarFile) {
    setState({ helperAvatar: "* 프로필 사진을 추가하세요." });
    return;
  }
  if (!nicknameRegex.test(nickname)) {
    setState({
      helperNickname: "* 닉네임은 공백 없이 1~8자까지 입력 가능합니다.",
    });
    return;
  }

  const email = localStorage.getItem("signup_email");
  const password = localStorage.getItem("signup_password");
  const password_check = localStorage.getItem("signup_password_check");

  if (!email || !password) {
    alert("1단계 정보를 불러올 수 없습니다. 다시 시도해주세요.");
    location.href = "/signup_1.html";
    return;
  }

  const userData = { email, password, password_check, nickname };
  const formData = new FormData();
  formData.append(
    "user",
    new Blob([JSON.stringify(userData)], { type: "application/json" })
  );
  formData.append("profile_image", avatarFile);

  setState({ isLoading: true });

  try {
    const response = await fetch("http://localhost:8080/users/signup", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.clear();
      //   alert("회원가입이 완료되었습니다!");
      location.href = "/login.html";
    } else if (data.message === "duplicate_email") {
      //   alert("이미 존재하는 이메일입니다.");
      setState({ helperNickname: "이미 존재하는 이메일입니다." });
    } else if (data.message === "duplicate_nickname") {
      setState({ helperNickname: "* 중복된 닉네임입니다." });
    } else {
      alert(data.message || "회원가입 실패");
    }
  } catch (err) {
    console.error("회원가입 요청 오류:", err);
    alert("서버 연결에 실패했습니다. 다시 시도해주세요.");
  } finally {
    setState({ isLoading: false });
  }
}

// ========== VDOM 렌더 ==========
function App() {
  const state = getState();
  const nicknameValid = nicknameRegex.test(state.nickname);
  const avatarUploaded = !!state.avatar;
  const active = nicknameValid && avatarUploaded;

  return h(
    "div",
    { className: "signup_vdom_wrapper" },

    h(
      "h2",
      { id: "signup_title" },
      "프로필 사진과",
      h("br"),
      "이름을 설정해주세요"
    ),

    h(
      "form",
      { id: "signup_form" },

      // 프로필 업로드
      h(
        "div",
        { id: "avatar-container" },
        h("img", {
          id: "avatar_preview",
          src: state.avatarPreview || "",
          alt: "프로필 미리보기",
        }),
        h("input", {
          type: "file",
          id: "avatar_input",
          name: "avatar",
          accept: "image/*",
          style: "display:none;",
        })
      ),
      h("p", { className: "profile_image_helper" }, state.helperAvatar),

      // 닉네임 입력
      h(
        "div",
        { className: "input_group" },
        h("label", { for: "nickname" }, "닉네임"),
        h(
          "div",
          { className: "input_wrapper" },
          h("input", {
            type: "text",
            id: "nickname",
            maxlength: 10,
            placeholder: "닉네임을 입력해주세요.",
            required: true,
            value: state.nickname,
            onkeydown: preventSpace,
            oninput: handleNicknameInput,
          })
        ),
        h("p", { className: "nickname_helper" }, state.helperNickname)
      ),

      // 확인 버튼
      h(
        "button",
        {
          id: "confirm_button",
          type: "submit",
          disabled: !active,
          onclick: handleSubmit,
          className: active ? "active" : "",
          style: {
            cursor: active ? "pointer" : "default",
          },
        },
        state.isLoading ? "등록 중..." : "확인"
      )
    )
  );
}

// ========== 렌더링 루프 ==========
const root = document.getElementById("signup_container");
let oldVNode = null;

function renderApp() {
  const newVNode = App();
  if (!oldVNode) {
    root.innerHTML = "";
    root.appendChild(createDom(newVNode));
  } else {
    updateElement(root, newVNode, oldVNode);
  }
  oldVNode = newVNode;

  attachAvatarEvents();
}
// 상태 변경 시마다 render 자동 호출
subscribe(renderApp);

document.addEventListener("DOMContentLoaded", () => {
  renderApp(); // 초기 렌더링
});
