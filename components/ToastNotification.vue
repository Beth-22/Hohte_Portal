<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'success', 
    validator: (value) => ['success', 'error', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 4000 // milliseconds
  }
})

const emit = defineEmits(['close'])
const isVisible = ref(true)
const progress = ref(100)


onMounted(() => {
  const interval = 50 
  const steps = props.duration / interval
  const decrement = 100 / steps
  
  const timer = setInterval(() => {
    progress.value -= decrement
    if (progress.value <= 0) {
      clearInterval(timer)
      closeToast()
    }
  }, interval)
})

const closeToast = () => {
  isVisible.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}

const getIcon = () => {
  switch (props.type) {
    case 'success':
      return '✅'
    case 'error':
      return '❌'
    case 'info':
      return 'ℹ️'
    default:
      return '💬'
  }
}

const getTypeLabel = () => {
  switch (props.type) {
    case 'success':
      return 'Success'
    case 'error':
      return 'Error'
    case 'info':
      return 'Info'
    default:
      return 'Notification'
  }
}

const getBorderColor = () => {
  switch (props.type) {
    case 'success':
      return '#10b981' 
    case 'error':
      return '#ef4444' 
    case 'info':
      return '#3b82f6' 
    default:
      return '#6b7280' 
  }
}

const getGlowColor = () => {
  switch (props.type) {
    case 'success':
      return 'rgba(16, 185, 129, 0.2)'
    case 'error':
      return 'rgba(239, 68, 68, 0.2)'
    case 'info':
      return 'rgba(59, 130, 246, 0.2)'
    default:
      return 'rgba(107, 114, 128, 0.2)'
  }
}

const getBackgroundGradient = () => {
  switch (props.type) {
    case 'success':
      return 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)'
    case 'error':
      return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)'
    case 'info':
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)'
    default:
      return 'linear-gradient(135deg, rgba(107, 114, 128, 0.15) 0%, rgba(75, 85, 99, 0.1) 100%)'
  }
}
</script>

<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0 translate-x-10"
    enter-to-class="opacity-100 translate-x-0"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-10"
  >
    <div
      v-if="isVisible"
      class="toast-notification"
      :style="{
        background: getBackgroundGradient(),
        borderColor: getBorderColor(),
        boxShadow: `0 10px 25px -5px ${getGlowColor()}, 0 0 0 1px ${getBorderColor()}`
      }"
      role="alert"
    >
      <div class="toast-content">
        <div class="toast-icon" :style="{ color: getBorderColor() }">
          {{ getIcon() }}
        </div>
        <div class="toast-text">
          <div class="toast-type" :style="{ color: getBorderColor() }">
            {{ getTypeLabel() }}
          </div>
          <div class="toast-message">
            {{ message }}
          </div>
        </div>
        <button
          @click="closeToast"
          class="toast-close"
          :style="{ color: getBorderColor() }"
          aria-label="Close notification"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div class="toast-progress-container">
        <div 
          class="toast-progress-bar" 
          :style="{
            width: `${progress}%`,
            backgroundColor: getBorderColor()
          }"
        ></div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  min-width: 320px;
  max-width: 400px;
  border: 2px solid;
  border-radius: 12px;
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-content {
  display: flex;
  align-items: flex-start;
  padding: 16px;
  gap: 12px;
}

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.toast-text {
  flex: 1;
}

.toast-type {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
  opacity: 0.9;
}

.toast-message {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.toast-close {
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
}

.toast-close:hover {
  color: white;
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.toast-progress-container {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  width: 100%;
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  transition: width 0.05s linear;
  border-radius: 0 2px 2px 0;
}

@media (max-width: 640px) {
  .toast-notification {
    left: 20px;
    right: 20px;
    max-width: none;
    top: 10px;
  }
  
  .toast-content {
    padding: 14px;
  }
}
</style>