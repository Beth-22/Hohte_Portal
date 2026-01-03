// composables/useSimpleAuth.js
import { ref } from "vue";
import { apiService } from "~/services/api.service";

export const useSimpleAuth = () => {
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref(null);
  const needsLinking = ref(false);

  // DIRECT TELEGRAM LOGIN
  const telegramLogin = async () => {
    console.log("🚀 [AUTH] Starting Telegram login...");

    // Check if we're in Telegram
    if (!window.Telegram?.WebApp) {
      console.log("⚠️ [AUTH] Not in Telegram Mini App");
      error.value = "Open in Telegram to login";
      return { success: false, error: "Open in Telegram to login" };
    }

    const telegram = window.Telegram.WebApp;
    const initData = telegram.initData;

    console.log("📱 [AUTH] Telegram initData length:", initData?.length || 0);

    if (!initData || initData.length < 10) {
      console.log("❌ [AUTH] No valid initData from Telegram");
      console.log("ℹ️ [AUTH] This means either:");
      console.log("1. Running in browser (not Telegram)");
      console.log("2. Telegram permissions not granted");
      console.log("3. Mini App URL not properly configured");

      error.value = "No initData from Telegram";
      return { success: false, error: "No initData from Telegram" };
    }

    console.log("📤 [AUTH] Sending initData to YOUR backend...");
    isLoading.value = true;
    error.value = null;
    needsLinking.value = false;

    try {
      const result = await apiService.telegramLogin(initData);

      if (result.token) {
        apiService.setToken(result.token);
        isAuthenticated.value = true;
        console.log("✅ [AUTH] Login successful!");
        return { success: true, data: result };
      }

      throw new Error("No token in response");
    } catch (err) {
      console.error("❌ [AUTH] Login error:", err.message);

      if (
        err.message.includes("UNLINKED_USER") ||
        err.message.includes("404")
      ) {
        needsLinking.value = true;
        console.log("⚠️ [AUTH] User needs linking");
        return { success: false, needsLinking: true };
      }

      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  // CHECK EXISTING TOKEN
  const checkExistingAuth = async () => {
    const token = apiService.getToken();
    if (!token) {
      console.log("🔍 [AUTH] No token found");
      return false;
    }

    console.log("🔍 [AUTH] Found token, checking validity...");
    try {
      // Test token by making a simple request
      const response = await fetch(
        `${apiService.baseURL}/api/v1/student/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("✅ [AUTH] Token is valid!");
        isAuthenticated.value = true;
        return true;
      } else {
        console.log("⚠️ [AUTH] Token invalid");
        apiService.clearToken();
        return false;
      }
    } catch (err) {
      console.error("❌ [AUTH] Token check failed:", err);
      apiService.clearToken();
      return false;
    }
  };

  // INITIALIZE AUTH
  const init = async () => {
    console.log("🔐 [AUTH] Initializing...");

    // First check existing token
    const hasValidToken = await checkExistingAuth();
    if (hasValidToken) {
      console.log("✅ [AUTH] Using existing token");
      return { success: true, fromStorage: true };
    }

    // Try Telegram login
    console.log("🔄 [AUTH] Trying Telegram login...");
    const result = await telegramLogin();
    return result;
  };

  const logout = () => {
    console.log("👋 [AUTH] Logging out...");
    apiService.clearToken();
    isAuthenticated.value = false;
    needsLinking.value = false;
    error.value = null;
  };

  return {
    isAuthenticated,
    isLoading,
    error,
    needsLinking,
    init,
    telegramLogin,
    logout,
  };
};
