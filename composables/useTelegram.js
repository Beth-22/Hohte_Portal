// composables/useTelegram.js
import { ref, onMounted } from "vue";

export const useTelegram = () => {
  const webApp = ref(null);
  const isTelegram = ref(false);
  const userId = ref(null);
  const initData = ref("");

  onMounted(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      webApp.value = window.Telegram.WebApp;
      isTelegram.value = true;
      userId.value = webApp.value.initDataUnsafe?.user?.id;
      initData.value = webApp.value.initData;

      // Expand the app to full height
      webApp.value.expand();

      // Disable swipe down to close (optional)
      // webApp.value.disableVerticalSwipes()

      // Set theme colors
      setThemeColors();
    }
  });

  const setThemeColors = () => {
    if (!webApp.value) return;

    // Get Telegram theme colors
    const themeParams = webApp.value.themeParams;
    if (themeParams) {
      document.documentElement.style.setProperty(
        "--tg-bg-color",
        themeParams.bg_color || "#1E3971"
      );
      document.documentElement.style.setProperty(
        "--tg-text-color",
        themeParams.text_color || "#ffffff"
      );
      document.documentElement.style.setProperty(
        "--tg-button-color",
        themeParams.button_color || "#FFC125"
      );
      document.documentElement.style.setProperty(
        "--tg-button-text-color",
        themeParams.button_text_color || "#1E3971"
      );
    }
  };

  const showAlert = (message) => {
    if (webApp.value) {
      webApp.value.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message) => {
    if (webApp.value) {
      return new Promise((resolve) => {
        webApp.value.showConfirm(message, (confirmed) => {
          resolve(confirmed);
        });
      });
    } else {
      return Promise.resolve(confirm(message));
    }
  };

  const closeApp = () => {
    if (webApp.value) {
      webApp.value.close();
    }
  };

  return {
    webApp,
    isTelegram,
    userId,
    initData,
    showAlert,
    showConfirm,
    closeApp,
  };
};
