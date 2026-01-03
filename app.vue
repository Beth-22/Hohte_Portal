<!-- app.vue -->
<template>
  <NuxtLayout>
    <!-- Authentication Loading State -->
    <div v-if="authLoading" class="auth-loading">
      <div class="auth-spinner"></div>
      <p class="auth-loading-text">Connecting to your account...</p>
    </div>

    <!-- Connect Account Screen -->
    <ConnectAccount 
      v-else-if="requiresLinking"
      @connected="handleConnected"
    />

    <!-- Main App Content -->
    <NuxtPage v-else />
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useTelegramAuth } from '~/composables/useTelegramAuth'
import ConnectAccount from '~/components/ConnectAccount.vue'

const telegramAuth = useTelegramAuth()

const authLoading = ref(true)
const requiresLinking = ref(false)

const handleConnected = () => {
  console.log('🔄 ConnectAccount emitted connected event');
  requiresLinking.value = false
  // Reload the page to restart the auth flow
  window.location.reload()
}

onMounted(async () => {
  console.log('🚀 App mounted, initializing auth...')
  
  // Initialize authentication
  const result = await telegramAuth.initAuth()
  
  console.log('🔐 Auth initialization result:', result);
  
  if (result.needsLinking) {
    console.log('⚠️ User needs linking, showing ConnectAccount screen');
    requiresLinking.value = true
  } else if (result.isAuthenticated) {
    console.log('✅ User is authenticated, showing main app');
  } else {
    console.log('❌ User is not authenticated');
  }
  
  authLoading.value = false
  
  // If in Telegram, hide browser navigation
  if (telegramAuth.isInTelegram) {
    document.documentElement.style.setProperty('--tg-viewport-height', window.innerHeight + 'px')
  }
})

// Watch for authentication changes (for debugging)
watch(() => telegramAuth.getAuthStatus(), (status) => {
  console.log('🔍 Auth status changed:', status);
}, { deep: true });
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

/* Authentication loading styles */
.auth-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e3971 0%, #0d1f40 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.auth-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #FFC125;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.auth-loading-text {
  color: white;
  font-size: 18px;
  font-weight: 500;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>