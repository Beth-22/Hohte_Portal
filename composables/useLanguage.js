// composables/useLanguage.js
import { ref } from "vue";

// Import your JSON translation files
import enTranslations from "~/locales/en.json";
import amTranslations from "~/locales/am.json";

export const useLanguage = () => {
  const locale = ref("en");

  // Translations from your JSON files
  const translations = {
    en: enTranslations,
    am: amTranslations,
  };

  // SYNCHRONOUS translation function
  const t = (key, params = {}) => {
    // Get the translation object for current language
    const translationObj = translations[locale.value];
    if (!translationObj) {
      console.warn(`No translations for locale: ${locale.value}`);
      return key;
    }

    // Split the key by dots to navigate the object
    const keys = key.split(".");
    let value = translationObj;

    // Navigate through the object to find the translation
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation not found: ${key} in ${locale.value}`);
        return key;
      }
    }

    // Replace parameters in translation string
    if (typeof value === "string" && params) {
      Object.keys(params).forEach((param) => {
        value = value.replace(`{${param}}`, params[param]);
      });
    }

    return value || key;
  };

  const setLocale = (newLocale) => {
    if (newLocale === locale.value) return;

    locale.value = newLocale;

    if (process.client) {
      localStorage.setItem("preferredLanguage", newLocale);
      document.documentElement.lang = newLocale;

      // Add/remove Amharic text class
      if (newLocale === "am") {
        document.documentElement.classList.add("amharic-text");
      } else {
        document.documentElement.classList.remove("amharic-text");
      }
    }
  };

  const init = () => {
    if (process.client) {
      let savedLang = localStorage.getItem("preferredLanguage");

      if (!["en", "am"].includes(savedLang)) {
        savedLang = "en";
      }

      setLocale(savedLang);
    }
  };

  return {
    locale,
    t,
    setLocale,
    init,
    translations, // Optional: expose translations for debugging
  };
};
