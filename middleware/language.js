// middleware/language.js
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang && ["en", "am"].includes(savedLang)) {
      // Set document language
      document.documentElement.lang = savedLang;

      // Add/remove Amharic text class
      if (savedLang === "am") {
        document.documentElement.classList.add("amharic-text");
      } else {
        document.documentElement.classList.remove("amharic-text");
      }
    }
  }
});
