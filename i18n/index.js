import { createI18n } from "vue-i18n";

import enTranslations from "@/locales/en.json";
import amTranslations from "@/locales/am.json";

const i18n = createI18n({
  legacy: false,
  locale: "en", 
  fallbackLocale: "en",
  messages: {
    en: enTranslations,
    am: amTranslations,
  },
  globalInjection: true,
  allowComposition: true,
  missingWarn: false,
});

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
