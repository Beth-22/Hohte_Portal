import { ref, onMounted } from "vue";

export const useTelegram = () => {
  const webApp = ref(null);
  const isTelegram = ref(false);
  const userId = ref(null);
  const initData = ref("");
  const themeParams = ref({});

  onMounted(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      webApp.value = window.Telegram.WebApp;
      isTelegram.value = true;
      userId.value = webApp.value.initDataUnsafe?.user?.id;
      initData.value = webApp.value.initData;
      themeParams.value = webApp.value.themeParams;

      webApp.value.ready();

      webApp.value.expand();

      setThemeColors();

      console.log("Telegram WebApp initialized");
      console.log("User ID:", userId.value);
      console.log("Theme params:", themeParams.value);
    }
  });

  const setThemeColors = () => {
    if (!webApp.value) return;

    if (themeParams.value) {
      document.documentElement.style.setProperty(
        "--tg-bg-color",
        themeParams.value.bg_color || "#1E3971"
      );
      document.documentElement.style.setProperty(
        "--tg-text-color",
        themeParams.value.text_color || "#ffffff"
      );
      document.documentElement.style.setProperty(
        "--tg-button-color",
        themeParams.value.button_color || "#FFC125"
      );
      document.documentElement.style.setProperty(
        "--tg-button-text-color",
        themeParams.value.button_text_color || "#1E3971"
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
    themeParams,
    showAlert,
    showConfirm,
    closeApp,
  };
};
