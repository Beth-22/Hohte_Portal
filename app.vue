<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTelegram } from '~/composables/useTelegram'
import { useSchool } from '~/composables/useSchool'

const { isTelegram } = useTelegram()
const { initializeSchool, isInitialized, schoolError } = useSchool()

onMounted(() => {
  // Initialize school configuration
  initializeSchool()
  
  if (isTelegram.value) {
    document.documentElement.style.setProperty('--tg-viewport-height', window.innerHeight + 'px')
  }
  
  // Handle invalid school parameter
  if (schoolError.value) {
    console.error('School initialization error:', schoolError.value)
  }
})
</script>

<style>
:root {
  --tg-viewport-height: 100vh;
}

html, body {
  height: var(--tg-viewport-height);
  overflow: hidden;
  margin: 0;
  padding: 0;
}

body {
  -webkit-overflow-scrolling: touch;
  overflow: auto;
  background: #1e3971;
}

body {
  background-color: var(--tg-bg-color, #1e3971);
  color: var(--tg-text-color, #ffffff);
}

.tg-button {
  background-color: var(--tg-button-color, #FFC125);
  color: var(--tg-button-text-color, #1e3971);
}
</style>