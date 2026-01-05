import { ref, watch } from "vue";
import { useRoute } from "#app";

export const useNavigation = () => {
  const route = useRoute();

  const activeNav = ref("home");
  const isLoading = ref(false);
  const fromRoute = ref("");

  const updateActiveNav = () => {
    const path = route?.path || "";

    if (path === "/" || path === "/home") {
      activeNav.value = "home";
    } else if (path.startsWith("/courses")) {
      activeNav.value = "courses";
    } else if (path === "/permission/request") {
      activeNav.value = "permission";
    } else if (path === "/permission/status") {
      activeNav.value = "status";
    } else if (path === "/messages") {
      activeNav.value = "messages";
    } else if (path === "/alerts") {
      activeNav.value = "alerts";
    } else {
      activeNav.value = "home";
    }
  };

  watch(
    () => route?.path,
    (newPath, oldPath) => {
      fromRoute.value = oldPath || "";
      updateActiveNav();
    },
    { immediate: true }
  );

  const navigateTo = (path) => {
    if (!path) return;

    isLoading.value = true;

    const router = useRouter();
    router.push(path);

    setTimeout(() => {
      isLoading.value = false;
    }, 300);
  };

  const goBack = () => {
    const router = useRouter();
    router.back();
  };

  const goToHome = () => navigateTo("/home");
  const goToCourses = () => navigateTo("/courses");
  const goToCourseDetail = (courseId) => navigateTo(`/courses/${courseId}`);
  const goToPermissionRequest = () => navigateTo("/permission/request");
  const goToPermissionStatus = () => navigateTo("/permission/status");
  const goToMessages = () => navigateTo("/messages");
  const goToAlerts = () => navigateTo("/alerts");

  return {
    activeNav,
    isLoading,
    fromRoute,
    navigateTo,
    goBack,
    goToHome,
    goToCourses,
    goToCourseDetail,
    goToPermissionRequest,
    goToPermissionStatus,
    goToMessages,
    goToAlerts,
    updateActiveNav,
  };
};
