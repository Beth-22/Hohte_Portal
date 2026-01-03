// middleware/auth.global.js
export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client) {
    const token = localStorage.getItem("auth_token");
    const isAuthRoute = to.path === "/" || to.path === "/auth";

    // If no token and not on auth route, redirect to splash
    if (!token && !isAuthRoute) {
      return navigateTo("/");
    }

    // If has token and on auth route, redirect to home
    if (token && isAuthRoute) {
      return navigateTo("/home");
    }
  }
});
