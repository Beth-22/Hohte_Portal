<!-- app.vue -->
<template>
  <NuxtLayout>
    <!-- Loading State -->
    <div v-if="authLoading" class="auth-loading">
      <div class="spinner"></div>
      <p class="loading-text">
        {{ authMessage }}
        <br>
        <small v-if="debugInfo" class="debug-info">{{ debugInfo }}</small>
      </p>
    </div>

    <!-- Connect Account Screen -->
    <ConnectAccount 
      v-else-if="needsLinking"
      @connected="handleConnected"
    />

    <!-- Main App Content -->
    <NuxtPage v-else />
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSimpleAuth } from '~/composables/useSimpleAuth'
import ConnectAccount from '~/components/ConnectAccount.vue'

const auth = useSimpleAuth()
const authLoading = ref(true)
const needsLinking = ref(false)
const authMessage = ref("Initializing...")
const debugInfo = ref("")

const handleConnected = () => {
  console.log('🔄 Account linked, reloading...')
  window.location.reload()
}

onMounted(async () => {
  console.log('🚀 App mounted...')
  
  // Check Telegram environment
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp
    console.log('✅ Running in Telegram')
    console.log('📱 Platform:', tg.platform)
    console.log('📄 initData exists:', !!tg.initData)
    console.log('📏 initData length:', tg.initData?.length || 0)
    console.log('👤 User:', tg.initDataUnsafe?.user)
    
    debugInfo.value = `Telegram • Platform: ${tg.platform} • initData: ${tg.initData?.length || 0} chars`
  } else {
    console.log('⚠️ Not in Telegram')
    debugInfo.value = 'Browser (Not Telegram)'
  }
  
  authMessage.value = "Checking authentication..."
  
  // Initialize auth
  const result = await auth.init()
  
  console.log('🔐 Auth result:', result)
  
  if (result.needsLinking) {
    console.log('⚠️ User needs linking')
    needsLinking.value = true
    authMessage.value = "Account needs linking..."
  } else if (result.success) {
    console.log('✅ Authentication successful')
    authMessage.value = "Authentication successful!"
  } else {
    console.log('❌ Authentication failed:', result.error)
    authMessage.value = `Authentication failed: ${result.error || 'Unknown error'}`
  }
  
  // Short delay then hide loading
  setTimeout(() => {
    authLoading.value = false
  }, 500)
})
</script>

<style>
/* Keep your existing styles */
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
  padding: 20px;
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #FFC125;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-text {
  color: white;
  font-size: 18px;
  font-weight: 500;
}

.debug-info {
  color: #a0b3d9;
  font-size: 12px;
  margin-top: 10px;
  opacity: 0.8;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>