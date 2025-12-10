import { createI18n } from "vue-i18n";

// Import all page translations
import enSplash from "@/locales/en/splash.json";
import enHome from "@/locales/en/home.json";
import amSplash from "@/locales/am/splash.json";
import amHome from "@/locales/am/home.json";

// You can add more pages like:
// import enSettings from "@/locales/en/settings.json";
// import amSettings from "@/locales/am/settings.json";

// Merge all messages by language
const messages = {
  en: {
    ...enSplash,
    ...enHome,
    // ...enSettings,
    // Add more pages as needed
  },
  am: {
    ...amSplash,
    ...amHome,
    // ...amSettings,
    // Add more pages as needed
  },
};

// Get saved language from localStorage or default to 'en'
const savedLang =
  typeof window !== "undefined"
    ? localStorage.getItem("preferredLanguage")
    : null;
const defaultLocale =
  savedLang && (savedLang === "en" || savedLang === "am") ? savedLang : "en";

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: "en",
  messages,
  globalInjection: true,
  allowComposition: true,
  missingWarn: false,
});

export default i18n;
