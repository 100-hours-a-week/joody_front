import { apiRequest } from "./authApi.js";

/**
 * 1) 프로필 조회
 *  GET /users/{userId}/profile
 */
export async function fetchProfileApi(userId) {
  if (!userId) return { ok: false, data: null };

  return apiRequest(`/users/${userId}/profile`);
}

/**
 * 2) 프로필 이미지 업로드
 */
export async function uploadProfileImageApi(userId, file) {
  if (!userId || !file) return { ok: false, data: null };

  const fd = new FormData();
  fd.append("profile_image", file);

  // Content-Type을 명시하지 않아야 브라우저가 multipart/form-data 로 설정해줌
  return apiRequest(`/users/${userId}/profile`, {
    method: "PUT",
    body: JSON.stringify({ nickname }),
  });
}

/**
 * 3) 닉네임 수정
 *  원래 코드 그대로 fetch + Bearer 토큰 유지
 */
export async function updateNicknameApi(userId, nickname) {
  if (!userId || !nickname) return { ok: false, data: null };

  const res = await fetch(`http://localhost:8080/users/${userId}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("access_token"),
    },
    credentials: "include", // 쿠키도 보낼거면 유지
    body: JSON.stringify({ nickname }),
  });

  const data = await res.json();
  return { ok: res.ok, data };
}

/**
 * 4) 회원 탈퇴
 *  DELETE /users/{userId}
 */
export async function withdrawUserApi(userId) {
  if (!userId) return { ok: false, data: null };

  return apiRequest(`/users/${userId}`, {
    method: "DELETE",
  });
}
