import { setState } from "../vdom/Store.js";
import { apiRequest } from "./authApi.js";

export async function loadUserProfile() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const { ok, data } = await apiRequest(`/users/${userId}/profile`);
  if (!ok) return;

  const imgUrl = data.data.profileImage;

  const finalUrl = imgUrl
    ? imgUrl.startsWith("http")
      ? imgUrl
      : `http://localhost:8080${imgUrl}`
    : "./assets/img/original_profile.png";

  setState({ profileImage: finalUrl });
}
