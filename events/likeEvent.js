import { toggleLike } from "../api/likeApi.js";
import { formatNumber } from "../utils/common.js";

export function setupLikeEvents(postId) {
  const btn = document.getElementById("like_stat");
  const icon = document.getElementById("like_icon");

  btn.addEventListener("click", async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return alert("로그인이 필요합니다.");

    const { ok, data } = await toggleLike(postId, userId);
    if (!ok || !data) return;

    const liked = data.data.liked;
    const count = data.data.like_count;

    icon.src = liked
      ? "../assets/img/like_on.svg"
      : "../assets/img/like_off.svg";
    document.getElementById("like_count").textContent = formatNumber(count);
  });
}
