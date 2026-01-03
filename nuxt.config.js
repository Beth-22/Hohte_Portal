// nuxt.config.js
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  // Add plugins
  plugins: ["~/plugins/language.client.js"],

  app: {
    head: {
      title: "HOHTE Portal",
      meta: [
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
        },
        { charset: "utf-8" },
      ],
      // Add Telegram WebApp script
      script: [
        {
          src: "https://telegram.org/js/telegram-web-app.js",
        },
      ],
    },
  },

  // Route rules for client-side rendering
  routeRules: {
    "/home/**": { ssr: false },
    "/**": { ssr: false },
  },

  // Enable components auto-import
  components: true,
});
