import { apiService } from "~/services/api.service";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const tenant = apiService.tenant;
    const token = localStorage.getItem(`${tenant}_auth_token`);
    const isAuthRoute = to.path === "/" || to.path === "/auth";

    // If no token, force back to splash with the current school param
    if (!token && !isAuthRoute) {
      return navigateTo(`/?school=${tenant}`);
    }

    // If logged in, don't allow access to splash/login
    if (token && isAuthRoute) {
      return navigateTo("/home");
    }
  }
});