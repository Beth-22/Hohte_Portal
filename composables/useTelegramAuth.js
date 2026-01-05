import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import { useAuth } from './useAuth'
import { useTelegram } from './useTelegram'

export const useTelegramAuth = () => {
  const router = useRouter()
  const { loginWithTelegram, checkAuth, isUnlinked } = useAuth()
  const { isTelegram, initData, closeApp } = useTelegram()
  
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
    
    authLoading.value = true
    const result = await loginWithTelegram(initData.value)
    authLoading.value = false
    
    return result
  }

  const shareContactInstruction = () => {
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