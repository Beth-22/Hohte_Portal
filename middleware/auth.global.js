export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const token = localStorage.getItem("auth_token");
    const isAuthRoute = to.path === "/" || to.path === "/auth";

    if (!token && !isAuthRoute) {
      return navigateTo("/");
    }

    if (token && isAuthRoute) {
      return navigateTo("/home");
    }
  }
});
