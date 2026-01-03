<!-- components/ConnectAccount.vue -->
<template>
  <div class="connect-screen">
    <div class="connect-container">
      <div class="connect-header">
        <div class="connect-icon">🔗</div>
        <h2 class="connect-title">Connect Your Account</h2>
      </div>

      <div class="connect-content">
        <p class="connect-description">
          To access your student dashboard, we need to link your Telegram account with your phone number.
        </p>

        <div class="steps-container">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-text">
              <strong>Tap the button below</strong>
              <p>This will close the Mini App</p>
            </div>
          </div>

          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-text">
              <strong>Return to the Telegram chat</strong>
              <p>You'll see a 'Share Contact' button</p>
            </div>
          </div>

          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-text">
              <strong>Tap 'Share Contact'</strong>
              <p>This links your phone number securely</p>
            </div>
          </div>
        </div>

        <div class="actions">
          <button @click="closeApp" class="close-button">
            Close & Connect in Telegram
          </button>

          <button @click="retryLogin" class="retry-button" v-if="showRetry">
            Already shared contact? Try again
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTelegramAuth } from '~/composables/useTelegramAuth'

const telegramAuth = useTelegramAuth()
const showRetry = ref(false)

const closeApp = () => {
  console.log('🔗 Closing app to trigger contact sharing...');
  telegramAuth.closeMiniApp()
}

const retryLogin = async () => {
  console.log('🔄 Retrying login...');
  const result = await telegramAuth.login()
  if (result.success) {
    console.log('✅ Retry successful, emitting connected event');
    emit('connected')
  } else {
    console.log('❌ Retry failed:', result.error);
  }
}

onMounted(() => {
  console.log('🔗 ConnectAccount component mounted');
  // Show retry button after 5 seconds
  setTimeout(() => {
    showRetry.value = true
  }, 5000)
})

defineEmits(['connected'])
</script>

<style scoped>
.connect-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1e3971 0%, #0d1f40 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}

.connect-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 40px 30px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.connect-header {
  text-align: center;
  margin-bottom: 30px;
}

.connect-icon {
  font-size: 60px;
  margin-bottom: 15px;
}

.connect-title {
  font-size: 28px;
  font-weight: 800;
  color: #1e3971;
  margin: 0;
}

.connect-content {
  color: #333;
}

.connect-description {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 30px;
  text-align: center;
  color: #555;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 193, 37, 0.1);
  border-radius: 12px;
  border-left: 4px solid #FFC125;
}

.step-number {
  background: #FFC125;
  color: #1e3971;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
}

.step-text strong {
  display: block;
  font-size: 16px;
  color: #1e3971;
  margin-bottom: 5px;
  font-weight: 700;
}

.step-text p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.close-button {
  background: linear-gradient(135deg, #FFC125 0%, #ffb300 100%);
  color: #1e3971;
  border: none;
  padding: 18px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.close-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 193, 37, 0.3);
}

.retry-button {
  background: transparent;
  color: #1e3971;
  border: 2px solid #1e3971;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: rgba(30, 57, 113, 0.1);
}
</style>