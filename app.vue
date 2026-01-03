<!-- app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import { useTelegram } from '~/composables/useTelegram'

//const { init: initLanguage } = useLanguage()
const { isTelegram } = useTelegram()

// Initialize language IMMEDIATELY when app loads
onMounted(() => {
  //initLanguage()
  
  // If in Telegram, hide browser navigation
  if (isTelegram.value) {
    document.documentElement.style.setProperty('--tg-viewport-height', window.innerHeight + 'px')
  }
})
</script>

<style>
/* Global Telegram styles */
:root {
  --tg-viewport-height: 100vh;
}

html, body {
  height: var(--tg-viewport-height);
  overflow: hidden;
}

/* Prevent overscroll on mobile */
body {
  -webkit-overflow-scrolling: touch;
  overflow: auto;
}
</style>