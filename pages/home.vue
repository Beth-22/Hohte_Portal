<template>
  <div class="dashboard-container">
    <div class="status-bar-padding"></div>

    <!-- Language Toggle -->
    <LanguageToggle fixed :top="'30px'" :left="'30px'" />

    <!-- Header -->
    <header class="header-section">
      <div class="welcome-text">
        <p class="welcome-label">{{ t('home.welcome') }}</p>
        <h1 class="welcome-name">
          {{ student?.fullName || student?.name || 'Student' }}
        </h1>
      </div>

      <div class="profile-image-container">
        <img
          :src="student?.profileImage"
          :alt="student?.fullName || 'Student'"
          class="profile-image"
        />
      </div>
    </header>

    <!-- Pending requests alert -->
    <div class="alert-box" @click="goToPermissionStatus">
      <div class="alert-content">
        <strong>
          {{ pendingRequestsCount }} {{ t('home.pendingRequests') }}
        </strong>
      </div>
    </div>

    <!-- Courses -->
    <section class="courses-section">
      <h2 class="section-title">{{ t('home.myCourses') }}</h2>

      <div class="course-list">
        <div
          v-for="course in courses"
          :key="course.id"
          class="course-card"
          :style="{ backgroundImage: `url(${course.bgImage})` }"
          @click="goToCourseDetail(course.id)"
        >
          <div class="course-overlay"></div>

          <div class="course-content">
            <h3 class="course-title">
              {{ t(course.translationKey) || course.name }}
            </h3>

            <p class="course-time">
              🕒 {{ course.schedule }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Overall Attendance -->
    <section class="attendance-section">
      <h2 class="section-title">{{ t('home.overallAttendance') }}</h2>

      <div class="attendance-container">
        <div class="attendance-details">
          <div
            class="attendance-chart"
            :style="{
              background: `conic-gradient(
                #ffc125 ${attendance.percentage * 3.6}deg,
                rgba(255,255,255,0.1) 0deg
              )`
            }"
          >
            <div class="chart-inner-circle">
              <span class="attendance-percentage">
                {{ attendance.percentage }}%
              </span>
            </div>
          </div>

          <div class="attendance-info">
            <p class="status-label">{{ t('home.status') }}</p>
            <p class="status-value" :class="attendance.status">
              {{ t(`home.${attendance.status}`) }}
            </p>

            <p class="total-label">
              {{ t('home.totalPercentage') }}
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
import { onMounted } from "vue";
import { useLanguage } from "~/composables/useLanguage";
import { useNavigation } from "~/composables/useNavigation";
import { useStudentData } from "~/composables/useStudentData";
import LanguageToggle from "~/components/LanguageToggle.vue";

const { t } = useLanguage();
const { goToPermissionStatus, goToCourseDetail } = useNavigation();

const { student, courses, attendance, pendingRequestsCount, initializeData } =
  useStudentData();

onMounted(() => initializeData());
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3971 0%, #0d1f40 100%);
  color: #fff;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
}

.status-bar-padding {
  height: 40px;
}

/* Header */
.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 50px 20px 10px;
}

.welcome-text {
  padding-left: 20px;
  flex: 1;
}

.welcome-label {
  font-size: 16px;
  color: #a0b3d9;
  margin-bottom: 5px;
}

.welcome-name {
  font-size: 24px;
  font-weight: 800;
  color: #ffc125;
}

.profile-image-container {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #ffc125;
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Alert */
.alert-box {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 10px 20px;
  margin: 10px 20px 25px;
  cursor: pointer;
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: #ffc125;
  margin: 0 0 20px 20px;
  border-bottom: 2px solid rgba(255, 193, 37, 0.3);
  display: inline-block;
}

/* Courses */
.course-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 20px;
}

.course-card {
  height: 130px;
  border-radius: 20px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.course-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1),
    rgba(0, 0, 0, 0.7)
  );
}

.course-content {
  position: relative;
  z-index: 2;
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.course-title {
  font-size: 24px;
  font-weight: 700;
}

.course-time {
  font-size: 16px;
}

/* Attendance */
.attendance-section {
  padding: 0 20px;
  margin-top: 30px;
}

.attendance-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 20px;
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
  align-items: center;
  justify-content: center;
}

.chart-inner-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #1e3971;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attendance-percentage {
  font-size: 20px;
  font-weight: 800;
  color: #ffc125;
}

.status-label {
  color: #a0b3d9;
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

.total-value {
  font-size: 28px;
  font-weight: 800;
  color: #ffc125;
}

.bottom-spacer {
  height: 100px;
}

/* Language toggle */
:deep(.language-toggle-container.fixed-position) {
  position: fixed;
  top: 30px !important;
  left: 30px !important;
  z-index: 1000;
}
</style>
