// composables/useSchool.js
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#app'
import { SCHOOLS, DEFAULT_SCHOOL, VALID_SCHOOLS } from '~/config/schools'
import { apiService } from '~/services/api.service'

export const useSchool = () => {
  const route = useRoute()
  const currentSchoolId = ref(null)
  const schoolConfig = ref(null)
  const isInitialized = ref(false)
  const schoolError = ref(null)

  const initializeSchool = () => {
    if (process.client) {
      try {
        // 🔍 DEBUG: Log the entire route query
        console.log('🔍 Full route query:', route.query)
        console.log('🔍 School param specifically:', route.query.school)
        
        // 1️⃣ ALWAYS check URL parameter FIRST
        const urlSchool = route.query.school
        
        if (urlSchool) {
          console.log(`📌 Found URL school parameter: "${urlSchool}"`)
          
          if (VALID_SCHOOLS.includes(urlSchool)) {
            currentSchoolId.value = urlSchool
            schoolConfig.value = SCHOOLS[urlSchool]
            localStorage.setItem('selected_school', urlSchool)
            apiService.setSchool(urlSchool)
            console.log(`✅ School set from URL: ${urlSchool}, logo: ${schoolConfig.value.logoPath}`)
          } else {
            console.warn(`⚠️ Invalid school in URL: "${urlSchool}", falling back`)
            // Fall through to next options
            const savedSchool = localStorage.getItem('selected_school')
            if (savedSchool && VALID_SCHOOLS.includes(savedSchool)) {
              currentSchoolId.value = savedSchool
              schoolConfig.value = SCHOOLS[savedSchool]
              apiService.setSchool(savedSchool)
              console.log(`📁 Fallback to localStorage: ${savedSchool}`)
            } else {
              currentSchoolId.value = DEFAULT_SCHOOL
              schoolConfig.value = SCHOOLS[DEFAULT_SCHOOL]
              localStorage.setItem('selected_school', DEFAULT_SCHOOL)
              apiService.setSchool(DEFAULT_SCHOOL)
              console.log(`⚠️ Default to: ${DEFAULT_SCHOOL}`)
            }
          }
        } else {
          console.log('📌 No school parameter in URL')
          // No URL parameter, use localStorage or default
          const savedSchool = localStorage.getItem('selected_school')
          if (savedSchool && VALID_SCHOOLS.includes(savedSchool)) {
            currentSchoolId.value = savedSchool
            schoolConfig.value = SCHOOLS[savedSchool]
            apiService.setSchool(savedSchool)
            console.log(`📁 Using localStorage: ${savedSchool}`)
          } else {
            currentSchoolId.value = DEFAULT_SCHOOL
            schoolConfig.value = SCHOOLS[DEFAULT_SCHOOL]
            localStorage.setItem('selected_school', DEFAULT_SCHOOL)
            apiService.setSchool(DEFAULT_SCHOOL)
            console.log(`⚠️ Default to: ${DEFAULT_SCHOOL}`)
          }
        }
        
        // 🔍 DEBUG: Final school config
        console.log('🏫 Final school config:', {
          id: currentSchoolId.value,
          name: schoolConfig.value?.name,
          logo: schoolConfig.value?.logoPath
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
      apiService.setSchool(schoolId)
    }
    
    console.log(`School changed to: ${schoolId}`)
    return true
  }

  const getSchoolLogo = () => {
    if (!schoolConfig.value) {
      console.warn('No school config, using default logo')
      return '/assets/images/logo2-modified.png'
    }
    console.log('Getting logo for school:', schoolConfig.value.id, schoolConfig.value.logoPath)
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
    isValidSchool: (schoolId) => VALID_SCHOOLS.includes(schoolId),
    availableSchools: VALID_SCHOOLS
  }
}