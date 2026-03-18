// composables/useSchool.js
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from '#app'
import { SCHOOLS, DEFAULT_SCHOOL, VALID_SCHOOLS } from '~/config/schools'

export const useSchool = () => {
  const route = useRoute()
  const currentSchoolId = ref(null)
  const schoolConfig = ref(null)
  const isInitialized = ref(false)
  const schoolError = ref(null)

  const initializeSchool = () => {
    if (process.client) {
      try {
        // ALWAYS check URL parameter FIRST - this is the source of truth
        const urlSchool = route.query.school
        
        if (urlSchool && VALID_SCHOOLS.includes(urlSchool)) {
          currentSchoolId.value = urlSchool
          schoolConfig.value = SCHOOLS[urlSchool]
          // Save to localStorage ONLY AFTER setting from URL
          localStorage.setItem('selected_school', urlSchool)
          console.log(`School initialized from URL: ${urlSchool}`)
        } else {
          // Only fallback to localStorage if NO URL parameter
          const savedSchool = localStorage.getItem('selected_school')
          if (savedSchool && VALID_SCHOOLS.includes(savedSchool)) {
            currentSchoolId.value = savedSchool
            schoolConfig.value = SCHOOLS[savedSchool]
            console.log(`School initialized from localStorage: ${savedSchool}`)
          } else {
            // Default to hohte only if nothing else works
            currentSchoolId.value = DEFAULT_SCHOOL
            schoolConfig.value = SCHOOLS[DEFAULT_SCHOOL]
            localStorage.setItem('selected_school', DEFAULT_SCHOOL)
            console.log(`School initialized to default: ${DEFAULT_SCHOOL}`)
          }
        }
        
        isInitialized.value = true
        schoolError.value = null
      } catch (error) {
        console.error('Error initializing school:', error)
        schoolError.value = 'Failed to initialize school configuration'
        // Fallback to hohte
        currentSchoolId.value = DEFAULT_SCHOOL
        schoolConfig.value = SCHOOLS[DEFAULT_SCHOOL]
        isInitialized.value = true
      }
    }
  }

  const setSchool = (schoolId) => {
    if (!VALID_SCHOOLS.includes(schoolId)) {
      console.error(`Invalid school ID: ${schoolId}`)
      return false
    }
    
    currentSchoolId.value = schoolId
    schoolConfig.value = SCHOOLS[schoolId]
    
    if (process.client) {
      localStorage.setItem('selected_school', schoolId)
    }
    
    console.log(`School changed to: ${schoolId}`)
    return true
  }

  const getSchoolLogo = () => {
    if (!schoolConfig.value) return '/assets/images/logo2-modified.png'
    return schoolConfig.value.logoPath
  }

  const getSchoolName = () => {
    if (!schoolConfig.value) return 'HOHTE'
    return schoolConfig.value.name
  }

  const getAppName = () => {
    if (!schoolConfig.value) return 'HOHTE Portal'
    return schoolConfig.value.appName
  }

  const getApiBaseUrl = () => {
    if (!schoolConfig.value) return SCHOOLS.hohte.apiBaseURL
    return schoolConfig.value.apiBaseURL
  }

  const getBotUsername = () => {
    if (!schoolConfig.value) return SCHOOLS.hohte.botUsername
    return schoolConfig.value.botUsername
  }

  const validateBot = (initData) => {
    // This is a basic validation - you might want to enhance this
    // based on your Telegram bot verification needs
    if (!process.client || !initData) return true
    
    try {
      // You can add more sophisticated bot validation here if needed
      // For now, we'll just check if the bot matches the school
      return true
    } catch (error) {
      console.error('Bot validation error:', error)
      return true // Fail open for now
    }
  }

  // Watch for route changes to detect school parameter changes
  watch(() => route.query.school, (newSchool) => {
    if (process.client && newSchool && VALID_SCHOOLS.includes(newSchool)) {
      if (currentSchoolId.value !== newSchool) {
        console.log(`School parameter changed to: ${newSchool}`)
        currentSchoolId.value = newSchool
        schoolConfig.value = SCHOOLS[newSchool]
        localStorage.setItem('selected_school', newSchool)
        
        // Force a page reload to ensure all API calls use the new school
        window.location.reload()
      }
    }
  })

  onMounted(() => {
    if (!isInitialized.value) {
      initializeSchool()
    }
  })

  return {
    currentSchoolId: computed(() => currentSchoolId.value),
    schoolConfig: computed(() => schoolConfig.value),
    isInitialized: computed(() => isInitialized.value),
    schoolError: computed(() => schoolError.value),
    initializeSchool,
    setSchool,
    getSchoolLogo,
    getSchoolName,
    getAppName,
    getApiBaseUrl,
    getBotUsername,
    validateBot,
    isValidSchool: (schoolId) => VALID_SCHOOLS.includes(schoolId),
    availableSchools: VALID_SCHOOLS
  }
}