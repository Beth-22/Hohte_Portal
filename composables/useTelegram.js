// composables/useTelegram.js
import { ref, onMounted } from "vue";

export const useTelegram = () => {
  const webApp = ref(null);
  const isTelegram = ref(false);
  const userId = ref(null);
  const initData = ref("");
  const initDataUnsafe = ref(null);

  onMounted(() => {
    if (typeof window !== "undefined") {
      console.log("🔍 Checking for Telegram WebApp...");
      console.log("window.Telegram exists?", !!window.Telegram);
      console.log("window.Telegram.WebApp exists?", !!window.Telegram?.WebApp);

      if (window.Telegram?.WebApp) {
        webApp.value = window.Telegram.WebApp;
        console.log("🔹 Full Telegram initData:", initData.value);
        console.log(
          "🔹 Telegram initDataUnsafe (parsed):",
          initDataUnsafe.value
        );

        isTelegram.value = true;
        userId.value = webApp.value.initDataUnsafe?.user?.id;
        initData.value = webApp.value.initData;
        initDataUnsafe.value = webApp.value.initDataUnsafe;

        // Expand the app to full height and mark ready
        try {
          webApp.value.expand();
          webApp.value.ready();
          console.log("✅ Telegram WebApp initialized and ready");
        } catch (err) {
          console.error("Failed to initialize Telegram:", err);
        }

        // Set theme colors
        setThemeColors();

        // Log user info and initData
        console.log("Telegram User ID:", userId.value);
        console.log("Telegram User:", initDataUnsafe.value?.user);
        console.log("initData available?", !!initData.value);
        console.log("initData length:", initData.value?.length);

        // 🔥 Log the actual initData string in console
        console.log("🔹 Telegram initData (full):", initData.value);
        console.log(
          "🔹 Telegram initDataUnsafe (parsed object):",
          initDataUnsafe.value
        );
      } else {
        console.log("⚠️ Not running in Telegram Mini App");
        console.log("For local testing, you can:");
        console.log("1. Run in Telegram Desktop");
        console.log("2. Use Telegram Web");
        console.log("3. Your existing token will be used if available");
      }
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

  // Get Telegram WebApp instance
  const getWebApp = () => {
    return webApp.value;
  };

  // ✅ Fixed: actually returns initData
  const getInitData = () => {
    return initData.value;
  };

  // Get initDataUnsafe for debugging
  const getInitDataUnsafe = () => {
    return initDataUnsafe.value;
  };

  return {
    webApp,
    isTelegram,
    userId,
    initData,
    initDataUnsafe,
    getWebApp,
    getInitData,
    getInitDataUnsafe,
    showAlert,
    showConfirm,
    closeApp,
  };
};
