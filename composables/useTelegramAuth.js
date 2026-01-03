// composables/useTelegramAuth.js
import { ref, computed, watch } from "vue";
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

  const getInitDataUnsafe = () => {
    return telegram.getInitDataUnsafe();
  };

  const login = async () => {
    console.log("🔐 [LOGIN] Starting login process...");
    console.log("🔐 [LOGIN] Is in Telegram?", isInTelegram.value);

    if (!isInTelegram.value) {
      console.log("⚠️ [LOGIN] Cannot login: Not in Telegram environment");

      // If not in Telegram but we have a stored token, use it
      if (apiService.isAuthenticated()) {
        console.log("🔐 [LOGIN] Using stored token outside Telegram");
        isAuthenticated.value = true;
        return { success: true, fromStorage: true };
      }

      return { success: false, error: "Not in Telegram environment" };
    }

    isLoading.value = true;
    error.value = null;
    needsLinking.value = false;

    try {
      const initData = getInitData();
      const unsafeData = getInitDataUnsafe();

      console.log("🔐 [LOGIN] Got initData?", !!initData);
      console.log(
        "🔐 [LOGIN] initData first 100 chars:",
        initData?.substring(0, 100)
      );
      console.log("🔐 [LOGIN] User from initDataUnsafe:", unsafeData?.user);

      if (!initData) {
        throw new Error("Telegram initData not available");
      }

      console.log("🔐 [LOGIN] Sending login request to backend...");
      const response = await apiService.telegramLogin(initData);

      // Successful login
      if (response.token) {
        apiService.setToken(response.token);
        isAuthenticated.value = true;
        needsLinking.value = false;

        console.log("✅ [LOGIN] Login successful, token stored");
        return { success: true, data: response };
      }

      throw new Error("No token in response");
    } catch (err) {
      console.error("❌ [LOGIN] Error:", err.message);

      // Handle unlinked user error
      if (
        err.message.includes("UNLINKED_USER") ||
        err.message.includes("404") ||
        err.message.includes("needs linking")
      ) {
        needsLinking.value = true;
        console.log("⚠️ [LOGIN] User needs linking");
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
    console.log("🔐 [INIT AUTH] Starting authentication initialization...");

    if (isInitialized.value) {
      console.log("🔐 [INIT AUTH] Already initialized");
      return {
        isAuthenticated: isAuthenticated.value,
        needsLinking: needsLinking.value,
      };
    }

    console.log("🔐 [INIT AUTH] Checking environment...");
    console.log("🔐 [INIT AUTH] Is in Telegram?", isInTelegram.value);

    // If we're not in Telegram, just check stored token
    if (!isInTelegram.value) {
      console.log("⚠️ [INIT AUTH] Running outside Telegram");

      if (apiService.isAuthenticated()) {
        console.log("✅ [INIT AUTH] Using stored token from localStorage");
        isAuthenticated.value = true;
        isInitialized.value = true;
        return { isAuthenticated: true, needsLinking: false };
      }

      console.log("⚠️ [INIT AUTH] No stored token found");
      isInitialized.value = true;
      return { isAuthenticated: false, needsLinking: false };
    }

    // We're in Telegram environment
    console.log("✅ [INIT AUTH] Running in Telegram Mini App");

    // If we have a token, verify it's still valid
    if (apiService.isAuthenticated()) {
      try {
        console.log("🔄 [INIT AUTH] Verifying existing token...");
        await apiService.getProfile(); // This will throw if token is invalid
        isAuthenticated.value = true;
        isInitialized.value = true;
        console.log("✅ [INIT AUTH] Token is valid");
        return { isAuthenticated: true, needsLinking: false };
      } catch (err) {
        console.log("⚠️ [INIT AUTH] Token invalid:", err.message);
        console.log("⚠️ [INIT AUTH] Clearing token and trying fresh login...");
        apiService.clearToken();
        // Continue to login flow
      }
    }

    // Perform fresh login
    console.log("🔐 [INIT AUTH] No valid token, performing fresh login...");
    const result = await login();

    if (result.success) {
      isAuthenticated.value = true;
      console.log("✅ [INIT AUTH] Authentication successful");
    } else {
      console.log("❌ [INIT AUTH] Authentication failed:", result.error);
    }

    isInitialized.value = true;
    return result;
  };

  const logout = () => {
    console.log("👋 [LOGOUT] Logging out...");
    apiService.clearToken();
    isAuthenticated.value = false;
    needsLinking.value = false;
    error.value = null;
    isInitialized.value = false; // Allow re-initialization
  };

  const closeMiniApp = () => {
    console.log("📱 [CLOSE] Closing Mini App...");
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
      userId: telegram.userId.value,
    };
  };

  // Watch for token changes in localStorage (for debugging)
  if (process.client) {
    window.addEventListener("storage", (event) => {
      if (event.key === "auth_token") {
        console.log(
          "🔍 [STORAGE] Token changed in localStorage:",
          event.newValue?.substring(0, 20) + "..."
        );
        if (!event.newValue) {
          isAuthenticated.value = false;
        }
      }
    });
  }

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
