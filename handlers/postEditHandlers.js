import { setState, getState } from "../vdom/Store.js";
import { apiRequest } from "../api/authApi.js";

export function handleImageChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("이미지 파일만 업로드 가능합니다.");
    e.target.value = "";
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    alert("3MB 이하만 업로드 가능합니다.");
    return;
  }

  setState({
    imageFile: file,
    currentImageName: file.name,
  });
}

export async function handlesubmitEdit() {
  const state = getState();
  if (!state.title.trim() || !state.content.trim()) {
    alert("제목과 내용을 모두 입력해주세요!");
    return;
  }

  const formData = new FormData();
  formData.append("title", state.title);
  formData.append("content", state.content);
  if (state.imageFile) formData.append("image", state.imageFile);

  const { ok, data } = await apiRequest(`/posts/${state.postId}`, {
    method: "PUT",
    body: formData,
  });

  if (!ok) {
    alert("수정 실패: " + (data?.message || "오류"));
    return;
  }

  location.href = `#/postDetail?id=${data.post_id}`;
}
