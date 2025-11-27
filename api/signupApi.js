export async function signupApi(userData, avatarFile) {
  const formData = new FormData();
  formData.append(
    "user",
    new Blob([JSON.stringify(userData)], { type: "application/json" })
  );
  formData.append("profile_image", avatarFile);

  return await fetch("http://localhost:8080/users/signup", {
    method: "POST",
    body: formData,
  }).then((res) => res.json());
}
