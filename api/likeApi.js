import { apiRequest } from "./authApi.js";

export async function toggleLike(postId, userId) {
  return apiRequest(`/posts/${postId}/likes/toggle?userId=${userId}`, {
    method: "POST",
  });
}
