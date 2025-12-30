<template>
  <div class="app-layout" :class="{ 'amharic-text': locale === 'am' }">
    <!-- Safe area for notch phones -->
    <div class="safe-area-top"></div>
    
    <!-- Main content -->
    <main class="main-content">
      <slot />
    </main>
    
    <!-- Bottom Navigation (shown on all pages except splash) -->
    <BottomNav v-if="showBottomNav" />
    
    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from '#app'
import { useLanguage } from '~/composables/useLanguage'
import { useNavigation } from '~/composables/useNavigation'

const route = useRoute()
const { locale, init } = useLanguage() // Get init function
const { isLoading } = useNavigation()

// 🌟 INITIALIZE LANGUAGE ON LAYOUT MOUNT
onMounted(() => {
  if (process.client) {
    init()
  }
})

// Show bottom nav on all pages except splash
const showBottomNav = computed(() => {
  return route.path !== '/'
})

// 🌟 WATCH FOR LANGUAGE CHANGES TO UPDATE CSS CLASS
watch(locale, (newLocale) => {
  if (process.client) {
    if (newLocale === "am") {
      document.documentElement.classList.add("amharic-text");
    } else {
      document.documentElement.classList.remove("amharic-text");
    }
  }
})
</script>