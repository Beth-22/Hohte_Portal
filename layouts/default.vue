<template>
  <div class="app-layout" :class="{ 'amharic-text': locale === 'am' }">
    <div class="safe-area-top"></div>
    
    <main class="main-content">
      <slot />
    </main>
    
    <BottomNav v-if="showBottomNav" />
    
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
const { locale, init } = useLanguage() 
const { isLoading } = useNavigation()

onMounted(() => {
  if (process.client) {
    init()
  }
})

const showBottomNav = computed(() => {
  return route.path !== '/'
})

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