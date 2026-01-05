<template>
  <div class="language-toggle-container" :class="{ 'fixed-position': fixed }">
    <div class="language-toggle" @click="toggleLanguage">
      <svg class="globe-icon" viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4.09 13H8.38C8.84 14.88 9.77 16.56 11 17.89C9.64 17.75 8.35 17.07 7.2 16.03L4.09 13ZM12 20C10.74 20 9.53 19.52 8.56 18.73C9.88 18.59 11.19 18.11 12 17.39C12.81 18.11 14.12 18.59 15.44 18.73C14.47 19.52 13.26 20 12 20ZM20 12C20 11.66 19.95 11.32 19.86 11H15.62C15.16 9.12 14.23 7.44 13 6.11C14.36 6.25 15.65 6.93 16.8 7.97L19.91 11C19.97 11.33 20 11.66 20 12ZM12 4C13.26 4 14.47 4.48 15.44 5.27C14.12 5.41 12.81 5.89 12 6.61C11.19 5.89 9.88 5.41 8.56 5.27C9.53 4.48 10.74 4 12 4ZM4.09 11L7.2 7.97C8.35 6.93 9.64 6.25 11 6.11C9.77 7.44 8.84 9.12 8.38 11H4.09Z"/>
      </svg>
      <span class="language-label">{{ locale === 'en' ? 'አማ' : 'EN' }}</span>
    </div>
  </div>
</template>

<script setup>
import { useLanguage } from '~/composables/useLanguage'

const { locale, setLocale } = useLanguage()

const props = defineProps({
  fixed: {
    type: Boolean,
    default: false
  },
  top: {
    type: String,
    default: '30px'
  },
  left: {
    type: String,
    default: '30px'
  },
  right: {
    type: String,
    default: 'auto'
  },
  position: {
    type: String,
    default: 'absolute' 
  }
})

const toggleLanguage = () => {
  const newLocale = locale.value === 'en' ? 'am' : 'en'
  setLocale(newLocale)
}
</script>

<style scoped>
.language-toggle-container {
  z-index: 1000;
}

.language-toggle-container.fixed-position {
  position: fixed;
  top: v-bind('props.top');
  left: v-bind('props.left');
  right: v-bind('props.right');
}

.language-toggle-container:not(.fixed-position) {
  position: v-bind('props.position');
  top: v-bind('props.top');
  left: v-bind('props.left');
  right: v-bind('props.right');
}

.language-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.language-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.globe-icon {
  fill: #CFCBC1FF;
  width: 18px;
  height: 18px;
}

.language-label {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  min-width: 20px;
}

/* Responsive styles */
@media (max-width: 375px) {
  .language-toggle-container:not(.fixed-position) {
    top: 50px;
    left: 15px;
  }
  
  .language-toggle-container.fixed-position {
    top: 20px;
    left: 15px;
  }
}
</style>