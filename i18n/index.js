// i18n/index.js
import { createI18n } from "vue-i18n";

// Import JSON files directly
import enTranslations from "@/locales/en.json";
import amTranslations from "@/locales/am.json";

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: "en", // Default - will be overridden by localStorage
  fallbackLocale: "en",
  messages: {
    en: enTranslations,
    am: amTranslations,
  },
  globalInjection: true,
  allowComposition: true,
  missingWarn: false,
});

// Initialize locale from localStorage
export const initI18n = () => {
  if (process.client) {
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang && ["en", "am"].includes(savedLang)) {
      i18n.global.locale.value = savedLang;
      document.documentElement.lang = savedLang;

      if (savedLang === "am") {
        document.documentElement.classList.add("amharic-text");
      } else {
        document.documentElement.classList.remove("amharic-text");
      }
    }
  }
};

export default i18n;
