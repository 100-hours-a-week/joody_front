import { apiRequest } from "./authApi.js";
import { setState } from "../vdom/Store.js";

export async function fetchPostDetail(postId) {
  return apiRequest(`/posts/${postId}`);
}

export async function deletePostApi(postId) {
  return apiRequest(`/posts/${postId}`, { method: "DELETE" });
}

export async function loadPostData(postId) {
  const { ok, data } = await apiRequest(`/posts/${postId}`);

  if (!ok || !data) {
    alert("게시글 로딩 중 오류 발생!");
    location.href = "#/postlist";
    return;
  }

  setState({
    title: data.title,
    content: data.content,
    currentImageName: data.postImage ? data.postImage.split("/").pop() : "없음",
  });
}
