<template>
  <div class="permission-request">
    <div class="toast-container">
      <ToastNotification
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        @close="removeToast(toast.id)"
      />
    </div>

    <div class="logo-top">
      <div class="logo-container">
        <img
          :src="getSchoolLogo()"
          :alt="getSchoolName() + ' Logo'"
          class="logo-image-top"
          @error="handleLogoError"
        />
      </div>
    </div>

    <div class="form-card">
      <div class="header-section">
        <button class="back-button" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <h1 class="page-title">{{ t('requestStatus.newRequest') }}</h1>
      </div>

      <div class="form-section">
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <span class="field-label">{{ t('requestStatus.class') }}</span>
            </div>
            <select v-model="formData.course" class="select-input" :class="{ error: errors.course }" @change="onClassChange">
              <option value="" disabled selected>{{ t('requestStatus.selectClass') }}</option>
              <option
                v-for="course in classOptions"
                :key="course.id"
                :value="course.id"
              >
                {{ course.name }}
              </option>
            </select>
            <span v-if="errors.course" class="error-message">{{ errors.course }}</span>
          </div>
        </div>

        <div class="form-field">
          <div class="field-header">
            <span class="field-label">{{ t('requestStatus.reason') }}</span>
            <span class="required-asterisk">*</span>
          </div>
          <p class="custom-reason-hint">{{ t('requestStatus.customReasonHint') }}</p>
          <textarea
            v-model="formData.reason"
            class="custom-reason-textarea"
            rows="3"
            :placeholder="t('requestStatus.customReasonPlaceholder')"
            :class="{ error: errors.reason }"
            @input="clearError('reason')"
          ></textarea>
          <span v-if="errors.reason" class="error-message">{{ errors.reason }}</span>
        </div>
      </div>

      <div class="duration-section">
        <div class="duration-header">
          <span class="duration-label">{{ t('requestStatus.durationType') }}:</span>
          <div class="toggle-switch">
            <button
              class="toggle-option"
              :class="{ active: durationType === 'specific' }"
              @click="durationType = 'specific'"
            >
              {{ t('requestStatus.specificDay') }}
            </button>
            <button
              class="toggle-option"
              :class="{ active: durationType === 'range' }"
              @click="durationType = 'range'"
            >
              {{ t('requestStatus.dateRange') }}
            </button>
          </div>
        </div>

        <!-- Schedule Info & Legend -->
        <div v-if="scheduleDays.length > 0" class="schedule-info">
          <div class="schedule-legend">
            <span class="legend-dot"></span>
            <span class="legend-text">{{ t('requestStatus.scheduledClass') }}</span>
          </div>
          <div class="schedule-days">
            <span class="schedule-label">{{ t('requestStatus.classRunsOn') }}:</span>
            <span class="schedule-days-list">{{ formatScheduleDays }}</span>
          </div>
          <div class="schedule-note">
            📅 {{ t('requestStatus.onlyScheduledDays') }}
          </div>
        </div>

        <div class="date-input-section">
          <!-- Specific Date -->
          <div v-if="durationType === 'specific'" class="single-date-input">
            <p class="date-hint">{{ t('requestStatus.singleDateHint') }}</p>
            <div class="date-input-wrapper">
              <ClientOnly>
                <VueDatePicker
                  v-model="formData.specificDate"
                  :min-date="minDate"
                  :max-date="maxStartDate"
                  :enable-time-picker="false"
                  :auto-apply="true"
                  :clearable="false"
                  :format="dateFormat"
                  :day-cell-class="getDayCellClass"
                  @update:model-value="validateSpecificDate"
                  @open="showDateTooltip = false"
                >
                  <template #trigger>
                    <input
                      type="text"
                      :value="formData.specificDate ? formatDateForDisplay(formData.specificDate) : ''"
                      placeholder="Select date"
                      class="date-input"
                      :class="{ error: errors.specificDate }"
                      readonly
                    />
                  </template>
                </VueDatePicker>
              </ClientOnly>
              <div v-if="showDateTooltip && formData.specificDate > maxStartDate" class="tooltip-message">
                ⚠️ {{ t('requestStatus.tooltips.dateExceedsLimit', { maxDate: formatDateForDisplay(maxStartDate) }) }}
              </div>
            </div>
            <span v-if="errors.specificDate" class="error-message">{{ errors.specificDate }}</span>
            <div class="info-hint">{{ t('requestStatus.dateLimitHint', { maxDate: formatDateForDisplay(maxStartDate) }) }}</div>
          </div>

          <!-- Date Range -->
          <div v-else class="date-range-input">
            <p class="date-hint">{{ t('requestStatus.dateRangeHint') }}</p>
            <div class="range-hint-text">{{ t('requestStatus.rangeLimitHint') }}</div>
            <div class="range-inputs">
              <div class="range-field">
                <div class="date-input-wrapper">
                  <ClientOnly>
                    <VueDatePicker
                      v-model="formData.startDate"
                      :min-date="minDate"
                      :max-date="maxStartDate"
                      :enable-time-picker="false"
                      :auto-apply="true"
                      :clearable="false"
                      :format="dateFormat"
                      :day-cell-class="getDayCellClass"
                      @update:model-value="validateStartDate"
                      @open="showStartDateTooltip = false"
                    >
                      <template #trigger>
                        <input
                          type="text"
                          :value="formData.startDate ? formatDateForDisplay(formData.startDate) : ''"
                          :placeholder="t('requestStatus.startDate')"
                          class="date-input"
                          :class="{ error: errors.startDate }"
                          readonly
                        />
                      </template>
                    </VueDatePicker>
                  </ClientOnly>
                  <div v-if="showStartDateTooltip && formData.startDate > maxStartDate" class="tooltip-message">
                    ⚠️ {{ t('requestStatus.tooltips.dateExceedsLimit', { maxDate: formatDateForDisplay(maxStartDate) }) }}
                  </div>
                </div>
                <span v-if="errors.startDate" class="error-message">{{ errors.startDate }}</span>
              </div>
              <div class="range-field">
                <div class="date-input-wrapper">
                  <ClientOnly>
                    <VueDatePicker
                      v-model="formData.endDate"
                      :min-date="minEndDate"
                      :max-date="maxEndDate"
                      :enable-time-picker="false"
                      :auto-apply="true"
                      :clearable="false"
                      :format="dateFormat"
                      :day-cell-class="getDayCellClass"
                      @update:model-value="validateEndDate"
                      @open="showEndDateTooltip = false"
                    >
                      <template #trigger>
                        <input
                          type="text"
                          :value="formData.endDate ? formatDateForDisplay(formData.endDate) : ''"
                          :placeholder="t('requestStatus.endDate')"
                          class="date-input"
                          :class="{ error: errors.endDate }"
                          readonly
                        />
                      </template>
                    </VueDatePicker>
                  </ClientOnly>
                  <div v-if="showEndDateTooltip && formData.endDate && formData.endDate < formData.startDate" class="tooltip-message">
                    ⚠️ {{ t('requestStatus.tooltips.endDateBeforeStart') }}
                  </div>
                  <div v-if="showEndDateTooltip && formData.endDate && maxEndDate && formData.endDate > maxEndDate" class="tooltip-message">
                    ⚠️ {{ t('requestStatus.tooltips.rangeExceedsLimit', { maxDate: formatDateForDisplay(maxEndDate) }) }}
                  </div>
                </div>
                <span v-if="errors.endDate" class="error-message">{{ errors.endDate }}</span>
              </div>
            </div>
            
            <!-- Range Summary -->
            <div v-if="formData.startDate && formData.endDate" class="range-summary">
              <div class="range-summary-label">{{ t('requestStatus.affectedSessions') }}:</div>
              <div class="range-summary-dates">
                <span 
                  v-for="date in getScheduledDatesInRange" 
                  :key="date"
                  class="range-summary-date"
                >
                  <span class="date-dot-small"></span>
                  {{ formatDateForDisplay(date) }}
                </span>
                <span v-if="getScheduledDatesInRange.length === 0" class="range-summary-empty">
                  {{ t('requestStatus.noScheduledDays') }}
                </span>
              </div>
              <div v-if="getScheduledDatesInRange.length > 0" class="range-summary-count">
                {{ t('requestStatus.totalSessions') }}: <strong>{{ getScheduledDatesInRange.length }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="submit-section">
        <button class="submit-btn" @click="submitForm" :disabled="isSubmitting">
          {{ isSubmitting ? t('requestStatus.submitting') : t('requestStatus.submit') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import { useNavigation } from '~/composables/useNavigation'
import { useStudentData } from '~/composables/useStudentData'
import { useToast } from '~/composables/useToast'
import { useSchool } from '~/composables/useSchool'
import ToastNotification from '~/components/ToastNotification.vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const { locale, t, setLocale } = useLanguage()
const { goBack } = useNavigation()
const { 
  classOptions, 
  submitPermissionRequest,
  fetchClassOptions,
  isLoading 
} = useStudentData()
const { getSchoolLogo, getSchoolName } = useSchool()

const { toasts, success, error: showError, removeToast } = useToast()

const durationType = ref('specific')
const isSubmitting = ref(false)
const showDateTooltip = ref(false)
const showStartDateTooltip = ref(false)
const showEndDateTooltip = ref(false)
const scheduleDays = ref([])
const selectedClassSchedule = ref(null)

const formData = ref({
  course: '',
  reason: '',
  specificDate: '',
  startDate: '',
  endDate: ''
})

const errors = ref({
  course: '',
  reason: '',
  specificDate: '',
  startDate: '',
  endDate: ''
})

// Date format for display
const dateFormat = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Get today's date in local timezone (YYYY-MM-DD format)
const getTodayLocal = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format date for display (YYYY-MM-DD to readable format)
const formatDateForDisplay = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const minDate = ref(getTodayLocal())

// Add 6 calendar months to a date
const addSixMonths = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  date.setMonth(date.getMonth() + 6)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Calculate max start date (today + 6 months)
const maxStartDate = computed(() => {
  return addSixMonths(minDate.value)
})

// Calculate min end date (must be >= start date)
const minEndDate = computed(() => {
  if (durationType.value === 'range' && formData.value.startDate) {
    return formData.value.startDate
  }
  return minDate.value
})

// Calculate max end date (start date + 6 months)
const maxEndDate = computed(() => {
  if (durationType.value === 'range' && formData.value.startDate) {
    return addSixMonths(formData.value.startDate)
  }
  return addSixMonths(minDate.value)
})

// Format schedule days for display
const formatScheduleDays = computed(() => {
  if (!scheduleDays.value || scheduleDays.value.length === 0) return ''
  return scheduleDays.value.join(', ')
})

// Get day of week from date string (0=Sunday, 1=Monday, etc.)
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString)
  return date.getDay()
}

// Get day name from day number
const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayNumber]
}

// Check if a date matches the schedule days
const isScheduledDate = (dateString) => {
  if (!scheduleDays.value || scheduleDays.value.length === 0) return false
  const dayOfWeek = getDayOfWeek(dateString)
  const dayName = getDayName(dayOfWeek)
  return scheduleDays.value.includes(dayName)
}

// Get scheduled dates within selected range
const getScheduledDatesInRange = computed(() => {
  if (!scheduleDays.value || scheduleDays.value.length === 0) return []
  if (!formData.value.startDate || !formData.value.endDate) return []
  
  const dates = []
  const start = new Date(formData.value.startDate)
  const end = new Date(formData.value.endDate)
  
  let currentDate = new Date(start)
  
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0]
    if (isScheduledDate(dateStr)) {
      dates.push(dateStr)
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
})

// Get day cell class for calendar
const getDayCellClass = (date) => {
  const dateStr = date.toISOString().split('T')[0]
  const dayOfWeek = date.getDay()
  const dayName = getDayName(dayOfWeek)
  
  // Check if it's a scheduled day
  if (scheduleDays.value.includes(dayName)) {
    return 'scheduled-day'
  }
  return ''
}

// Load schedule for selected class
const loadClassSchedule = async (classId) => {
  try {
    const selectedClass = classOptions.value.find(c => c.id === classId)
    if (!selectedClass) {
      scheduleDays.value = []
      selectedClassSchedule.value = null
      return
    }
    
    // Fetch full class details including schedules
    const { fetchClasses } = useStudentData()
    const classesData = await fetchClasses()
    const classData = classesData.find(c => c.id === classId)
    
    if (classData && classData.raw && classData.raw.schedules) {
      const days = classData.raw.schedules.map(s => s.day_of_week).filter(Boolean)
      scheduleDays.value = days
      selectedClassSchedule.value = classData.raw.schedules
    } else {
      scheduleDays.value = []
      selectedClassSchedule.value = null
    }
  } catch (err) {
    console.error('Failed to load class schedule:', err)
    scheduleDays.value = []
    selectedClassSchedule.value = null
  }
}

// Handle class change
const onClassChange = () => {
  if (formData.value.course) {
    loadClassSchedule(formData.value.course)
  }
}

// Validate specific date (can't be in the past or > 6 months, and must be scheduled)
const validateSpecificDate = () => {
  if (formData.value.specificDate && formData.value.specificDate < minDate.value) {
    errors.value.specificDate = t('requestStatus.errors.dateCannotBePast')
    return false
  }
  if (formData.value.specificDate && maxStartDate.value && formData.value.specificDate > maxStartDate.value) {
    errors.value.specificDate = t('requestStatus.errors.dateExceedsSixMonths', { maxDate: formatDateForDisplay(maxStartDate.value) })
    return false
  }
  if (formData.value.specificDate && !isScheduledDate(formData.value.specificDate)) {
    errors.value.specificDate = t('requestStatus.errors.notScheduledDay')
    return false
  }
  errors.value.specificDate = ''
  return true
}

// Validate start date (can't be in the past or > today + 6 months)
const validateStartDate = () => {
  if (!formData.value.startDate) {
    errors.value.startDate = ''
    return true
  }
  
  if (formData.value.startDate < minDate.value) {
    errors.value.startDate = t('requestStatus.errors.dateCannotBePast')
    return false
  }
  
  if (maxStartDate.value && formData.value.startDate > maxStartDate.value) {
    errors.value.startDate = t('requestStatus.errors.dateExceedsSixMonths', { maxDate: formatDateForDisplay(maxStartDate.value) })
    return false
  }
  
  if (formData.value.endDate && formData.value.endDate < formData.value.startDate) {
    formData.value.endDate = formData.value.startDate
    errors.value.endDate = ''
  }
  
  if (formData.value.endDate && maxEndDate.value && formData.value.endDate > maxEndDate.value) {
    formData.value.endDate = maxEndDate.value
    errors.value.endDate = ''
  }
  
  errors.value.startDate = ''
  return true
}

// Validate end date (must be >= start date, <= start date + 6 months)
const validateEndDate = () => {
  if (!formData.value.endDate) {
    errors.value.endDate = ''
    return true
  }
  
  if (!formData.value.startDate) {
    errors.value.endDate = t('requestStatus.errors.selectStartDateFirst')
    return false
  }
  
  if (formData.value.endDate < formData.value.startDate) {
    errors.value.endDate = t('requestStatus.errors.endDateBeforeStart')
    return false
  }
  
  if (maxEndDate.value && formData.value.endDate > maxEndDate.value) {
    errors.value.endDate = t('requestStatus.errors.rangeExceedsSixMonths', { maxDate: formatDateForDisplay(maxEndDate.value) })
    return false
  }
  
  errors.value.endDate = ''
  return true
}

const handleLogoError = () => {
  console.error('Logo image failed to load')
  const img = document.querySelector('.logo-image-top')
  if (img) {
    img.src = '/assets/images/logo2-modified.png'
  }
}

const clearError = (field) => {
  if (errors.value[field]) {
    errors.value[field] = ''
  }
}

const validateForm = () => {
  let isValid = true
  
  Object.keys(errors.value).forEach(key => {
    errors.value[key] = ''
  })

  if (!formData.value.course) {
    errors.value.course = t('requestStatus.errors.selectClass')
    isValid = false
  }

  if (!formData.value.reason || !formData.value.reason.trim()) {
    errors.value.reason = t('requestStatus.errors.customReasonRequired')
    isValid = false
  }

  if (durationType.value === 'specific') {
    if (!formData.value.specificDate) {
      errors.value.specificDate = t('requestStatus.errors.selectDate')
      isValid = false
    } else if (!validateSpecificDate()) {
      isValid = false
    }
  } else {
    if (!formData.value.startDate) {
      errors.value.startDate = t('requestStatus.errors.selectStartDate')
      isValid = false
    } else if (!validateStartDate()) {
      isValid = false
    }
    
    if (!formData.value.endDate) {
      errors.value.endDate = t('requestStatus.errors.selectEndDate')
      isValid = false
    } else if (!validateEndDate()) {
      isValid = false
    }
    
    if (formData.value.startDate && formData.value.endDate && getScheduledDatesInRange.value.length === 0) {
      errors.value.startDate = t('requestStatus.errors.noScheduledDaysInRange')
      isValid = false
    }
  }

  return isValid
}

const submitForm = async () => {
  if (!validateForm()) {
    showError(t('requestStatus.errors.validationFailed'), 3000)
    return
  }

  const selectedCourse = classOptions.value.find(c => c.id === formData.value.course)
  
  let startDate, endDate
  
  if (durationType.value === 'specific') {
    startDate = formData.value.specificDate
    endDate = formData.value.specificDate
  } else {
    startDate = formData.value.startDate
    endDate = formData.value.endDate
  }
  
  const requestData = {
    title: formData.value.reason.trim(),
    course: selectedCourse?.name || 'Class',
    courseId: formData.value.course,
    reason: formData.value.reason.trim(),
    durationType: durationType.value,
    startDate: startDate,
    endDate: endDate,
    reasonId: null
  }

  console.log('Submitting request data:', requestData)

  try {
    isSubmitting.value = true
    const result = await submitPermissionRequest(requestData)
    
    if (result.success) {
      success(t('requestStatus.submissionSuccess'), 3000)
      
      setTimeout(() => {
        goBack()
      }, 1500)
    } else {
      showError(result.error || t('requestStatus.submissionFailed'), 4000)
    }
  } catch (err) {
    console.error('Submit error:', err)
    showError(t('requestStatus.submissionFailed'), 4000)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  const today = getTodayLocal()
  formData.value.specificDate = today
  formData.value.startDate = today
  formData.value.endDate = today

  console.log('Permission request page mounted')

  try {
    await fetchClassOptions()
    console.log('Data fetched successfully')
    
    if (classOptions.value.length > 0) {
      formData.value.course = classOptions.value[0].id
      await loadClassSchedule(formData.value.course)
    }
  } catch (err) {
    console.error('Failed to fetch data:', err)
    showError('Failed to load form data. Please try again.', 4000)
  }
})
</script>

<style scoped>
.permission-request {
  min-height: 100vh;
  background-color: #1e3971;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
  flex-direction: column;
}

.logo-top {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  margin-top: 20px;
}

.logo-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.logo-image-top {
  width:100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
}

.toast-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  pointer-events: none;
}

.form-card {
  background-color: #1e3971;
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 800px;
  position: relative;
  z-index: 1;
}

.header-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 35px;
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
  text-align: center;
  flex: 1;
}

.form-section {
  margin-bottom: 30px;
}

.form-row {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 20px;
  }
}

.form-field {
  flex: 1;
  position: relative;
}

.field-header {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.field-label {
  font-weight: bold;
  color: #ffffff;
  font-size: 16px;
}

.required-asterisk {
  color: #ff3b30;
  font-weight: bold;
}

.select-input {
  width: 100%;
  padding: 12px 15px;
  border: 4px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
  color: #333;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
}

.select-input:focus {
  outline: none;
  border-color: #FFC125;
  box-shadow: 0 0 0 3px rgba(255, 193, 37, 0.1);
}

.select-input.error {
  border-color: #ff3b30;
}

.custom-reason-hint {
  font-size: 14px;
  color: #afadad;
  margin: 8px 0 15px 0;
  font-style: italic;
}

.custom-reason-textarea {
  width: 100%;
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
  color: #333;
  background: white;
  outline: none;
  resize: vertical;
  min-height: 100px;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s;
}

.custom-reason-textarea:focus {
  border-color: #FFC125;
  box-shadow: 0 0 0 3px rgba(255, 193, 37, 0.1);
}

.custom-reason-textarea.error {
  border-color: #ff3b30;
}

.duration-section {
  margin-bottom: 40px;
}

.duration-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 25px;
}

.duration-label {
  font-weight: bold;
  color: #ffffff;
  font-size: 16px;
  min-width: 120px;
}

.toggle-switch {
  display: flex;
  background: #f0f0f0;
  border-radius: 30px;
  padding: 5px;
  border: 2px solid #e0e0e0;
}

.toggle-option {
  padding: 12px 30px;
  border: none;
  background: transparent;
  color: #000000;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 25px;
  min-width: 140px;
  text-align: center;
}

.toggle-option.active {
  background: #FFC125;
  color: #1e3971;
  box-shadow: 0 2px 8px rgba(255, 193, 37, 0.3);
}

.toggle-option:hover:not(.active) {
  background: rgba(255, 193, 37, 0.1);
  color: #1e3971;
}

/* Schedule Info Styles */
.schedule-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.schedule-legend {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #FFC125;
  border: 2px solid #FFC125;
  flex-shrink: 0;
}

.legend-text {
  color: #ffffff;
  font-size: 14px;
}

.schedule-days {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.schedule-label {
  color: #b1afaf;
  font-size: 13px;
}

.schedule-days-list {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.schedule-note {
  color: #FFC125;
  font-size: 13px;
  margin-top: 4px;
}

.date-input-section {
  margin-top: 20px;
}

.date-hint {
  font-size: 14px;
  color: #b1afaf;
  margin-bottom: 15px;
  font-style: italic;
}

.range-hint-text {
  font-size: 13px;
  color: #FFC125;
  margin-bottom: 15px;
  font-weight: 500;
  background: rgba(255, 193, 37, 0.1);
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
}

.info-hint {
  font-size: 12px;
  color: #b1afaf;
  margin-top: 8px;
  font-style: italic;
}

.date-input-wrapper {
  position: relative;
  width: 100%;
}

.date-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
  color: #333;
  background: white;
  outline: none;
  transition: all 0.3s;
  font-family: 'Inter', sans-serif;
  cursor: pointer;
}

.date-input:focus {
  border-color: #FFC125;
  box-shadow: 0 0 0 3px rgba(255, 193, 37, 0.1);
}

.date-input.error {
  border-color: #ff3b30;
}

.date-input::placeholder {
  color: #aba9a9;
}

.tooltip-message {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: #333;
  color: #FFC125;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 5px;
  z-index: 10;
  animation: fadeIn 0.2s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  white-space: nowrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.range-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .range-inputs {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .tooltip-message {
    white-space: normal;
    font-size: 11px;
  }
}

.range-field {
  width: 100%;
  position: relative;
}

.error-message {
  display: block;
  color: #ff3b30;
  font-size: 14px;
  margin-top: 6px;
  font-weight: 500;
}

/* Range Summary Styles */
.range-summary {
  margin-top: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.range-summary-label {
  color: #b1afaf;
  font-size: 13px;
  margin-bottom: 8px;
}

.range-summary-dates {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.range-summary-date {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255, 193, 37, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 12px;
}

.range-summary-empty {
  color: #b1afaf;
  font-size: 13px;
  font-style: italic;
}

.date-dot-small {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #FFC125;
  flex-shrink: 0;
}

.range-summary-count {
  color: #ffffff;
  font-size: 14px;
}

.range-summary-count strong {
  color: #FFC125;
}

.submit-section {
  text-align: center;
  margin-top: 30px;
  margin-bottom: 50px;
}

.submit-btn {
  background: #FFC125;
  color: #1e3971;
  border: none;
  border-radius: 8px;
  padding: 16px 60px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(30, 57, 113, 0.3);
  min-width: 200px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 57, 113, 0.4);
  background: #ffd54f;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn:active {
  transform: translateY(0);
}

@media (max-width: 480px) {
  .form-card {
    padding: 25px 20px;
  }

  .page-title {
    font-size: 20px;
  }

  .toggle-switch {
    width: 100%;
  }

  .toggle-option {
    flex: 1;
    min-width: auto;
    padding: 12px 15px;
  }
  
  .logo-container {
    width: 80px;
    height: 80px;
  }
}

/* Calendar Custom Styles - Yellow dots on scheduled days */
:deep(.dp__calendar_day.scheduled-day) {
  position: relative;
  color: #FFC125 !important;
  font-weight: 600 !important;
}

:deep(.dp__calendar_day.scheduled-day::after) {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #FFC125;
  border: 1px solid #FFC125;
}

:deep(.dp__calendar_day.scheduled-day.dp__active_date) {
  background-color: #FFC125 !important;
  color: #1e3971 !important;
}

:deep(.dp__calendar_day.scheduled-day.dp__active_date::after) {
  background-color: #1e3971;
  border-color: #1e3971;
}

:deep(.dp__calendar_day.scheduled-day.dp__active_date:hover) {
  background-color: #ffd54f !important;
}

:deep(.dp__calendar_day.scheduled-day:hover) {
  background-color: rgba(255, 193, 37, 0.2);
}

:deep(.dp__calendar_day.scheduled-day.dp__date_disabled) {
  color: #666 !important;
}

:deep(.dp__calendar_day.scheduled-day.dp__date_disabled::after) {
  background-color: #666;
  border-color: #666;
}
</style>