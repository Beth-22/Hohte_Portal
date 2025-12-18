<template>
  <div class="splash-container" :key="forceUpdateKey">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p class="loading-text">{{ t('common.loading') }}</p>
    </div>

    <!-- Splash Content -->
    <div v-else class="splash-content">
      <!-- Language Toggle in Top Right for Index Page -->
    

      <!-- Header -->
      <div class="splash-header">
        <!-- Logo -->
        <div class="logo-container">
          <div class="logo-wrapper">
            <img
              src="~/assets/images/logo2-modified.png"
              alt="HOHTE Logo"
              class="logo-image"
              @error="handleImageError"
            />
          </div>
        </div>

        <div class="app-title-section">
          <h1 class="app-title-main">HOHTE STUDENT</h1>
          <h2 class="app-title-sub">PORTAL</h2>
        </div>

        <p class="version-text">v1.0.0</p>
      </div>

      <!-- Language Selection -->
      <div class="language-section">
        <div class="language-header">
          <h3 class="language-title">{{ t('splash.selectLanguage') }}</h3>
          <p class="language-subtitle">{{ t('splash.chooseLanguage') }}</p>
        </div>

        <div class="language-options">
          <!-- English -->
          <button
            class="language-option"
            :class="{ selected: selectedLanguage === 'en' }"
            @click="selectLanguage('en')"
          >
            <div class="option-content">
              <div class="option-text">
                <h4>{{ t('splash.english') }}</h4>
                <p>English</p>
              </div>
            </div>
            <div v-if="selectedLanguage === 'en'" class="option-check">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="#FFC125" />
                <path
                  d="M7 12L10 15L17 9"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </button>

          <!-- Amharic -->
          <button
            class="language-option ethiopic"
            :class="{ selected: selectedLanguage === 'am' }"
            @click="selectLanguage('am')"
          >
            <div class="option-content">
              <div class="option-text">
                <h4>{{ t('splash.amharic') }}</h4>
                <p>አማርኛ</p>
              </div>
            </div>
            <div v-if="selectedLanguage === 'am'" class="option-check">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="#FFC125" />
                <path
                  d="M7 12L10 15L17 9"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="action-section">
        <button
          class="continue-button"
          @click="continueToApp"
          :disabled="!selectedLanguage"
          :class="{ enabled: selectedLanguage }"
        >
          {{ t('splash.continue') }}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4.16663 10H15.8333" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M10 4.16666L15.8333 10L10 15.8333" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "#app";
import { useLanguage } from "~/composables/useLanguage";
import LanguageToggle from '~/components/LanguageToggle.vue'

const router = useRouter();
const { t, setLocale, locale, updateTrigger } = useLanguage();

const loading = ref(true);
const selectedLanguage = ref(locale.value);
const imageError = ref(false);
const forceUpdateKey = ref(0);

const handleImageError = () => {
  imageError.value = true;
};

// Watch for language changes to force re-render
watch(locale, (newLocale, oldLocale) => {
  console.log('Language changed from', oldLocale, 'to', newLocale, 'in index.vue');
  forceUpdateKey.value += 1;
  
  // Update the selected language to match the current locale
  selectedLanguage.value = newLocale;
});

// Also watch updateTrigger for extra safety
watch(updateTrigger, () => {
  console.log('Update trigger changed in index.vue, forcing re-render');
  forceUpdateKey.value += 1;
});

onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 1500);
  
  console.log('Index page mounted with locale:', locale.value);
  
  // Force initial render
  forceUpdateKey.value += 1;
});

const selectLanguage = (lang) => {
  selectedLanguage.value = lang;
  setLocale(lang);
  
  // Force immediate re-render
  forceUpdateKey.value += 1;
};

const continueToApp = () => {
  if (selectedLanguage.value) {
    router.push("/home");
  }
};
</script>

<style scoped>
.splash-container {
  min-height: 100vh;
  background: #1e3971;
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  touch-action: manipulation;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  border-top-color: #FFC125;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.splash-content {
  flex: 1;
  padding: 40px 24px 24px;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

.splash-header {
  text-align: center;
  margin-bottom: 32px;
  margin-top: 40px; /* Space for language toggle */
}

.logo-container {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.logo-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  background: transparent;
}

.app-title-section {
  margin-top: 8px;
}

.app-title-main {
  font-size: 32px;
  font-weight: 800;
  color: #FFC125;
  margin: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.app-title-sub {
  font-size: 32px;
  font-weight: 800;
  color: #FFC125;
  margin: 4px 0 0;
  letter-spacing: 3px;
}

.version-text {
  font-size: 11px;
  color: #f5f7f8;
  margin-top: 10px;
  opacity: 0.7;
}

.language-section {
  margin-top: 32px;
  margin-bottom: 40px;
}

.language-header {
  text-align: center;
  margin-bottom: 20px;
}

.language-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.language-subtitle {
  font-size: 14px;
  color: #c8d0d9;
  margin: 0;
  font-weight: 500;
}

.language-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.language-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  background: #2b4b8f;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.language-option:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.language-option.selected {
  border-color: #FFC125;
  background: rgba(255, 193, 37, 0.1);
}

.option-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.option-text h4 {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 2px;
}

.option-text p {
  font-size: 13px;
  color: #a0b3d9;
  margin: 0;
  font-weight: 500;
}

.option-check {
  margin-left: 10px;
}

.action-section {
  margin-top: auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.continue-button {
  width: 100%;
  max-width: 300px;
  background: #FFC125;
  color: #1e3971;
  border: none;
  border-radius: 12px;
  padding: 18px 24px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(255, 193, 37, 0.3);
  text-transform: uppercase;
  letter-spacing: 1px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.continue-button:disabled {
  background: #4a5b8a;
  color: #a0b3d9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.continue-button:not(:disabled):active {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(255, 193, 37, 0.2);
}

.language-option.ethiopic .option-text h4,
.language-option.ethiopic .option-text p {
  font-family: "Noto Sans Ethiopic", "Inter", sans-serif;
}

/* Ensure LanguageToggle is positioned correctly */
:deep(.language-toggle-container.fixed-position) {
  position: fixed;
  top: 20px !important;
  right: 20px !important;
  left: auto !important;
  z-index: 1000;
}

/* Responsive styles for LanguageToggle */
@media (max-width: 375px) {
  :deep(.language-toggle-container.fixed-position) {
    top: 15px !important;
    right: 15px !important;
  }
  
  .splash-header {
    margin-top: 50px; /* More space for language toggle on small screens */
  }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .splash-content {
    padding: 30px 20px 20px;
  }
  
  .logo-wrapper {
    width: 100px;
    height: 100px;
  }
  
  .app-title-main,
  .app-title-sub {
    font-size: 28px;
  }
  
  .language-option {
    padding: 16px 18px;
  }
  
  .option-text h4 {
    font-size: 16px;
  }
  
  .option-text p {
    font-size: 12px;
  }
  
  .continue-button {
    padding: 16px 20px;
    font-size: 16px;
  }
}

@media (max-width: 320px) {
  .splash-content {
    padding: 25px 16px 16px;
  }
  
  .logo-wrapper {
    width: 90px;
    height: 90px;
  }
  
  .app-title-main,
  .app-title-sub {
    font-size: 24px;
  }
  
  .language-title {
    font-size: 14px;
  }
  
  .language-subtitle {
    font-size: 12px;
  }
}
</style>