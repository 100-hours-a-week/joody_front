import { validateForm } from "../validators/postsValidators.js";
import { debounce, throttle } from "../utils/common.js";
import { setState, getState } from "../vdom/Store.js";
import { apiRequest } from "../api/authApi.js";

export const handleTitleInput = debounce((e) => {
  let v = e.target.value;
  if (v.length > 26) v = v.slice(0, 26);
  setState({ title: v });
  validateForm();
}, 80);

export const handleContentInput = debounce((e) => {
  setState({ content: e.target.value });
  validateForm();
}, 80);

export const handleImageSelect = throttle((e) => {
  const file = e.target.files[0];
  if (!file) return;
  setState({
    image: file,
    previewURL: URL.createObjectURL(file),
  });
}, 300);

export const handleSubmit = throttle(async (e) => {
  e.preventDefault();

  const s = getState();
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("로그인이 필요합니다.");
    window.location.href = "#/login";
    return;
  }

  if (!s.title.trim() || !s.content.trim()) {
    setState({ helper: "* 제목과 내용을 모두 입력해주세요." });
    return;
  }

  const formData = new FormData();
  formData.append("title", s.title.trim());
  formData.append("content", s.content.trim());
  if (s.image) formData.append("image", s.image);

  try {
    const result = await apiRequest(`/posts/${userId}`, {
      method: "POST",
      body: formData, // FormData 그대로 전달
    });

    if (!result.ok) {
      if (result.status === 401 || result.status === 403) {
        alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
        window.location.href = "#/login";
        return;
      }
      alert("게시글 작성 실패: " + (result.data?.message || "오류"));
      return;
    }

    const postId = result.data.post_id;
    localStorage.setItem("CreatedPostId", postId);
    window.location.href = "#/postlist";
  } catch (err) {
    console.error("게시글 작성 오류:", err);
    alert("서버 오류가 발생했습니다.");
  }
}, 2000);
