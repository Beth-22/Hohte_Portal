// plugins/language.client.js
import { useLanguage } from "~/composables/useLanguage";

export default defineNuxtPlugin((nuxtApp) => {
  // Only run on client side
  if (process.client) {
    const { init } = useLanguage();

    // Initialize language when app starts
    init();

    console.log("🌍 Language plugin initialized");
  }
});
