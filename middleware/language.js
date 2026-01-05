export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang && ["en", "am"].includes(savedLang)) {
      document.documentElement.lang = savedLang;

      if (savedLang === "am") {
        document.documentElement.classList.add("amharic-text");
      } else {
        document.documentElement.classList.remove("amharic-text");
      }
    }
  }
});
