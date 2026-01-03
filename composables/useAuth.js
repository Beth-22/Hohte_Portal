// composables/useAuth.js
import { ref, onMounted } from "vue";
import { useRouter } from "#app";
import { apiService } from "~/services/api.service";

export const useAuth = () => {
  const router = useRouter();
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const authError = ref(null);

  const checkAuth = () => {
    return !!apiService.token;
  };

  const loginWithTelegram = async (initData) => {
    try {
      isLoading.value = true;
      authError.value = null;

      console.log("🔐 Attempting Telegram login with initData...");
      console.log(
        "initData:",
        initData ? initData.substring(0, 100) + "..." : "empty"
      );

      const response = await apiService.telegramLogin(initData);
      console.log("Login response:", response);

      if (response && response.token) {
        apiService.setToken(response.token);
        isAuthenticated.value = true;
        console.log("✅ Login successful");
        return { success: true, data: response };
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      authError.value = error.message;

      // Handle 404/401 specifically
      if (error.message.includes("404") || error.message.includes("401")) {
        return {
          success: false,
          unlinked: true,
          error: "User not linked. Please share contact in Telegram bot.",
        };
      }

      return { success: false, error: error.message };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    apiService.clearToken();
    isAuthenticated.value = false;
    router.push("/");
  };

  onMounted(() => {
    isAuthenticated.value = checkAuth();
    console.log("Auth initialized, authenticated:", isAuthenticated.value);
  });

  return {
    isAuthenticated,
    isLoading,
    authError,
    checkAuth,
    loginWithTelegram,
    logout,
  };
};
