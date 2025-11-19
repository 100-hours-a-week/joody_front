// utils/api.js

function getToken() {
  return localStorage.getItem("access_token"); // 엑세스 토큰 키 이름 ..
}
// ✔ FormData 체크
function isFormData(body) {
  return body instanceof FormData;
}

export async function apiRequest(url, options = {}) {
  const fullUrl = `http://localhost:8080${url}`;
  const token = getToken();

  const isFormData = options.body instanceof FormData;

  const config = {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  };

  let response = await fetch(fullUrl, config);

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      alert("로그인이 필요합니다.");
      window.location.href = "/login.html";
      return;
    }

    const newToken = getToken();
    config.headers.Authorization = `Bearer ${newToken}`;
    response = await fetch(fullUrl, config);
  }

  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };

  async function refreshAccessToken() {
    try {
      const res = await fetch("http://localhost:8080/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) return false;

      // access_token으로 저장
      localStorage.setItem("access_token", json.data.accessToken);

      return true;
    } catch (err) {
      return false;
    }
  }
}
