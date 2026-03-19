// composables/useTelegramAuth.js
import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuth } from './useAuth'
import { useTelegram } from './useTelegram'
import { useSchool } from './useSchool'

export const useTelegramAuth = () => {
  const router = useRouter()
  const { loginWithTelegram, checkAuth, isUnlinked } = useAuth()
  const { isTelegram, initData, closeApp, webApp } = useTelegram()
  const { currentSchoolId, getBotUsername } = useSchool()
  
  const authLoading = ref(false)

  const attemptLogin = async () => {
    if (!isTelegram.value) {
      console.log(' Not in Telegram environment')
      return { success: false, error: 'Not in Telegram' }
    }
    
    if (!initData.value) {
      console.error('No initData available')
      return { success: false, error: 'No initData' }
    }

    // CRITICAL: Verify we're in the right bot for this school
    const expectedBot = getBotUsername()
    const actualBot = webApp.value?.initDataUnsafe?.bot_username // or however Telegram exposes it
    
    console.log('🔐 Bot verification:', {
      expected: expectedBot,
      actual: actualBot,
      school: currentSchoolId.value
    })

    // You might want to add bot verification here if Telegram exposes it
    
    authLoading.value = true
    const result = await loginWithTelegram(initData.value)
    authLoading.value = false
    
    return result
  }

  const shareContactInstruction = () => {
    // When closing, ensure we're clearing any cached state
    closeApp()
  }

  onMounted(() => {
    if (checkAuth()) {
      console.log('Already authenticated')
      router.push('/home')
      return
    }
    
    if (isTelegram.value && initData.value) {
      console.log(' Auto-attempting Telegram login...')
      attemptLogin().then(result => {
        if (result.success) {
          console.log(' Auto-login successful')
          router.push('/home')
        } else if (result.unlinked) {
          console.log(' User needs to link account')
        } else {
          console.log(' Login failed:', result.error)
        }
      })
    }
  })

  return {
    isUnlinked,
    authLoading,
    isTelegram,
    attemptLogin,
    shareContactInstruction
  }
}