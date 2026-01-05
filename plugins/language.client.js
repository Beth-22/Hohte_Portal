import { useLanguage } from "~/composables/useLanguage";

export default defineNuxtPlugin((nuxtApp) => {
  if (process.client) {
    const { init } = useLanguage();

    init();

    console.log(" Language plugin initialized");
  }
});
