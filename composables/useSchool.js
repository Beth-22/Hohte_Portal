// composables/useSchool.js
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#app'
import { SCHOOLS, DEFAULT_SCHOOL, VALID_SCHOOLS } from '~/config/schools'
import { apiService } from '~/services/api.service'

// Import the images directly
import hohteLogo from '~/assets/images/logo2-modified.png'
import fikureLogo from '~/assets/images/logo-fikure.jpg'

export const useSchool = () => {
  const route = useRoute()
  const currentSchoolId = ref(null)
  const schoolConfig = ref(null)
  const isInitialized = ref(false)
  const schoolError = ref(null)

  // Map school IDs to imported images
  const logoMap = {
    hohte: hohteLogo,
    fikure: fikureLogo
  }

  const initializeSchool = () => {
    if (process.client) {
      try {
        // Debug logs
        console.log('🔍 Full route query:', route.query)
        console.log('🔍 School param specifically:', route.query.school)
        
        // ALWAYS check URL parameter FIRST
        const urlSchool = route.query.school
        let selectedSchool = null
        
        if (urlSchool) {
          console.log(`📌 Found URL school parameter: "${urlSchool}"`)
          
          if (VALID_SCHOOLS.includes(urlSchool)) {
            selectedSchool = urlSchool
            console.log(`✅ School set from URL: ${urlSchool}`)
          } else {
            console.warn(`⚠️ Invalid school in URL: "${urlSchool}", falling back`)
          }
        }
        
        // If no valid URL school, try localStorage
        if (!selectedSchool) {
          const savedSchool = localStorage.getItem('selected_school')
          if (savedSchool && VALID_SCHOOLS.includes(savedSchool)) {
            selectedSchool = savedSchool
            console.log(`📁 Using localStorage: ${savedSchool}`)
          } else {
            selectedSchool = DEFAULT_SCHOOL
            console.log(`⚠️ Default to: ${DEFAULT_SCHOOL}`)
          }
        }
        
        // Set the school
        currentSchoolId.value = selectedSchool
        schoolConfig.value = SCHOOLS[selectedSchool]
        localStorage.setItem('selected_school', selectedSchool)
        
        // CRITICAL: Update API service with the selected school
        apiService.setSchool(selectedSchool)
        
        // Final debug
        console.log('🏫 Final school config:', {
          id: currentSchoolId.value,
          name: schoolConfig.value?.name
        })
        
        isInitialized.value = true
        schoolError.value = null
      } catch (error) {
        console.error('❌ Error initializing school:', error)
        schoolError.value = 'Failed to initialize school configuration'
        currentSchoolId.value = DEFAULT_SCHOOL
        schoolConfig.value = SCHOOLS[DEFAULT_SCHOOL]
        apiService.setSchool(DEFAULT_SCHOOL)
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
      // CRITICAL: Update API service when school changes
      apiService.setSchool(schoolId)
    }
    
    console.log(`School changed to: ${schoolId}`)
    return true
  }

  const getSchoolLogo = () => {
    if (!currentSchoolId.value) {
      console.warn('No school ID, using default hohte logo')
      return hohteLogo
    }
    const logo = logoMap[currentSchoolId.value]
    if (!logo) {
      console.warn(`No logo found for school: ${currentSchoolId.value}, using default`)
      return hohteLogo
    }
    console.log(`Getting logo for school: ${currentSchoolId.value}`)
    return logo
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
    if (!process.client || !initData) return true
    
    try {
      // You can add bot validation here if needed
      return true
    } catch (error) {
      console.error('Bot validation error:', error)
      return true
    }
  }

  const isValidSchool = (schoolId) => {
    return VALID_SCHOOLS.includes(schoolId)
  }

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
    isValidSchool,
    availableSchools: VALID_SCHOOLS
  }
}