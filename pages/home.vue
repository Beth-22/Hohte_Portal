<template>
  <div class="dashboard-container">
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
        <h1 class="welcome-name">{{ student.fullName || student.name }}</h1>
      </div>

      <div class="profile-image-container">
        <img :src="student.profileImage" :alt="student.fullName" class="profile-image" />
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
          @click="goToCourseDetail(course.id)"
          :style="{ backgroundImage: `url(${course.bgImage})` }"
        >
          <div class="course-overlay"></div>
          <div class="course-content">
            <h3 class="course-title">{{ course.name }}</h3>
            <p class="course-time">
              <span class="time-icon">🕒</span> {{ course.schedule }}
            </p>
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
              background: `conic-gradient(#FFC125 ${attendance.percentage * 3.6}deg, #3C414D 0deg)`
            }"
          >
            <div class="chart-inner-circle">
              <span class="attendance-percentage">{{ attendance.percentage }}%</span>
            </div>
          </div>
          <div class="attendance-info">
            <p class="status-label">
              {{ t('home.status') }}:
              <span class="status-value" :class="attendance.status">
                {{ t(`home.${attendance.status}`) }}
              </span>
            </p>
            <p class="total-label">
              {{ t('home.totalPercentage') }}:
              <span class="total-value">{{ attendance.percentage }}%</span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import { useNavigation } from '~/composables/useNavigation'
import { useStudentData } from '~/composables/useStudentData'

const { locale, t, setLocale } = useLanguage()
const { goToPermissionStatus, goToCourseDetail } = useNavigation()
const { student, courses, attendance, pendingRequestsCount, initializeData } = useStudentData()

const toggleLanguage = () => {
  const newLocale = locale.value === 'en' ? 'am' : 'en'
  setLocale(newLocale)
}

onMounted(async () => {
  await initializeData()
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3971 0%, #0d1f40 100%);
  color: #fff;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
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
  left: 0;
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
  height: 130px;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
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

.course-title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.course-time {
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.time-icon {
  font-size: 14px;
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

@media (max-width: 375px) {
  .welcome-text {
    padding-left: 100px;
  }

  .welcome-name {
    font-size: 32px;
  }

  .course-title {
    font-size: 22px;
  }

  .attendance-details {
    gap: 20px;
  }

  .attendance-chart {
    width: 90px;
    height: 90px;
  }

  .chart-inner-circle {
    width: 70px;
    height: 70px;
  }
}
</style>