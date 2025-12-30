// nuxt.config.js
export default defineNuxtConfig({
  // Basic configuration
  devtools: { enabled: true },

  // CSS files
  css: ["~/assets/css/main.css"],
  plugins: ['~/plugins/language.client.js'],

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
      apiBaseUrl: process.env.API_BASE_URL || "http://localhost:8000",
    },
  },

  // Build configuration
  build: {
    // Add any build config here
  },
});
