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
import { computed } from 'vue'
import { useRoute } from '#app'
import { useLanguage } from '~/composables/useLanguage'
import { useNavigation } from '~/composables/useNavigation'

const route = useRoute()
const { locale } = useLanguage() // Get locale from useLanguage
const { isLoading } = useNavigation()

// Show bottom nav on all pages except splash
const showBottomNav = computed(() => {
  return route.path !== '/'
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #1E3971;
  position: relative;
}

.safe-area-top {
  height: env(safe-area-inset-top);
  background: transparent;
}

.main-content {
  min-height: calc(100vh - 70px - env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 57, 113, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}
</style>