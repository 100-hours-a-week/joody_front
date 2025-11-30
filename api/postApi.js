import { apiRequest } from "./authApi.js";

export async function fetchPostDetail(postId) {
  return apiRequest(`/posts/${postId}`);
}

export async function deletePostApi(postId) {
  return apiRequest(`/posts/${postId}`, { method: "DELETE" });
}
