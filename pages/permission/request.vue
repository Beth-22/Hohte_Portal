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
            
            <div class="date-picker-wrapper">
              <div class="date-input-container" @click="toggleSpecificCalendar" ref="specificInputRef">
                <input
                  type="text"
                  :value="formData.specificDate ? formatDateForDisplay(formData.specificDate) : ''"
                  placeholder="Select date"
                  class="date-input"
                  :class="{ error: errors.specificDate }"
                  readonly
                />
                <span class="calendar-icon">📅</span>
              </div>
              
              <!-- Calendar Dropdown -->
              <div v-if="showSpecificCalendar" class="calendar-dropdown" :style="dropdownStyle">
                <div class="custom-calendar">
                  <div class="calendar-header">
                    <button class="calendar-nav" @click="prevMonth">‹</button>
                    <span class="calendar-month">{{ currentMonthName }} {{ currentYear }}</span>
                    <button class="calendar-nav" @click="nextMonth">›</button>
                  </div>
                  <div class="calendar-grid">
                    <div class="calendar-weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
                    <div
                      v-for="day in calendarDays"
                      :key="day.date"
                      class="calendar-day"
                      :class="{
                        'other-month': day.isOtherMonth,
                        'scheduled': day.isScheduled,
                        'selected': day.isSelected,
                        'past': day.isPast,
                        'disabled': day.isDisabled
                      }"
                      @click="selectSpecificDate(day)"
                    >
                      {{ day.day }}
                    </div>
                  </div>
                  <div class="calendar-footer">
                    <button class="clear-calendar-btn" @click="clearSpecificDate">Clear</button>
                  </div>
                </div>
              </div>
            </div>

            <span v-if="errors.specificDate" class="error-message">{{ errors.specificDate }}</span>
            <div class="info-hint">{{ t('requestStatus.dateLimitHint', { maxDate: formatDateForDisplay(maxStartDate) }) }}</div>
          </div>

          <!-- Date Range -->
          <div v-else class="date-range-input">
            <p class="date-hint">{{ t('requestStatus.dateRangeHint') }}</p>
            <div class="range-hint-text">{{ t('requestStatus.rangeLimitHint') }}</div>
            
            <div class="range-calendars">
              <div class="range-field">
                <label class="range-label">{{ t('requestStatus.startDate') }}</label>
                <div class="date-picker-wrapper">
                  <div class="date-input-container" @click="toggleStartCalendar" ref="startInputRef">
                    <input
                      type="text"
                      :value="formData.startDate ? formatDateForDisplay(formData.startDate) : ''"
                      :placeholder="t('requestStatus.startDate')"
                      class="date-input"
                      :class="{ error: errors.startDate }"
                      readonly
                    />
                    <span class="calendar-icon">📅</span>
                  </div>
                  
                  <div v-if="showStartCalendar" class="calendar-dropdown" :style="startDropdownStyle">
                    <div class="custom-calendar">
                      <div class="calendar-header">
                        <button class="calendar-nav" @click="prevRangeMonth('start')">‹</button>
                        <span class="calendar-month">{{ startMonthName }} {{ startYear }}</span>
                        <button class="calendar-nav" @click="nextRangeMonth('start')">›</button>
                      </div>
                      <div class="calendar-grid">
                        <div class="calendar-weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
                        <div
                          v-for="day in startCalendarDays"
                          :key="day.date"
                          class="calendar-day"
                          :class="{
                            'other-month': day.isOtherMonth,
                            'scheduled': day.isScheduled,
                            'selected': day.isSelected,
                            'past': day.isPast,
                            'disabled': day.isDisabled
                          }"
                          @click="selectStartDate(day)"
                        >
                          {{ day.day }}
                        </div>
                      </div>
                      <div class="calendar-footer">
                        <button class="clear-calendar-btn" @click="clearStartDate">Clear</button>
                      </div>
                    </div>
                  </div>
                </div>
                <span v-if="errors.startDate" class="error-message">{{ errors.startDate }}</span>
              </div>

              <div class="range-field">
                <label class="range-label">{{ t('requestStatus.endDate') }}</label>
                <div class="date-picker-wrapper">
                  <div class="date-input-container" @click="toggleEndCalendar" ref="endInputRef">
                    <input
                      type="text"
                      :value="formData.endDate ? formatDateForDisplay(formData.endDate) : ''"
                      :placeholder="t('requestStatus.endDate')"
                      class="date-input"
                      :class="{ error: errors.endDate }"
                      readonly
                    />
                    <span class="calendar-icon">📅</span>
                  </div>
                  
                  <div v-if="showEndCalendar" class="calendar-dropdown" :style="endDropdownStyle">
                    <div class="custom-calendar">
                      <div class="calendar-header">
                        <button class="calendar-nav" @click="prevRangeMonth('end')">‹</button>
                        <span class="calendar-month">{{ endMonthName }} {{ endYear }}</span>
                        <button class="calendar-nav" @click="nextRangeMonth('end')">›</button>
                      </div>
                      <div class="calendar-grid">
                        <div class="calendar-weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
                        <div
                          v-for="day in endCalendarDays"
                          :key="day.date"
                          class="calendar-day"
                          :class="{
                            'other-month': day.isOtherMonth,
                            'scheduled': day.isScheduled,
                            'selected': day.isSelected,
                            'past': day.isPast,
                            'disabled': day.isDisabled
                          }"
                          @click="selectEndDate(day)"
                        >
                          {{ day.day }}
                        </div>
                      </div>
                      <div class="calendar-footer">
                        <button class="clear-calendar-btn" @click="clearEndDate">Clear</button>
                      </div>
                    </div>
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
    
    <!-- Extra spacer when calendar is open to allow scrolling -->
    <div v-if="showSpecificCalendar || showStartCalendar || showEndCalendar" class="calendar-spacer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import { useNavigation } from '~/composables/useNavigation'
import { useStudentData } from '~/composables/useStudentData'
import { useToast } from '~/composables/useToast'
import { useSchool } from '~/composables/useSchool'
import { apiService } from '~/services/api.service'
import ToastNotification from '~/components/ToastNotification.vue'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, isAfter, addMonths, subMonths, startOfWeek, endOfWeek, getDate, getMonth, getYear } from 'date-fns'

const { locale, t, setLocale } = useLanguage()
const { goBack } = useNavigation()
const { 
  classOptions, 
  submitPermissionRequest,
  fetchClassOptions,
  fetchClasses,
  isLoading 
} = useStudentData()
const { getSchoolLogo, getSchoolName } = useSchool()

const { toasts, success, error: showError, removeToast } = useToast()

const durationType = ref('specific')
const isSubmitting = ref(false)
const scheduleDays = ref([])
const showSpecificCalendar = ref(false)
const showStartCalendar = ref(false)
const showEndCalendar = ref(false)

// Refs for input elements
const specificInputRef = ref(null)
const startInputRef = ref(null)
const endInputRef = ref(null)

// Dropdown position styles
const dropdownStyle = ref({})
const startDropdownStyle = ref({})
const endDropdownStyle = ref({})

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

// Calendar state
const currentMonth = ref(new Date())
const startMonth = ref(new Date())
const endMonth = ref(new Date())

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Get today's date
const getTodayLocal = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Format date for display
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

// Add 6 calendar months
const addSixMonths = (dateString) => {
  if (!dateString) return null
  const date = new Date(dateString)
  date.setMonth(date.getMonth() + 6)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const maxStartDate = computed(() => {
  return addSixMonths(minDate.value)
})

const maxEndDate = computed(() => {
  if (durationType.value === 'range' && formData.value.startDate) {
    return addSixMonths(formData.value.startDate)
  }
  return addSixMonths(minDate.value)
})

// Format schedule days
const formatScheduleDays = computed(() => {
  if (!scheduleDays.value || scheduleDays.value.length === 0) return ''
  return scheduleDays.value.join(', ')
})

// Get day name
const getDayName = (dayNumber) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayNumber]
}

// Check if date is scheduled
const isScheduledDate = (date) => {
  if (!scheduleDays.value || scheduleDays.value.length === 0) return false
  const dayName = getDayName(date.getDay())
  return scheduleDays.value.includes(dayName)
}

// Get calendar days
const getCalendarDays = (monthDate) => {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 })
  
  return eachDayOfInterval({ start, end }).map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isPast = isBefore(date, new Date()) && !isToday(date)
    const isScheduled = isScheduledDate(date)
    const isSelected = dateStr === formData.value.specificDate
    
    const maxDate = new Date(maxStartDate.value)
    const isDisabled = isPast || isAfter(date, maxDate)
    
    return {
      date: dateStr,
      day: getDate(date),
      isOtherMonth: !isSameMonth(date, monthDate),
      isScheduled: isScheduled,
      isSelected: isSelected,
      isPast: isPast,
      isDisabled: isDisabled,
      fullDate: date
    }
  })
}

// Get range calendar days
const getRangeCalendarDays = (monthDate, selectedDate) => {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 })
  
  return eachDayOfInterval({ start, end }).map(date => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isPast = isBefore(date, new Date()) && !isToday(date)
    const isScheduled = isScheduledDate(date)
    const isSelected = dateStr === selectedDate
    
    let isDisabled = isPast
    
    if (selectedDate === formData.value.startDate) {
      if (isBefore(date, new Date(minDate.value)) || isAfter(date, new Date(maxStartDate.value))) {
        isDisabled = true
      }
    }
    
    if (selectedDate === formData.value.endDate) {
      if (formData.value.startDate) {
        if (isBefore(date, new Date(formData.value.startDate)) || isAfter(date, new Date(maxEndDate.value))) {
          isDisabled = true
        }
      } else {
        if (isBefore(date, new Date(minDate.value)) || isAfter(date, new Date(maxStartDate.value))) {
          isDisabled = true
        }
      }
    }
    
    return {
      date: dateStr,
      day: getDate(date),
      isOtherMonth: !isSameMonth(date, monthDate),
      isScheduled: isScheduled,
      isSelected: isSelected,
      isPast: isPast,
      isDisabled: isDisabled,
      fullDate: date
    }
  })
}

// Specific date calendar
const currentMonthName = computed(() => {
  return format(currentMonth.value, 'MMMM')
})

const currentYear = computed(() => {
  return getYear(currentMonth.value)
})

const calendarDays = computed(() => {
  return getCalendarDays(currentMonth.value)
})

// Range calendar
const startMonthName = computed(() => {
  return format(startMonth.value, 'MMMM')
})

const startYear = computed(() => {
  return getYear(startMonth.value)
})

const endMonthName = computed(() => {
  return format(endMonth.value, 'MMMM')
})

const endYear = computed(() => {
  return getYear(endMonth.value)
})

const startCalendarDays = computed(() => {
  return getRangeCalendarDays(startMonth.value, formData.value.startDate)
})

const endCalendarDays = computed(() => {
  return getRangeCalendarDays(endMonth.value, formData.value.endDate)
})

// Toggle calendars - using absolute positioning
const toggleSpecificCalendar = (event) => {
  if (showSpecificCalendar.value) {
    showSpecificCalendar.value = false
    return
  }
  
  const rect = event.currentTarget.getBoundingClientRect()
  const parentRect = event.currentTarget.closest('.date-picker-wrapper').getBoundingClientRect()
  
  dropdownStyle.value = {
    position: 'absolute',
    top: '100%',
    left: '0',
    width: '100%',
    zIndex: 9999,
    marginTop: '4px'
  }
  showSpecificCalendar.value = true
}

const toggleStartCalendar = (event) => {
  if (showStartCalendar.value) {
    showStartCalendar.value = false
    return
  }
  
  dropdownStyle.value = {
    position: 'absolute',
    top: '100%',
    left: '0',
    width: '100%',
    zIndex: 9999,
    marginTop: '4px'
  }
  showStartCalendar.value = true
}

const toggleEndCalendar = (event) => {
  if (showEndCalendar.value) {
    showEndCalendar.value = false
    return
  }
  
  dropdownStyle.value = {
    position: 'absolute',
    top: '100%',
    left: '0',
    width: '100%',
    zIndex: 9999,
    marginTop: '4px'
  }
  showEndCalendar.value = true
}

// Clear functions
const clearSpecificDate = () => {
  formData.value.specificDate = ''
  errors.value.specificDate = ''
  showSpecificCalendar.value = false
}

const clearStartDate = () => {
  formData.value.startDate = ''
  errors.value.startDate = ''
  showStartCalendar.value = false
}

const clearEndDate = () => {
  formData.value.endDate = ''
  errors.value.endDate = ''
  showEndCalendar.value = false
}

const closeDropdowns = () => {
  showSpecificCalendar.value = false
  showStartCalendar.value = false
  showEndCalendar.value = false
}

// Navigation
const prevMonth = () => {
  currentMonth.value = subMonths(currentMonth.value, 1)
}

const nextMonth = () => {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

const prevRangeMonth = (type) => {
  if (type === 'start') {
    startMonth.value = subMonths(startMonth.value, 1)
  } else {
    endMonth.value = subMonths(endMonth.value, 1)
  }
}

const nextRangeMonth = (type) => {
  if (type === 'start') {
    startMonth.value = addMonths(startMonth.value, 1)
  } else {
    endMonth.value = addMonths(endMonth.value, 1)
  }
}

// Date selection
const selectSpecificDate = (day) => {
  if (day.isDisabled || day.isPast) return
  formData.value.specificDate = day.date
  showSpecificCalendar.value = false
  validateSpecificDate()
}

const selectStartDate = (day) => {
  if (day.isDisabled || day.isPast) return
  formData.value.startDate = day.date
  showStartCalendar.value = false
  validateStartDate()
}

const selectEndDate = (day) => {
  if (day.isDisabled || day.isPast) return
  formData.value.endDate = day.date
  showEndCalendar.value = false
  validateEndDate()
}

// Get scheduled dates in range
const getScheduledDatesInRange = computed(() => {
  if (!scheduleDays.value || scheduleDays.value.length === 0) return []
  if (!formData.value.startDate || !formData.value.endDate) return []
  
  const dates = []
  const start = new Date(formData.value.startDate)
  const end = new Date(formData.value.endDate)
  
  let currentDate = new Date(start)
  
  while (currentDate <= end) {
    if (isScheduledDate(currentDate)) {
      dates.push(format(currentDate, 'yyyy-MM-dd'))
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
})

// Load schedule for selected class
const loadClassSchedule = async (classId) => {
  try {
    if (!classId) {
      scheduleDays.value = []
      return
    }
    
    console.log('Loading schedule for class:', classId)
    
    const response = await apiService.request(`/api/v1/student/classes/${classId}`)
    
    console.log('Class API response:', response)
    
    if (response && response.schedules && Array.isArray(response.schedules)) {
      const days = response.schedules
        .map(s => s.day_of_week)
        .filter(Boolean)
      
      scheduleDays.value = days
      console.log('✅ Schedule days loaded:', days)
    } else {
      scheduleDays.value = []
      console.log('No schedules found in response')
    }
  } catch (err) {
    console.error('Failed to load class schedule:', err)
    scheduleDays.value = []
  }
}

// Handle class change
const onClassChange = () => {
  if (formData.value.course) {
    loadClassSchedule(formData.value.course)
  }
}

// Validation functions
const validateSpecificDate = () => {
  if (formData.value.specificDate && formData.value.specificDate < minDate.value) {
    errors.value.specificDate = t('requestStatus.errors.dateCannotBePast')
    return false
  }
  if (formData.value.specificDate && maxStartDate.value && formData.value.specificDate > maxStartDate.value) {
    errors.value.specificDate = t('requestStatus.errors.dateExceedsSixMonths', { maxDate: formatDateForDisplay(maxStartDate.value) })
    return false
  }
  if (formData.value.specificDate && !isScheduledDate(new Date(formData.value.specificDate))) {
    errors.value.specificDate = t('requestStatus.errors.notScheduledDay')
    return false
  }
  errors.value.specificDate = ''
  return true
}

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
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.date-picker-wrapper')) {
        closeDropdowns()
      }
    })
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
  align-items: flex-start;
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
  overflow: visible !important;
  margin-bottom: 40px;
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
  overflow: visible !important;
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
  overflow: visible !important;
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
  overflow: visible !important;
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

/* Date Picker Wrapper */
.date-picker-wrapper {
  position: relative;
  overflow: visible !important;
}

.date-input-container {
  position: relative;
  cursor: pointer;
}

.date-input {
  width: 100%;
  padding: 12px 45px 12px 15px;
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

.calendar-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
}

/* Calendar Dropdown - Now position: absolute */
.calendar-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-width: 280px;
  max-height: 380px;
  overflow-y: auto;
  z-index: 9999;
  margin-top: 4px;
}

.custom-calendar {
  background: white;
  border-radius: 8px;
  padding: 12px;
  min-width: 250px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.calendar-nav {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #1e3971;
  padding: 4px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.calendar-nav:hover {
  background: rgba(30, 57, 113, 0.1);
}

.calendar-month {
  font-weight: 600;
  color: #1e3971;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  padding: 4px 0;
}

.calendar-day {
  position: relative;
  text-align: center;
  padding: 8px 4px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
}

.calendar-day:hover:not(.disabled):not(.past) {
  background: rgba(255, 193, 37, 0.2);
}

.calendar-day.other-month {
  color: #ccc;
}

.calendar-day.scheduled {
  color: #1e3971;
  font-weight: 500;
}

.calendar-day.scheduled::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #FFC125;
  border: 1px solid #FFC125;
}

.calendar-day.selected {
  background: #FFC125;
  color: #1e3971 !important;
  font-weight: 600;
}

.calendar-day.selected::after {
  background: #1e3971;
  border-color: #1e3971;
}

.calendar-day.past {
  color: #ccc;
  cursor: not-allowed;
}

.calendar-day.disabled {
  color: #e0e0e0;
  cursor: not-allowed;
}

.calendar-day.disabled.scheduled::after {
  background: #e0e0e0;
  border-color: #e0e0e0;
}

.calendar-footer {
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px solid #eee;
  text-align: left;
}

.clear-calendar-btn {
  background: none;
  border: none;
  color: #1e3971;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  transition: color 0.2s;
}

.clear-calendar-btn:hover {
  color: #ff3b30;
  text-decoration: underline;
}

/* Range Calendar */
.range-calendars {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .range-calendars {
    grid-template-columns: 1fr;
  }
}

.range-field .range-label {
  display: block;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.range-field .calendar-dropdown {
  min-width: 250px;
}

.range-field .custom-calendar {
  min-width: 200px;
}

.range-field .calendar-day {
  padding: 6px 2px;
  font-size: 12px;
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

/* Calendar Spacer - pushes page down when calendar is open */
.calendar-spacer {
  height: 400px;
  width: 100%;
  flex-shrink: 0;
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
  
  .custom-calendar {
    padding: 8px;
  }
  
  .calendar-day {
    padding: 6px 2px;
    font-size: 12px;
  }
  
  .calendar-dropdown {
    min-width: 200px;
  }
  
  .calendar-spacer {
    height: 250px;
  }
}
</style>