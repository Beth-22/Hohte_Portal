// services/translation.service.js
import { ref } from "vue";

export class TranslationService {
  constructor() {
    this.translations = ref({});
    this.locale = ref("en");
    this.baseUrl = process.env.API_URL || "https://your-api.com/api";
  }

  async fetchTranslations(locale) {
    try {
      // Fetch from API
      const response = await fetch(`${this.baseUrl}/translations/${locale}`);
      if (!response.ok) throw new Error("Failed to fetch translations");

      const data = await response.json();
      this.translations.value[locale] = data;
      this.locale.value = locale;

      // Save to localStorage for offline use
      if (process.client) {
        localStorage.setItem(`translations_${locale}`, JSON.stringify(data));
        localStorage.setItem("preferredLanguage", locale);
      }

      return data;
    } catch (error) {
      console.error("Error fetching translations:", error);

      // Fallback to localStorage cached translations
      if (process.client) {
        const cached = localStorage.getItem(`translations_${locale}`);
        if (cached) {
          this.translations.value[locale] = JSON.parse(cached);
          this.locale.value = locale;
          return this.translations.value[locale];
        }
      }

      // Fallback to hardcoded basic translations
      return this.getFallbackTranslations(locale);
    }
  }

  getFallbackTranslations(locale) {
    const basicTranslations = {
      en: {
        splash: {
          appName: "HOHTE Portal",
          selectLanguage: "Select Language",
          english: "English",
          amharic: "Amharic",
          continue: "Continue",
        },
        home: {
          welcome: "Welcome,",
          pendingRequests: "Pending Permission Requests",
          myCourses: "My Courses and Classes",
        },
      },
      am: {
        splash: {
          appName: "ሆህተ መታገሻ",
          selectLanguage: "ቋንቋ ይምረጡ",
          english: "እንግሊዘኛ",
          amharic: "አማርኛ",
          continue: "ቀጥል",
        },
        home: {
          welcome: "እንኳን ደህና መጡ,",
          pendingRequests: "የፈቃድ ጥያቄዎች በመጠባበቅ ላይ",
          myCourses: "ኮርሶቼ እና ክፍሎቼ",
        },
      },
    };

    return basicTranslations[locale] || basicTranslations.en;
  }

  t(key, params = {}) {
    const keys = key.split(".");
    let value = this.translations.value[this.locale.value];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation not found: ${key}`);
        return key;
      }
    }

    if (typeof value === "string" && params) {
      Object.keys(params).forEach((param) => {
        value = value.replace(`{${param}}`, params[param]);
      });
    }

    return value || key;
  }

  setLocale(locale) {
    this.locale.value = locale;
    if (process.client) {
      localStorage.setItem("preferredLanguage", locale);
      document.documentElement.lang = locale;

      if (locale === "am") {
        document.documentElement.classList.add("amharic-text");
      } else {
        document.documentElement.classList.remove("amharic-text");
      }
    }
  }
}

export const translationService = new TranslationService();
