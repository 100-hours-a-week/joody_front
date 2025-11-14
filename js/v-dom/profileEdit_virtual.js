/** ========= Virtual DOM 기반 회원정보 수정 페이지 ========= **/

// ========== Virtual DOM 유틸 ==========
function h(type, props = {}, ...children) {
  return { type, props, children };
}
function createDom(node) {
  if (node == null) return document.createTextNode("");
  if (typeof node === "string" || typeof node === "number")
    return document.createTextNode(String(node));

  const el = document.createElement(node.type);
  const props = node.props || {};

  Object.keys(props).forEach((k) => {
    const v = props[k];
    if (k.startsWith("on") && typeof v === "function")
      el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "value") el.value = v;
    else if (k === "className") el.setAttribute("class", v);
    else if (k === "disabled") el.disabled = !!v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (v != null) el.setAttribute(k, v);
  });

  (node.children || []).forEach((c) => el.appendChild(createDom(c)));
  return el;
}
function changed(a, b) {
  if (a == null || b == null) return a !== b;
  if (typeof a !== typeof b) return true;
  if (typeof a === "string" || typeof a === "number") return a !== b;
  return a.type !== b.type;
}
function patchProps(el, newProps, oldProps) {
  Object.keys(oldProps).forEach((k) => {
    if (!(k in newProps)) {
      if (k.startsWith("on"))
        el.removeEventListener(k.slice(2).toLowerCase(), oldProps[k]);
      else el.removeAttribute(k);
    }
  });
  Object.keys(newProps).forEach((k) => {
    const nv = newProps[k];
    const ov = oldProps[k];
    if (nv === ov) return;
    if (k.startsWith("on") && typeof nv === "function") {
      if (typeof ov === "function")
        el.removeEventListener(k.slice(2).toLowerCase(), ov);
      el.addEventListener(k.slice(2).toLowerCase(), nv);
    } else if (k === "value") el.value = nv;
    else if (k === "disabled") el.disabled = !!nv;
    else if (k === "className") el.setAttribute("class", nv);
    else if (k === "style" && typeof nv === "object") {
      el.removeAttribute("style");
      Object.assign(el.style, nv);
    } else if (nv != null) el.setAttribute(k, nv);
  });
}
function updateDom(parent, newNode, oldNode, index = 0) {
  if (!parent) return;
  const existing = parent.childNodes[index];
  if (newNode == null) {
    if (existing) parent.removeChild(existing);
    return;
  }
  if (oldNode == null) {
    parent.appendChild(createDom(newNode));
    return;
  }
  if (changed(newNode, oldNode)) {
    parent.replaceChild(createDom(newNode), existing);
    return;
  }
  patchProps(existing, newNode.props || {}, oldNode.props || {});
  const nc = newNode.children || [];
  const oc = oldNode.children || [];
  const max = Math.max(nc.length, oc.length);
  for (let i = 0; i < max; i++) updateDom(existing, nc[i], oc[i], i);
}

// ========== 상태 ==========
let state = {
  userId: localStorage.getItem("userId") || null,
  email: "",
  profileImage: "./img/profile.png",
  nickname: "",
  helper: "",
  dropdownOpen: false,
  modalOpen: false,
  toastMsg: "",
  showToast: false,
  editEnabled: false,
  uploading: false,
};

// ========== 상태 갱신 ==========
function setState(next) {
  state = { ...state, ...next };
  render();
}

// ========== 유틸 ==========
function showToast(msg) {
  setState({ toastMsg: msg, showToast: true });
  setTimeout(() => setState({ showToast: false }), 2500);
}

// ========== API ==========
async function loadProfile() {
  try {
    const userId = state.userId;
    if (!userId) return;

    const res = await fetch(`http://localhost:8080/users/${userId}/profile`);
    const json = await res.json();

    if (json.message === "read_success") {
      const img = json.data.profileImage;
      const email = json.data.email;
      setState({
        email: email || "",
        profileImage: img
          ? img.startsWith("http")
            ? img
            : `http://localhost:8080${img}`
          : "./img/profile.png",
      });
    }
  } catch (e) {
    console.error("프로필 불러오기 실패:", e);
  }
}

async function uploadProfileImage(file) {
  if (!file) return;
  const userId = state.userId;
  const fd = new FormData();
  fd.append("profile_image", file);

  try {
    setState({ uploading: true });
    const res = await fetch(
      `http://localhost:8080/users/${userId}/profile/image`,
      {
        method: "POST",
        body: fd,
      }
    );
    const json = await res.json();
    if (json.message === "profile_image_uploaded") {
      setState({ profileImage: json.data });
    } else {
      console.error("업로드 실패:", json);
    }
  } catch (e) {
    console.error("이미지 업로드 중 오류:", e);
  } finally {
    setState({ uploading: false });
  }
}

async function updateNickname() {
  const nickname = state.nickname.trim();
  if (!nickname) return;

  const res = await fetch(
    `http://localhost:8080/users/${state.userId}/profile`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    }
  );

  const data = await res.json();
  if (res.ok) {
    showToast("수정완료");
    setState({ helper: "" });
  } else if (data.message === "duplicate_nickname") {
    setState({ helper: "* 이미 사용 중인 닉네임입니다." });
  } else {
    setState({ helper: "* 닉네임 수정 실패" });
  }
}

async function withdrawUser() {
  const userId = state.userId;
  const res = await fetch(`http://localhost:8080/users/${userId}`, {
    method: "DELETE",
  });
  const data = await res.json();

  if (res.ok && data.message === "withdraw_success") {
    localStorage.clear();
    window.location.href = "/signup_1.html";
  } else {
    showToast("회원탈퇴 실패");
  }
  setState({ modalOpen: false });
}

// ========== 이벤트 ==========
function handleDropdownToggle() {
  setState({ dropdownOpen: !state.dropdownOpen });
}
function handleOutsideClick(e) {
  if (!e.target.closest(".profile-menu")) setState({ dropdownOpen: false });
}
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    setState({ profileImage: ev.target.result });
  };
  reader.readAsDataURL(file);
  uploadProfileImage(file);
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
  const activeStyle = state.editEnabled
    ? { backgroundColor: "#4baa7d", color: "#fff", cursor: "pointer" }
    : { backgroundColor: "#dcdbe3", color: "#fff", cursor: "default" };

  return h(
    "div",
    { id: "profileEdit_root" },
    // 헤더
    h(
      "header",
      { id: "main_header" },
      h(
        "p",
        {
          id: "header_title",
          onclick: () => (location.href = "postList.html"),
        },
        h("img", { src: "./img/logo4.png", id: "header_logo", alt: "로고" })
      ),
      h(
        "div",
        { className: "profile-menu" },
        h("img", {
          id: "profile_img",
          src: state.profileImage,
          onclick: handleDropdownToggle,
        }),
        h(
          "ul",
          {
            id: "dropdown_menu",
            className: state.dropdownOpen ? "" : "hidden",
          },
          h("li", null, h("a", { href: "/profileEdit.html" }, "회원정보수정")),
          h("li", null, h("a", { href: "/passwordEdit.html" }, "비밀번호수정")),
          h("li", null, h("a", { href: "/login.html" }, "로그아웃"))
        )
      )
    ),

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
          value: state.nickname,
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
              updateNickname();
            },
            style: activeStyle,
            disabled: !state.editEnabled,
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

// ========== 렌더링 ==========
const root = document.getElementById("profileEdit_app");
let oldVNode = null;

function render() {
  const newVNode = App();
  if (!oldVNode) {
    root.innerHTML = "";
    root.appendChild(createDom(newVNode));
  } else updateDom(root, newVNode, oldVNode);
  oldVNode = newVNode;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadProfile();
  window.addEventListener("click", handleOutsideClick);
  render();
});
