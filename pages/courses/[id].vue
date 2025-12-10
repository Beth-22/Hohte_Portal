<template>
  <div class="course-detail-page">
    <!-- Back Button and Language Toggle -->
    <div class="top-bar">
      <button class="back-button" @click="goBack" @touchstart="handleTouch">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      
      <div class="page-title">{{ t('course.classDetails') }}</div>
      
      <button class="language-toggle" @click="toggleLanguage" @touchstart="handleTouch">
        <span>{{ locale === 'en' ? 'አማ' : 'EN' }}</span>
      </button>
    </div>
    
    <!-- Course Banner -->
    <div class="course-banner" :style="{ backgroundImage: `url(${course.bgImage})` }">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <h1 class="course-title">{{ course.name }}</h1>
        <div class="course-meta">
          <div class="meta-item">
            <svg class="meta-icon" width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 1.333a6.667 6.667 0 1 0 0 13.334A6.667 6.667 0 0 0 8 1.333zm0 12A5.333 5.333 0 1 1 8 2.667a5.333 5.333 0 0 1 0 10.666zM8 4v4l2.667 1.333" 
                    stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
            <span>{{ course.schedule }}</span>
          </div>
          <div class="meta-item">
            <svg class="meta-icon" width="16" height="16" viewBox="0 0 16 16">
              <path d="M8 8a3.333 3.333 0 1 0 0-6.667A3.333 3.333 0 0 0 8 8zm4 1.333H4a4 4 0 0 0-4 4v.667h16v-.667a4 4 0 0 0-4-4z" 
                    fill="currentColor"/>
            </svg>
            <span>{{ course.instructor }}</span>
          </div>
          <div class="meta-item">
            <svg class="meta-icon" width="16" height="16" viewBox="0 0 16 16">
              <path d="M2 2h12v12H2V2zm1.333 1.333v9.334h9.334V3.333H3.333z" 
                    stroke="currentColor" stroke-width="1.5" fill="none"/>
              <path d="M5.333 5.333h5.334v5.334H5.333z" fill="currentColor"/>
            </svg>
            <span>{{ course.room }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Course Description -->
      <div class="content-card">
        <h2 class="card-title">
          <svg class="title-icon" width="20" height="20" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
          </svg>
          {{ t('course.courseDescription') }}
        </h2>
        <div class="card-content">
          <p>{{ course.description }}</p>
          <p>{{ t('course.descriptionText2') }}</p>
          <p>{{ t('course.descriptionText3') }}</p>
        </div>
      </div>

      <!-- Attendance Stats -->
      <div class="content-card">
        <h2 class="card-title">
          <svg class="title-icon" width="20" height="20" viewBox="0 0 24 24">
            <path d="M3 3v18h18V3H3zm16 16H5V5h14v14z"/>
            <path d="M7 17h2v-5H7v5zm4 0h2V7h-2v10zm4 0h2v-7h-2v7z"/>
          </svg>
          {{ t('course.yourAttendance') }}
        </h2>
        
        <div class="attendance-stats">
          <!-- Circular Progress -->
          <div class="attendance-circle">
            <div class="circle-background"></div>
            <div class="circle-progress" :style="{ transform: `rotate(${course.attendance?.percentage * 3.6}deg)` }"></div>
            <div class="circle-text">
              <span class="percentage">{{ course.attendance?.percentage || 0 }}%</span>
              <span class="label">{{ t('course.attendance') }}</span>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="stats-grid">
            <div class="stat-item attended">
              <div class="stat-number">{{ course.attendance?.attended || 0 }}</div>
              <div class="stat-label">
                <div class="stat-dot"></div>
                {{ t('course.attended') }}
              </div>
            </div>
            <div class="stat-item missed">
              <div class="stat-number">{{ course.attendance?.missed || 0 }}</div>
              <div class="stat-label">
                <div class="stat-dot"></div>
                {{ t('course.missed') }}
              </div>
            </div>
            <div class="stat-item excused">
              <div class="stat-number">{{ course.attendance?.excused || 0 }}</div>
              <div class="stat-label">
                <div class="stat-dot"></div>
                {{ t('course.excused') }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Request Permission Button -->
      <button class="permission-button" @click="goToPermissionRequest" @touchstart="handleTouch">
        {{ t('course.requestPermission') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from '#app'
import { useLanguage } from '~/composables/useLanguage'
import { useNavigation } from '~/composables/useNavigation'
import { useStudentData } from '~/composables/useStudentData'

const route = useRoute()
const { locale, t, setLocale } = useLanguage()
const { goBack, goToPermissionRequest } = useNavigation()
const { courses } = useStudentData()

const course = ref({
  id: '',
  name: '',
  description: '',
  schedule: '',
  instructor: '',
  room: '',
  bgImage: '',
  attendance: {
    percentage: 0,
    attended: 0,
    missed: 0,
    excused: 0
  }
})

const handleTouch = (event) => {
  event.currentTarget.style.opacity = '0.7'
  setTimeout(() => {
    if (event.currentTarget) {
      event.currentTarget.style.opacity = '1'
    }
  }, 150)
}

const toggleLanguage = () => {
  const newLocale = locale.value === 'en' ? 'am' : 'en'
  setLocale(newLocale)
}

onMounted(() => {
  const courseId = route.params.id
  const foundCourse = courses.value.find(c => c.id === courseId)
  if (foundCourse) {
    course.value = foundCourse
  }
})
</script>

<style scoped>
.course-detail-page {
  min-height: 100vh;
  background: #1E3971;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  touch-action: manipulation;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  position: sticky;
  top: 0;
  background: #1E3971;
  z-index: 100;
}

.back-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  flex-shrink: 0;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.back-button:active {
  opacity: 0.7;
  transform: scale(0.95);
}

.back-button svg {
  stroke: white;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  text-align: center;
  flex: 1;
  margin: 0 15px;
}

.language-toggle {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.language-toggle:active {
  opacity: 0.7;
  transform: scale(0.95);
}

.course-banner {
  position: relative;
  height: 220px;
  margin: 0 20px 25px;
  border-radius: 20px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%);
}

.banner-content {
  position: relative;
  z-index: 2;
  height: 100%;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.course-title {
  font-size: 28px;
  font-weight: 800;
  color: white;
  margin: 0 0 15px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  line-height: 1.2;
}

.course-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
}

.meta-icon {
  color: #FFC125;
  flex-shrink: 0;
}

.main-content {
  padding: 0 20px 30px;
}

.content-card {
  background: #243F77;
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #FFC125;
  margin: 0 0 20px 0;
}

.title-icon {
  color: #FFC125;
}

.card-content {
  color: white;
  line-height: 1.6;
}

.card-content p {
  margin: 0 0 15px 0;
  font-size: 16px;
}

.card-content p:last-child {
  margin-bottom: 0;
}

.attendance-stats {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-top: 20px;
}

.attendance-circle {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  flex-shrink: 0;
}

.circle-background {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#3C414D 0deg, #3C414D 360deg);
}

.circle-progress {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(#FFC125 0deg, #FFC125 0deg, #3C414D 0deg);
  clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
  transform-origin: center;
}

.circle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.percentage {
  display: block;
  font-size: 24px;
  font-weight: 800;
  color: #FFC125;
  line-height: 1;
  margin-bottom: 4px;
}

.label {
  display: block;
  font-size: 12px;
  color: #a0b3d9;
  font-weight: 500;
}

.stats-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 15px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.stat-item.attended {
  border-top: 3px solid #10b981;
}

.stat-item.missed {
  border-top: 3px solid #ef4444;
}

.stat-item.excused {
  border-top: 3px solid #f59e0b;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 8px;
}

.stat-item.attended .stat-number {
  color: #10b981;
}

.stat-item.missed .stat-number {
  color: #ef4444;
}

.stat-item.excused .stat-number {
  color: #f59e0b;
}

.stat-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #a0b3d9;
  font-weight: 500;
}

.stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-item.attended .stat-dot {
  background: #10b981;
}

.stat-item.missed .stat-dot {
  background: #ef4444;
}

.stat-item.excused .stat-dot {
  background: #f59e0b;
}

.permission-button {
  width: 100%;
  background: #FFC125;
  color: #1E3971;
  border: none;
  border-radius: 16px;
  padding: 20px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 20px;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.permission-button:active {
  opacity: 0.7;
  transform: scale(0.98);
}

@media (max-width: 768px) {
  .attendance-stats {
    flex-direction: column;
    gap: 25px;
  }
  
  .stats-grid {
    width: 100%;
  }
  
  .course-banner {
    height: 200px;
    margin: 0 15px 20px;
  }
  
  .course-title {
    font-size: 24px;
  }
}

@media (max-width: 375px) {
  .course-banner {
    height: 180px;
    margin: 0 10px 15px;
  }
  
  .banner-content {
    padding: 20px;
  }
  
  .course-title {
    font-size: 22px;
  }
  
  .content-card {
    padding: 20px;
  }
  
  .attendance-circle {
    width: 90px;
    height: 90px;
  }
  
  .percentage {
    font-size: 20px;
  }
  
  .stat-number {
    font-size: 24px;
  }
}
</style>