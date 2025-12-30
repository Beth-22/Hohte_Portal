// composables/useLanguage.js
import { ref, watch, onMounted } from "vue";

// Import your JSON translation files
import enTranslations from "~/locales/en.json";
import amTranslations from "~/locales/am.json";

// 🌟 CREATE A GLOBAL STATE (SINGLE SOURCE OF TRUTH)
const globalLocale = ref("en");

export const useLanguage = () => {
  const locale = ref(globalLocale.value); // Use global state

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
    if (newLocale === globalLocale.value) return;

    console.log(
      `🌍 Changing language from ${globalLocale.value} to ${newLocale}`
    );

    // 🌟 UPDATE GLOBAL STATE
    globalLocale.value = newLocale;

    // 🌟 UPDATE LOCAL COMPONENT STATE
    locale.value = newLocale;

    if (process.client) {
      // 🌟 PERSIST TO localStorage
      localStorage.setItem("preferredLanguage", newLocale);

      // 🌟 UPDATE HTML DOCUMENT
      document.documentElement.lang = newLocale;

      // 🌟 ADD/REMOVE Amharic text class for ALL PAGES
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

      console.log(`🌍 Initializing language from localStorage: ${savedLang}`);
      setLocale(savedLang);
    }
  };

  // 🌟 WATCH FOR GLOBAL CHANGES (when home toggle changes language)
  onMounted(() => {
    if (process.client) {
      watch(globalLocale, (newLocale) => {
        if (newLocale !== locale.value) {
          console.log(`🌍 Component updating locale to: ${newLocale}`);
          locale.value = newLocale;

          // Update document class
          if (newLocale === "am") {
            document.documentElement.classList.add("amharic-text");
          } else {
            document.documentElement.classList.remove("amharic-text");
          }
        }
      });
    }
  });

  return {
    locale,
    t,
    setLocale,
    init,
    translations, // Optional: expose translations for debugging
  };
};
