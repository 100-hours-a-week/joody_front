// utils/api.js

function getToken() {
  return localStorage.getItem("access_token"); // 엑세스 토큰 키 이름 ..
}

export async function apiRequest(url, options = {}) {
  const fullUrl = `http://localhost:8080${url}`;
  const token = getToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  };

  let response = await fetch(fullUrl, config);

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      const newToken = getToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(fullUrl, config);
    } else {
      alert("로그인이 필요합니다.");
      window.location.href = "/login.html";
      return;
    }
  }

  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

async function refreshAccessToken() {
  try {
    const res = await fetch("http://localhost:8080/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    const json = await res.json();
    if (!res.ok) return false;

    localStorage.setItem("accessToken", json.data);

    return true;
  } catch (err) {
    return false;
  }
}
