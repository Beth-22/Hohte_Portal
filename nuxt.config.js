// nuxt.config.js
export default defineNuxtConfig({
  // Basic configuration
  devtools: { enabled: true },

  // CSS files
  css: ["~/assets/css/main.css"],
  router: {
    middleware: ["language"],
  },

  // App configuration
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
    },
  },

  // Runtime configuration
  runtimeConfig: {
    public: {
      // Add any public config here
    },
  },

  // Build configuration
  build: {
    // Add any build config here
  },
});
