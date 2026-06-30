export default defineNuxtConfig({
  devtools: { enabled: true },
  css: [
    "~/assets/css/main.css",
    "@vuepic/vue-datepicker/dist/main.css"  // Add this line
  ],

  plugins: ["~/plugins/language.client.js"],

  // Add build configuration for transpilation
  build: {
    transpile: ['@vuepic/vue-datepicker']
  },

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
      
      script: [
        {
          src: "https://telegram.org/js/telegram-web-app.js",
        },
      ],
    },
  },

  routeRules: {
    "/home/**": { ssr: false },
    "/**": { ssr: false },
  },

  components: true,
});