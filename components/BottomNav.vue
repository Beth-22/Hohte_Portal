<template>
  <nav class="bottom-nav">
    <div
      v-for="item in navItems"
      :key="item.id"
      class="nav-item"
      :class="{ active: activeNav === item.id }"
      @click="navigateTo(item.path)"
    >
      <div class="nav-icon" v-html="item.icon"></div>
      <span class="nav-label">{{ item.label }}</span>
      <div v-if="item.id === 'permission' && pendingRequestsCount > 0" class="notification-badge">
        {{ pendingRequestsCount }}
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import { useNavigation } from '~/composables/useNavigation'
import { useStudentData } from '~/composables/useStudentData'

const { t, locale } = useLanguage()
const { activeNav, navigateTo } = useNavigation()
const { pendingRequestsCount } = useStudentData()

const navItems = computed(() => [
  {
    id: 'home',
    path: '/home',
    label: t('nav.home'),
    icon: `<svg viewBox="0 0 24 24" fill="none">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'permission',
    path: '/permission/request',
    label: t('nav.permission'),
    icon: `<svg viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'status',
    path: '/permission/status',
    label: t('nav.status'),
    icon: `<svg viewBox="0 0 24 24" fill="none">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor"/>
    </svg>`
  }
])
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(24, 49, 97, 0.98);
  display: flex;
  justify-content: space-around;
  align-items: center;
  backdrop-filter: blur(20px);
  z-index: 1000;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding: 0 10px;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  min-height: 60px;
}

.nav-item:active {
  opacity: 0.7;
  transform: scale(0.95);
}

.nav-item.active {
  transform: translateY(-5px);
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 100%;
  height: 100%;
  transition: all 0.2s ease;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  color: #a0b3d9;
  transition: all 0.2s ease;
  text-align: center;
  line-height: 1.2;
}

.nav-item.active .nav-label {
  color: #FFC125;
  font-weight: 600;
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 25%;
  background: #ff4757;
  color: white;
  font-size: 10px;
  font-weight: 700;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(24, 49, 97, 0.98);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@media (max-width: 375px) {
  .bottom-nav {
    height: 65px;
  }
  
  .nav-label {
    font-size: 10px;
  }
  
  .notification-badge {
    width: 16px;
    height: 16px;
    font-size: 9px;
    top: 6px;
  }
}

@media (max-width: 320px) {
  .bottom-nav {
    height: 60px;
  }
  
  .nav-icon {
    width: 20px;
    height: 20px;
  }
  
  .nav-label {
    font-size: 9px;
  }
}
</style>