import { ref, onMounted } from 'vue'
import { useRouter } from '#app'
import { apiService } from '~/services/api.service'

export const useAuth = () => {
  const router = useRouter()
  const isAuthenticated = ref(false)
  const isLoading = ref(false)
  const authError = ref(null)
  const isUnlinked = ref(false)

  const checkAuth = () => {
    // apiService handles namespaced token internally
    const hasToken = !!apiService.token
    isAuthenticated.value = hasToken
    return hasToken
  }

  const loginWithTelegram = async (initData) => {
    try {
      isLoading.value = true
      authError.value = null
      isUnlinked.value = false
      
      const response = await apiService.telegramLogin(initData)
      
      if (response && response.token) {
        apiService.setToken(response.token)
        isAuthenticated.value = true
        return { success: true, data: response }
      } else {
        throw new Error('No token received from server')
      }
    } catch (error) {
      authError.value = error.message
      if (error.message.includes('404') || error.message.includes('401')) {
        isUnlinked.value = true
        return { success: false, unlinked: true, error: error.message }
      }
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    apiService.clearToken()
    isAuthenticated.value = false
    router.push(`/?school=${apiService.tenant}`)
  }

  onMounted(() => { checkAuth() })

  return {
    isAuthenticated,
    isLoading,
    authError,
    isUnlinked,
    checkAuth,
    loginWithTelegram,
    logout
  }
}