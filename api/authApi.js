function getToken() {
  return localStorage.getItem("access_token"); // 엑세스 토큰 키 이름 ..
}

export async function apiRequest(url, options = {}) {
  const fullUrl = `http://localhost:8080${url}`;
  const token = getToken();

  const isFormData = options.body instanceof FormData;
  // FormData에 Content-Type을 직접 지정하면 boundary/charset 문제가 생길 수 있으므로 제거
  const incomingHeaders = options.headers || {};
  const sanitizedHeaders = Object.keys(incomingHeaders).reduce((acc, key) => {
    if (key.toLowerCase() === "content-type" && isFormData) return acc;
    acc[key] = incomingHeaders[key];
    return acc;
  }, {});

  const config = {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...sanitizedHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",
  };

  let response = await fetch(fullUrl, config);

  // console.log(response);

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      // alert("로그인이 필요합니다.");
      window.location.href = "#/login";
      return { ok: false, status: 401, data: null };
    }

    const newToken = getToken();
    config.headers.Authorization = `Bearer ${newToken}`;
    response = await fetch(fullUrl, config);
  }

  const json = await response.json().catch(() => null);
  console.log("📌 서버 응답:", json); // 확인용 로그
  return {
    ok: response.ok,
    status: response.status,
    data: json?.data ?? null, // 서버에서 내려준 data body
    message: json?.message ?? null, // message도 같이 반환
  };

  // 엑세스 토큰 만료시 리프레스 토큰 API 자동 호출
  async function refreshAccessToken() {
    try {
      const res = await fetch("http://localhost:8080/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      const json = await res.json();
      if (!res.ok) return false;

      console.log("토큰 재발급 성공:", json);

      // access_token으로 저장
      localStorage.setItem("access_token", json.data.accessToken);

      return true;
    } catch (err) {
      return false;
    }
  }
}
