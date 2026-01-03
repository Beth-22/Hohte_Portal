// composables/useTelegramAuth.js
import { ref, computed } from "vue";
import { apiService } from "~/services/api.service";
import { useTelegram } from "~/composables/useTelegram";

export const useTelegramAuth = () => {
  const isAuthenticated = ref(false);
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref(null);
  const needsLinking = ref(false);

  const telegram = useTelegram();

  const isInTelegram = computed(() => {
    return telegram.isTelegram.value;
  });

  const getTelegramWebApp = () => {
    return telegram.getWebApp();
  };

  const getInitData = () => {
    return telegram.getInitData();
  };

  const login = async () => {
    if (!isInTelegram.value) {
      console.log("⚠️ Cannot login: Not in Telegram environment");
      return { success: false, error: "Not in Telegram environment" };
    }

    isLoading.value = true;
    error.value = null;
    needsLinking.value = false;

    try {
      const initData = getInitData();

      if (!initData) {
        throw new Error("Telegram initData not available");
      }

      console.log("🔐 Attempting Telegram login...");
      const response = await apiService.telegramLogin(initData);

      if (response.token) {
        apiService.setToken(response.token);
        isAuthenticated.value = true;
        needsLinking.value = false;

        console.log("✅ Login successful");
        return { success: true, data: response };
      }

      throw new Error("No token in response");
    } catch (err) {
      console.error("Login error:", err.message);

      if (
        err.message.includes("UNLINKED_USER") ||
        err.message.includes("404") ||
        err.message.includes("needs linking")
      ) {
        needsLinking.value = true;
        console.log("⚠️ User needs linking");
        return {
          success: false,
          needsLinking: true,
          error: "Account not linked. Please share contact in bot chat.",
        };
      }

      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  const initAuth = async () => {
    if (isInitialized.value)
      return {
        isAuthenticated: isAuthenticated.value,
        needsLinking: needsLinking.value,
      };

    console.log("🔐 Initializing authentication...");

    if (!isInTelegram.value) {
      console.log(
        "⚠️ Running outside Telegram - using stored token if available"
      );

      if (apiService.isAuthenticated()) {
        isAuthenticated.value = true;
        isInitialized.value = true;
        return { isAuthenticated: true, needsLinking: false };
      }

      isInitialized.value = true;
      return { isAuthenticated: false, needsLinking: false };
    }

    if (apiService.isAuthenticated()) {
      try {
        console.log("🔄 Verifying existing token...");
        await apiService.getProfile();
        isAuthenticated.value = true;
        isInitialized.value = true;
        console.log("✅ Token is valid");
        return { isAuthenticated: true, needsLinking: false };
      } catch (err) {
        console.log("⚠️ Token invalid, clearing...");
        apiService.clearToken();
      }
    }

    const result = await login();

    if (result.success) {
      isAuthenticated.value = true;
    }

    isInitialized.value = true;
    return result;
  };

  const logout = () => {
    apiService.clearToken();
    isAuthenticated.value = false;
    needsLinking.value = false;
    error.value = null;

    console.log("👋 User logged out");
  };

  const closeMiniApp = () => {
    telegram.closeApp();
  };

  const requiresLinking = computed(() => {
    return needsLinking.value && isInTelegram.value;
  });

  const getAuthStatus = () => {
    return {
      isAuthenticated: isAuthenticated.value,
      isLoading: isLoading.value,
      needsLinking: needsLinking.value,
      error: error.value,
      isInTelegram: isInTelegram.value,
      token: apiService.getToken(),
    };
  };

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    needsLinking: computed(() => needsLinking.value),
    isInTelegram: computed(() => isInTelegram.value),
    requiresLinking,
    getAuthStatus,

    initAuth,
    login,
    logout,
    closeMiniApp,
    getTelegramWebApp,
  };
};
