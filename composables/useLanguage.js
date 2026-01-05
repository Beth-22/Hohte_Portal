import { ref, watch, onMounted } from "vue";

import enTranslations from "~/locales/en.json";
import amTranslations from "~/locales/am.json";

const globalLocale = ref("en");

export const useLanguage = () => {
  const locale = ref(globalLocale.value); 

  const translations = {
    en: enTranslations,
    am: amTranslations,
  };

  const t = (key, params = {}) => {
    const translationObj = translations[locale.value];
    if (!translationObj) {
      console.warn(`No translations for locale: ${locale.value}`);
      return key;
    }

    const keys = key.split(".");
    let value = translationObj;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation not found: ${key} in ${locale.value}`);
        return key;
      }
    }

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
      ` Changing language from ${globalLocale.value} to ${newLocale}`
    );

    globalLocale.value = newLocale;

    locale.value = newLocale;

    if (process.client) {
      localStorage.setItem("preferredLanguage", newLocale);

      document.documentElement.lang = newLocale;

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

      console.log(` Initializing language from localStorage: ${savedLang}`);
      setLocale(savedLang);
    }
  };

  onMounted(() => {
    if (process.client) {
      watch(globalLocale, (newLocale) => {
        if (newLocale !== locale.value) {
          console.log(` Component updating locale to: ${newLocale}`);
          locale.value = newLocale;

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
    translations, 
  };
};
