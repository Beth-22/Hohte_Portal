// composables/useLanguage.js
import { ref, computed } from "vue";
import enTranslations from "~/locales/en.json";
import amTranslations from "~/locales/am.json";

/**
 * 🔥 SHARED (SINGLETON) STATE
 * This lives OUTSIDE the function so every component
 * uses the SAME locale ref.
 */
const locale = ref(
  process.client ? localStorage.getItem("preferredLanguage") || "en" : "en"
);

const translations = {
  en: enTranslations,
  am: amTranslations,
};

const currentTranslations = computed(() => {
  return translations[locale.value] || translations.en;
});

const t = (key, params = {}) => {
  const keys = key.split(".");
  let value = currentTranslations.value;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }

  if (typeof value === "string") {
    Object.entries(params).forEach(([k, v]) => {
      value = value.replace(`{${k}}`, v);
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

    document.documentElement.classList.toggle(
      "amharic-text",
      newLocale === "am"
    );
  }
};

export const useLanguage = () => {
  return {
    locale,
    t,
    setLocale,
  };
};
