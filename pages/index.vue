<template>
  <div class="splash-container">
    <!-- Authentication Unlinked State -->
    <div v-if="isUnlinked" class="unlinked-container">
      <div class="unlinked-content">
        <div class="unlinked-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#FFC125"/>
          </svg>
        </div>
        <h2 class="unlinked-title">{{ t('auth.unlinkedTitle') }}</h2>
        <p class="unlinked-message">
          {{ t('auth.unlinkedMessage') }}
        </p>
        <div class="unlinked-instructions">
          <div class="instruction-step">
            <span class="step-number">1</span>
            <span class="step-text">{{ t('auth.stepClose') }}</span>
          </div>
          <div class="instruction-step">
            <span class="step-number">2</span>
            <span class="step-text">{{ t('auth.stepFindBot') }}</span>
          </div>
          <div class="instruction-step">
            <span class="step-number">3</span>
            <span class="step-text">{{ t('auth.stepTapShare') }}</span>
          </div>
          <div class="instruction-step">
            <span class="step-number">4</span>
            <span class="step-text">{{ t('auth.stepReopen') }}</span>
          </div>
        </div>
        <button class="unlinked-button" @click="shareContactInstruction">
          {{ t('auth.closeAndShare') }}
        </button>
        <button class="unlinked-retry" @click="retryLogin">
          {{ t('auth.alreadyShared') }}
        </button>
      </div>
    </div>

    <div v-else class="splash-content">
      <div v-if="isLoading || authLoading" class="loading-state">
        <div class="spinner"></div>
        <p class="loading-text">{{ t('auth.connecting') }}</p>
      </div>

      <div v-else>
        <div class="splash-header">
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
            :disabled="!selectedLanguage || authLoading"
            :class="{ enabled: selectedLanguage && !authLoading }"
          >
            {{ t('splash.continue') }}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4.16663 10H15.8333" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M10 4.16666L15.8333 10L10 15.8333" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          
          <!-- Error message -->
          <div v-if="authError && !isUnlinked" class="auth-error">
            <p>{{ authError }}</p>
            <button @click="retryLogin" class="retry-link">
              {{ t('auth.retry') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "#app";
import { useLanguage } from "~/composables/useLanguage";
import { useTelegramAuth } from "~/composables/useTelegramAuth";
import { useAuth } from "~/composables/useAuth";

const router = useRouter();
const { t, setLocale, init, locale } = useLanguage();
const { isUnlinked, authLoading, isTelegram, attemptLogin, shareContactInstruction } = useTelegramAuth();
const { isAuthenticated, authError, isLoading: authIsLoading } = useAuth();

const selectedLanguage = ref(locale.value);
const splashLoading = ref(true);
const imageError = ref(false);

const handleImageError = () => {
  imageError.value = true;
};

onMounted(() => {
  setTimeout(() => {
    splashLoading.value = false;
    
    if (process.client) {
      init();
      selectedLanguage.value = locale.value;
      
      if (isAuthenticated.value) {
        router.push('/home');
      }
    }
  }, 1500);
});

const selectLanguage = (lang) => {
  selectedLanguage.value = lang;
  setLocale(lang);
};

const retryLogin = async () => {
  if (isTelegram.value) {
    const result = await attemptLogin();
    if (result.success) {
      router.push('/home');
    }
  }
};

const continueToApp = async () => {
  if (!selectedLanguage.value) return;
  
  if (isTelegram.value) {
    const result = await attemptLogin();
    if (result.success) {
      router.push('/home');
    } else if (result.unlinked) {
      return;
    } else {
      return;
    }
  } else {
    if (isAuthenticated.value) {
      router.push('/home');
    } else {
      alert(t('auth.telegramOnly'));
    }
  }
};
</script>

<style scoped>
.splash-container {
  min-height: var(--tg-viewport-height, 100vh);
  background: #1e3971;
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  touch-action: manipulation;
}

/* Unlinked State Styles */
.unlinked-container {
  height: var(--tg-viewport-height, 100vh);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #1e3971;
}

.unlinked-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  border: 1px solid rgba(255, 193, 37, 0.2);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.unlinked-icon {
  margin-bottom: 20px;
}

.unlinked-title {
  color: #FFC125;
  font-size: 24px;
  margin-bottom: 15px;
  font-weight: 700;
}

.unlinked-message {
  color: #fff;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 25px;
  opacity: 0.9;
}

.unlinked-instructions {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  text-align: left;
}

.instruction-step {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: #fff;
}

.instruction-step:last-child {
  margin-bottom: 0;
}

.step-number {
  width: 28px;
  height: 28px;
  background: #FFC125;
  color: #1e3971;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.step-text {
  font-size: 14px;
  opacity: 0.9;
}

.unlinked-button {
  background: #FFC125;
  color: #1e3971;
  border: none;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
  margin-bottom: 10px;
}

.unlinked-button:hover {
  background: #ffd54f;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 193, 37, 0.3);
}

.unlinked-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(255, 193, 37, 0.2);
}

.unlinked-retry {
  background: transparent;
  color: #FFC125;
  border: 1px solid #FFC125;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.unlinked-retry:hover {
  background: rgba(255, 193, 37, 0.1);
}

.auth-error {
  margin-top: 15px;
  padding: 12px;
  background: rgba(255, 86, 86, 0.1);
  border: 1px solid rgba(255, 86, 86, 0.3);
  border-radius: 8px;
  color: #ff5656;
  font-size: 14px;
}

.retry-link {
  background: transparent;
  color: #FFC125;
  border: none;
  padding: 5px 10px;
  margin-top: 5px;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
}

.retry-link:hover {
  color: #ffd54f;
}

/* Loading State */
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

/* Splash Content */
.splash-content {
  flex: 1;
  padding: 40px 24px 24px;
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}

.splash-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-container {
  margin-bottom: 24px;
  margin-top: 20px;
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
  box-shadow: 
    0 0 18px rgba(255, 255, 255, 0.5),
    0 0 35px rgba(255, 255, 255, 0.3),
    0 0 50px rgba(255, 255, 255, 0.15),
    0 0 90px rgba(255, 193, 37, 0.08);
  animation: subtleGlow 5s infinite alternate ease-in-out;
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.4));
}

.logo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  background: transparent;
  position: relative;
  z-index: 2;
}

@keyframes subtleGlow {
  0% {
    box-shadow: 
      0 0 18px rgba(255, 255, 255, 0.5),
      0 0 35px rgba(255, 255, 255, 0.3),
      0 0 50px rgba(255, 255, 255, 0.15),
      0 0 90px rgba(255, 193, 37, 0.08);
  }
  100% {
    box-shadow: 
      0 0 22px rgba(255, 255, 255, 0.55),
      0 0 40px rgba(255, 255, 255, 0.35),
      0 0 60px rgba(255, 255, 255, 0.2),
      0 0 100px rgba(255, 193, 37, 0.1);
  }
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
}

.continue-button:disabled {
  background: #4a5b8a;
  color: #a0b3d9;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.continue-button:not(:disabled):hover {
  background: #ffd54f;
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(255, 193, 37, 0.4);
}

.continue-button:not(:disabled):active {
  transform: scale(0.98);
  box-shadow: 0 2px 10px rgba(255, 193, 37, 0.2);
}

.language-option.ethiopic .option-text h4,
.language-option.ethiopic .option-text p {
  font-family: "Noto Sans Ethiopic", "Inter", sans-serif;
}

@media (max-width: 768px) {
  .unlinked-content {
    padding: 30px 20px;
    margin: 0 20px;
  }
  
  .unlinked-title {
    font-size: 22px;
  }
  
  .unlinked-message {
    font-size: 15px;
  }
}
</style>