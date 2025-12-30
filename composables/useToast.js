// composables/useToast.js
import { ref } from "vue";

export const useToast = () => {
  const toasts = ref([]);
  let toastId = 0;

  const showToast = (message, type = "success", duration = 4000) => {
    const id = ++toastId;
    const toast = {
      id,
      message,
      type,
      duration,
    };

    toasts.value.push(toast);

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message, duration = 4000) => {
    return showToast(message, "success", duration);
  };

  const error = (message, duration = 5000) => {
    return showToast(message, "error", duration);
  };

  const info = (message, duration = 4000) => {
    return showToast(message, "info", duration);
  };

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
  };
};
