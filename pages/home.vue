<!-- home.vue -->
<script setup>
import { onMounted, ref, watch } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import { useNavigation } from '~/composables/useNavigation'
import { useStudentData } from '~/composables/useStudentData'
import { useTelegramAuth } from '~/composables/useTelegramAuth'

// Import the class image directly
import classImage from '~/assets/images/class_image.png'

const { locale, t, setLocale } = useLanguage()
const { goToPermissionStatus, goToCourseDetail } = useNavigation()
const { student, courses, attendance, pendingRequestsCount, initializeData, isLoading, error } = useStudentData()
const telegramAuth = useTelegramAuth()

// Track expanded schedules for each course
const expandedSchedules = ref({})

// 🌟 SIMPLE TOGGLE - updates GLOBAL state
const toggleLanguage = () => {
  const newLocale = locale.value === 'en' ? 'am' : 'en'
  setLocale(newLocale) // This affects ALL pages immediately
}

// Toggle schedule expansion
const toggleSchedule = (courseId, event) => {
  event.stopPropagation() // Prevent card click
  expandedSchedules.value[courseId] = !expandedSchedules.value[courseId]
}

// Format schedule by day for visual display
const formatScheduleByDay = (scheduleText) => {
  if (!scheduleText || scheduleText === 'No schedule information' || scheduleText === 'No schedule available') {
    return []
  }
  
  // Parse schedule text into array of day-time objects
  const scheduleItems = scheduleText.split(',').map(item => {
    const trimmed = item.trim()
    
    // Extract day abbreviation (Mon, Tue, Wed, etc.)
    let dayAbbr = ''
    let time = ''
    
    if (trimmed.includes('Monday')) {
      dayAbbr = 'Mon'
      time = trimmed.replace('Monday', '').trim()
    } else if (trimmed.includes('Tuesday')) {
      dayAbbr = 'Tue'
      time = trimmed.replace('Tuesday', '').trim()
    } else if (trimmed.includes('Wednesday')) {
      dayAbbr = 'Wed'
      time = trimmed.replace('Wednesday', '').trim()
    } else if (trimmed.includes('Thursday')) {
      dayAbbr = 'Thu'
      time = trimmed.replace('Thursday', '').trim()
    } else if (trimmed.includes('Friday')) {
      dayAbbr = 'Fri'
      time = trimmed.replace('Friday', '').trim()
    } else if (trimmed.includes('Saturday')) {
      dayAbbr = 'Sat'
      time = trimmed.replace('Saturday', '').trim()
    } else if (trimmed.includes('Sunday')) {
      dayAbbr = 'Sun'
      time = trimmed.replace('Sunday', '').trim()
    } else {
      // Fallback: use first 3 letters
      dayAbbr = trimmed.substring(0, 3)
      time = trimmed.substring(3).trim()
    }
    
    return { 
      dayAbbr, 
      time, 
      full: trimmed,
      dayFull: getFullDayName(trimmed)
    }
  })
  
  return scheduleItems
}

// Get full day name for expanded view
const getFullDayName = (scheduleText) => {
  if (scheduleText.includes('Monday')) return 'Monday'
  if (scheduleText.includes('Tuesday')) return 'Tuesday'
  if (scheduleText.includes('Wednesday')) return 'Wednesday'
  if (scheduleText.includes('Thursday')) return 'Thursday'
  if (scheduleText.includes('Friday')) return 'Friday'
  if (scheduleText.includes('Saturday')) return 'Saturday'
  if (scheduleText.includes('Sunday')) return 'Sunday'
  return scheduleText
}

// Check if schedule has many items (more than 2 for mobile)
const hasManySchedules = (scheduleText) => {
  if (!scheduleText || scheduleText === 'No schedule information' || scheduleText === 'No schedule available') return false
  return scheduleText.split(',').length > 2
}

// Get schedule count
const getScheduleCount = (scheduleText) => {
  if (!scheduleText || scheduleText === 'No schedule information' || scheduleText === 'No schedule available') return 0
  return scheduleText.split(',').length
}

// Handle image error
const handleImageError = (event) => {
  console.error('Image failed to load:', event.target.src);
  
  // Check if this is the profile image
  if (event.target.classList.contains('profile-image')) {
    // Use placeholder for profile image
    event.target.src = getPlaceholderProfile();
    console.log('Falling back to placeholder for profile image');
  } else if (event.target.classList.contains('course-bg')) {
    // This is a course background, use the imported class image
    event.target.src = classImage;
    console.log('Retrying course background image with imported path');
  }
}

// Get placeholder profile image URL
const getPlaceholderProfile = () => {
  // Return a base64 encoded SVG as fallback
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMyQjRCODMiLz48cGF0aCBkPSJNNTAgNTVDNjAuMzU1MyA1NSA2OC44NzUgNDYuNDgwMiA2OC44NzUgMzYuMTI1QzY4Ljg3NSAyNS43Njk4IDYwLjM1NTMgMTcuMjUgNTAgMTcuMjVDMzkuNjQ0NyAxNy4yNSAzMS4xMjUgMjUuNzY5OCAzMS4xMjUgMzYuMTI1QzMxLjEyNSA0Ni40ODAyIDM5LjY0NDcgNTUgNTAgNTVaIiBmaWxsPSIjRkZGMDAwIi8+PHBhdGggZD0iTTUwIDYwQzMyLjg3NSA2MCAxOC43NSA3NC4xMjUgMTguNzUgOTEuMjVWOTJINzIuNVY5MS4yNUM3Mi41IDc0LjEyNSA1OC4zNzUgNjAgNTEuMjUgNjBINTAiIGZpbGw9IiNGRkYwMDAiLz48L3N2Zz4=';
}

// Get the class image URL - Use imported class_image.png
const getClassImage = () => {
  return classImage;
}

// Get student profile image URL - use ERP photo_url if available
const getStudentProfileImage = () => {
  if (student.value && student.value.profileImage) {
    const profileUrl = student.value.profileImage;
    if (profileUrl && (profileUrl.startsWith('http://') || profileUrl.startsWith('https://'))) {
      console.log('Using ERP profile image:', profileUrl);
      return profileUrl;
    }
  }
  
  if (student.value && student.value.raw && student.value.raw.photo_url) {
    const photoUrl = student.value.raw.photo_url;
    if (photoUrl && (photoUrl.startsWith('http://') || photoUrl.startsWith('https://'))) {
      console.log('Using photo_url from API:', photoUrl);
      return photoUrl;
    }
  }
  
  console.log('Using placeholder profile image');
  return getPlaceholderProfile();
}

// Check authentication before loading data
const loadDataWithAuth = async () => {
  try {
    console.log('🏠 Home page mounted')
    
    // Check if user is authenticated
    if (!telegramAuth.isAuthenticated.value) {
      console.log('User not authenticated, waiting for auth...')
      return
    }
    
    console.log('User authenticated, loading data...')
    console.log('Initial student data:', student.value)
    console.log('Initial courses:', courses.value)
    
    await initializeData()
    console.log('After initialize - student:', student.value)
    console.log('After initialize - courses:', courses.value)
  } catch (err) {
    console.error('Failed to initialize data:', err)
  }
}

onMounted(async () => {
  // Wait for authentication to complete
  const authStatus = telegramAuth.getAuthStatus()
  console.log('Home auth status:', authStatus)
  
  // If authenticated, load data
  if (telegramAuth.isAuthenticated.value) {
    await loadDataWithAuth()
  }
})

// Watch for authentication changes
watch(() => telegramAuth.isAuthenticated.value, (isAuthenticated) => {
  if (isAuthenticated) {
    console.log('Authentication state changed to true, loading data...')
    loadDataWithAuth()
  }
})

// Watch for courses changes
watch(courses, (newCourses) => {
  console.log('Courses updated:', newCourses.length)
}, { immediate: true })

// Logout function
const handleLogout = () => {
  telegramAuth.logout()
  // You might want to redirect to login/splash screen
  window.location.href = '/'
}
</script>

<template>
  <div class="dashboard-container">
    <!-- Authentication Required State -->
    <div v-if="!telegramAuth.isAuthenticated" class="auth-required-state">
      <div class="auth-icon">🔒</div>
      <h3>Authentication Required</h3>
      <p>Please log in to access your dashboard</p>
      <button class="retry-button" @click="telegramAuth.login()">Login</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p class="loading-text">{{ t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load data</h3>
      <p>{{ error }}</p>
      <button class="retry-button" @click="initializeData">Retry</button>
    </div>

    <!-- Normal State -->
    <div v-else>
      <div class="status-bar-padding"></div>

      <header class="header-section">
        <div class="language-toggle" @click="toggleLanguage">
          <svg class="globe-icon" viewBox="0 0 24 24" width="24" height="24">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4.09 13H8.38C8.84 14.88 9.77 16.56 11 17.89C9.64 17.75 8.35 17.07 7.2 16.03L4.09 13ZM12 20C10.74 20 9.53 19.52 8.56 18.73C9.88 18.59 11.19 18.11 12 17.39C12.81 18.11 14.12 18.59 15.44 18.73C14.47 19.52 13.26 20 12 20ZM20 12C20 11.66 19.95 11.32 19.86 11H15.62C15.16 9.12 14.23 7.44 13 6.11C14.36 6.25 15.65 6.93 16.8 7.97L19.91 11C19.97 11.33 20 11.66 20 12ZM12 4C13.26 4 14.47 4.48 15.44 5.27C14.12 5.41 12.81 5.89 12 6.61C11.19 5.89 9.88 5.41 8.56 5.27C9.53 4.48 10.74 4 12 4ZM4.09 11L7.2 7.97C8.35 6.93 9.64 6.25 11 6.11C9.77 7.44 8.84 9.12 8.38 11H4.09Z"/>
          </svg>
          <span class="language-label">{{ locale === 'en' ? 'አማ' : 'EN' }}</span>
        </div>

        <div class="welcome-text">
          <p class="welcome-label">{{ t('home.welcome') }}</p>
          <h1 class="welcome-name">{{ student?.fullName || student?.name || 'Student' }}</h1>
        </div>

        <div class="profile-image-container">
          <img 
            :src="getStudentProfileImage()" 
            :alt="student?.fullName" 
            class="profile-image" 
            @error="handleImageError"
            loading="lazy"
          />
        </div>
      </header>

      <div class="alert-box" @click="goToPermissionStatus">
        <div class="alert-content">
          <span class="alert-icon">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
            </svg>
          </span>
          <span class="alert-message">
            <strong>{{ pendingRequestsCount }} {{ t('home.pendingRequests') }}</strong>
          </span>
        </div>
        <span class="alert-arrow">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M9 18L15 12L9 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>

      <section class="courses-section">
        <h2 class="section-title">{{ t('home.myCourses') }}</h2>
        <div class="course-list">
          <div
            v-for="course in courses"
            :key="course.id"
            class="course-card"
            :class="{ 'expanded': expandedSchedules[course.id] }"
            @click="goToCourseDetail(course.id)"
          >
            <!-- Use img tag for background with proper src -->
            <img 
              :src="getClassImage()" 
              alt="Course background" 
              class="course-bg"
              loading="lazy"
              @error="handleImageError"
            />
            <div class="course-overlay"></div>
            <div class="course-content">
              <div class="course-header">
                <h3 class="course-title">{{ course.name }}</h3>
                <div 
                  v-if="hasManySchedules(course.schedule)" 
                  class="expand-indicator"
                  :class="{ 'expanded': expandedSchedules[course.id] }"
                  @click="toggleSchedule(course.id, $event)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M7 10l5 5 5-5z" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              
              <div class="course-schedule-section">
                <div class="time-icon">🕒</div>
                <div class="schedule-container">
                  <div v-if="formatScheduleByDay(course.schedule).length === 0" class="no-schedule-text">
                    No schedule available
                  </div>
                  <div v-else class="schedule-display">
                    <!-- Schedule Pills -->
                    <div class="schedule-pills">
                      <!-- Show only first 2 schedules when collapsed -->
                      <template v-if="!expandedSchedules[course.id]">
                        <div 
                          v-for="(item, index) in formatScheduleByDay(course.schedule).slice(0, 2)"
                          :key="index"
                          class="schedule-pill"
                          :title="item.full"
                        >
                          <span class="day-abbr">{{ item.dayAbbr }}</span>
                          <span class="day-time" v-if="item.time">{{ item.time }}</span>
                        </div>
                        
                        <!-- Show more indicator -->
                        <div 
                          v-if="formatScheduleByDay(course.schedule).length > 2" 
                          class="more-pill"
                          @click="toggleSchedule(course.id, $event)"
                        >
                          <span class="more-text">+{{ formatScheduleByDay(course.schedule).length - 2 }}</span>
                        </div>
                      </template>
                      
                      <!-- Show ALL schedules when expanded -->
                      <template v-if="expandedSchedules[course.id]">
                        <div 
                          v-for="(item, index) in formatScheduleByDay(course.schedule)"
                          :key="index"
                          class="schedule-pill"
                          :title="item.full"
                        >
                          <span class="day-abbr">{{ item.dayAbbr }}</span>
                          <span class="day-time" v-if="item.time">{{ item.time }}</span>
                        </div>
                      </template>
                    </div>
                    
                    <!-- Expanded view with full details -->
                    <div v-if="expandedSchedules[course.id]" class="expanded-details">
                      <div class="expanded-title">Full Schedule:</div>
                      <div class="expanded-items">
                        <div 
                          v-for="(item, index) in formatScheduleByDay(course.schedule)" 
                          :key="index"
                          class="expanded-item"
                        >
                          <span class="expanded-day">{{ item.dayFull }}</span>
                          <span class="expanded-time">{{ item.time }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="attendance-section">
        <h2 class="section-title">{{ t('home.overallAttendance') }}</h2>
        <div class="attendance-container">
          <div class="attendance-details">
            <div
              class="attendance-chart"
              :style="{
                background: `conic-gradient(#FFC125 ${(attendance?.percentage || 0) * 3.6}deg, #3C414D 0deg)`
              }"
            >
              <div class="chart-inner-circle">
                <span class="attendance-percentage">{{ attendance?.percentage || 0 }}%</span>
              </div>
            </div>
            <div class="attendance-info">
              <p class="status-label">
                {{ t('home.status') }}:
                <span class="status-value" :class="attendance?.status || 'good'">
                  {{ t(`home.${attendance?.status || 'good'}`) }}
                </span>
              </p>
              <p class="total-label">
                {{ t('home.totalPercentage') }}:
                <span class="total-value">{{ attendance?.percentage || 0 }}%</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <div class="bottom-spacer"></div>
      
      <!-- Logout button (optional, can be hidden) -->
      <div class="logout-container" v-if="telegramAuth.isInTelegram">
        <button class="logout-button" @click="handleLogout">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path d="M16 17L21 12L16 7M21 12H9M9 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3971 0%, #0d1f40 100%);
  color: #fff;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
}

.auth-required-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
  text-align: center;
}

.auth-icon {
  font-size: 64px;
  margin-bottom: 20px;
  color: #FFC125;
}

.auth-required-state h3 {
  font-size: 24px;
  color: #FFC125;
  margin-bottom: 10px;
}

.auth-required-state p {
  font-size: 16px;
  color: #a0b3d9;
  margin-bottom: 30px;
}

.status-bar-padding {
  height: 40px;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px 10px;
  position: relative;
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
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.language-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.globe-icon {
  fill: #ffc125;
  width: 20px;
  height: 20px;
}

.language-label {
  font-size: 14px;
  font-weight: 600;
  color: #ffc125;
  min-width: 20px;
}

.welcome-text {
  position: absolute;
  left: 3%;
  top: 50%;
  transform: translateY(-50%);
  text-align: left;
  width: 100%;
  padding-left: 120px;
  box-sizing: border-box;
  z-index: 1;
}

.welcome-label {
  font-size: 16px;
  color: #a0b3d9;
  margin: 0 0 5px 0;
  font-weight: 400;
}

.welcome-name {
  font-size: 38px;
  font-weight: 800;
  color: #ffc125;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.profile-image-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #ffc125;
  box-shadow: 0 4px 15px rgba(255, 193, 37, 0.3);
  flex-shrink: 0;
  z-index: 2;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #2b4b8f;
}

.alert-box {
  background: rgba(255, 255, 255, 0.1);
  color: #ffc125;
  border-radius: 16px;
  padding: 14px 20px;
  margin: 10px 20px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.alert-box:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-icon svg {
  fill: #ffc125;
}

.alert-message {
  font-size: 15px;
  font-weight: 600;
}

.alert-arrow svg {
  stroke: #ffc125;
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: #ffc125;
  margin: 0 0 20px 20px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(255, 193, 37, 0.3);
  display: inline-block;
}

.course-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 20px;
}

.course-card {
  position: relative;
  min-height: 130px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.course-card.expanded {
  min-height: 180px;
  transition: min-height 0.3s ease;
}

.course-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.course-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.7) 100%);
  backdrop-filter: brightness(0.7) contrast(1.2);
  z-index: 1;
}

.course-content {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.course-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-top:5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  flex: 1;
  padding-right: 10px;
}

.expand-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.expand-indicator:hover {
  background: rgba(255, 255, 255, 0.2);
}

.expand-indicator.expanded svg {
  transform: rotate(180deg);
}

.expand-indicator svg {
  fill: #ffc125;
  transition: transform 0.3s ease;
}

.course-schedule-section {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.time-icon {
  font-size: 16px;
  margin-top: 20px;
  flex-shrink: 0;
}

.schedule-container {
  flex: 1;
}

.no-schedule-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  margin-top:22px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.schedule-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.schedule-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.schedule-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 10px;
  border-radius: 8px;
  margin-top:15px;
  min-width: 50px;
  cursor: default;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease;
}

.schedule-pill:hover {
  transform: translateY(-2px);
}

.day-abbr {
  font-size: 12px;
  font-weight: 700;
  color: #ffc125;
  margin-bottom: 2px;
}

.day-time {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 193, 37, 0.2);
  padding: 6px 12px;
  margin-top:15px;
  border-radius: 8px;
  min-width: 40px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 193, 37, 0.3);
}

.more-pill:hover {
  background: rgba(255, 193, 37, 0.3);
  transform: translateY(-2px);
}

.more-text {
  font-size: 12px;
  font-weight: 700;
  color: #ffc125;
}

.expanded-details {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 12px;
  margin-top: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.expanded-title {
  font-size: 13px;
  font-weight: 600;
  color: #ffc125;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.expanded-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.expanded-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  font-size: 13px;
}

.expanded-day {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.expanded-time {
  color: rgba(255, 255, 255, 0.8);
}

.attendance-section {
  padding: 0 20px;
  margin-top: 30px;
}

.attendance-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.attendance-details {
  display: flex;
  align-items: center;
  gap: 30px;
}

.attendance-chart {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.chart-inner-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #1e3971;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
}

.attendance-percentage {
  font-size: 20px;
  font-weight: 800;
  color: #ffc125;
}

.attendance-info {
  flex: 1;
}

.status-label {
  font-size: 18px;
  color: #a0b3d9;
  margin: 0 0 15px 0;
}

.status-value {
  font-weight: 700;
  font-size: 20px;
}

.status-value.good {
  color: #ffc125;
}

.status-value.average {
  color: #ffa500;
}

.status-value.poor {
  color: #ff4d4d;
}

.total-label {
  font-size: 16px;
  color: #a0b3d9;
  margin: 0;
}

.total-value {
  color: #ffc125;
  font-weight: 800;
  font-size: 28px;
  margin-left: 5px;
}

.bottom-spacer {
  height: 100px;
}

.logout-container {
  padding: 20px;
  text-align: center;
}

.logout-button {
  background: rgba(255, 255, 255, 0.1);
  color: #ffc125;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.logout-button:hover {
  background: rgba(255, 193, 37, 0.1);
  transform: translateY(-2px);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .welcome-text {
    padding-left: 100px;
  }

  .welcome-name {
    font-size: 32px;
  }

  .course-card {
    min-height: 140px;
  }
  
  .course-card.expanded {
    min-height: auto;
    height: auto;
  }

  .course-title {
    font-size: 20px;
  }

  .schedule-pill {
    padding: 5px 8px;
    min-width: 45px;
  }

  .day-abbr {
    font-size: 11px;
  }

  .day-time {
    font-size: 9px;
    max-width: 50px;
  }

  .more-pill {
    padding: 5px 10px;
  }

  .more-text {
    font-size: 11px;
  }

  .expanded-details {
    padding: 10px;
  }

  .expanded-item {
    font-size: 12px;
    padding: 5px 6px;
  }
}

@media (max-width: 375px) {
  .course-title {
    font-size: 18px;
  }

  .schedule-pill {
    min-width: 40px;
    padding: 4px 6px;
  }

  .day-time {
    max-width: 40px;
    font-size: 8px;
  }
}

/* Loading and error states */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 57, 113, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #FFC125;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: white;
  margin-top: 20px;
  font-size: 18px;
}

.error-state {
  text-align: center;
  padding: 40px 20px;
  color: white;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-state h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.error-state p {
  margin-bottom: 20px;
  color: #ffc125;
}

.retry-button {
  background: #ffc125;
  color: #1e3971;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>