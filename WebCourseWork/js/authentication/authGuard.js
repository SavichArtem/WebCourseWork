document.addEventListener("DOMContentLoaded", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (
    isLoggedIn &&
    (window.location.pathname.endsWith("login.html") ||
      window.location.pathname.endsWith("registration.html"))
  ) {
    window.location.href = "main.html";
  }
});
