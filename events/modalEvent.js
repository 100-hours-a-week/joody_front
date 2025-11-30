export function setupModalEvents() {
  const cancelBtns = document.querySelectorAll(".cancel_button");

  cancelBtns.forEach((btn) =>
    btn.addEventListener("click", () => closeModals())
  );
}

function closeModals() {
  document.getElementById("post_modal_overlay").classList.add("hidden");
  document.getElementById("comment_modal_overlay").classList.add("hidden");
}
