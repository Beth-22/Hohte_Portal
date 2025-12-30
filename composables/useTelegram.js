// composables/useTelegram.js
import { ref, onMounted } from "vue";
import { apiService } from "~/services/api.service";

export const useTelegram = () => {
  const webApp = ref(null);
  const isTelegram = ref(false);
  const userId = ref(null);
  const initData = ref("");
  const isAuthenticated = ref(false);

  onMounted(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      webApp.value = window.Telegram.WebApp;
      isTelegram.value = true;
      userId.value = webApp.value.initDataUnsafe?.user?.id;
      initData.value = webApp.value.initData;

      // Expand the app to full height
      webApp.value.expand();

      // Set theme colors
      setThemeColors();

      // Initialize Telegram auth
      initTelegramAuth();
    }
  });

  const setThemeColors = () => {
    if (!webApp.value) return;

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

  const initTelegramAuth = async () => {
    if (!webApp.value || !initData.value) return;

    try {
      // For Telegram Mini Apps, the initData can be used for authentication
      // You might need to send this to your backend to validate the user
      console.log("Telegram init data available:", initData.value);

      // In a real app, you would send initData to your backend for verification
      // and get a JWT token back
      // const response = await fetch('/api/auth/telegram', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ initData: initData.value })
      // });
      // const { token } = await response.json();
      // apiService.setToken(token);

      isAuthenticated.value = true;
    } catch (error) {
      console.error("Telegram auth failed:", error);
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

  // Manual authentication for development
  const setAuthToken = (token) => {
    apiService.setToken(token);
    isAuthenticated.value = true;
  };

  const logout = () => {
    apiService.clearToken();
    isAuthenticated.value = false;
  };

  return {
    webApp,
    isTelegram,
    userId,
    initData,
    isAuthenticated,
    showAlert,
    showConfirm,
    closeApp,
    setAuthToken,
    logout,
  };
};
