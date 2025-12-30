<template>
  <div class="permission-request">
    <!-- Toast Notifications -->
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

    <!-- Logo at the top -->
    <div class="logo-top">
      <div class="logo-container">
        <img
          src="~/assets/images/logo2-modified.png"
          alt="HOHTE Logo"
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

      <!-- Rest of your template remains the same -->
      <div class="form-section">
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <span class="field-label">{{ t('requestStatus.class') }}</span>
            </div>
            <select v-model="formData.course" class="select-input">
              <option value="" disabled selected>{{ t('requestStatus.selectClass') }}</option>
              <option
                v-for="course in classOptions"
                :key="course.id"
                :value="course.id"
              >
                {{ course.name }}
              </option>
            </select>
          </div>

          <div class="form-field">
            <div class="field-header">
              <span class="field-label">{{ t('requestStatus.reason') }}</span>
            </div>
            <select v-model="formData.reason" class="select-input">
              <option value="" disabled selected>{{ t('requestStatus.selectReason') }}</option>
              <option v-for="reason in permissionReasons" :key="reason.value" :value="reason.value">
                {{ t(`permissionReasons.${reason.translationKey}`) }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="note-section">
        <div class="field-header">
          <span class="field-label">{{ t('requestStatus.note') }}:</span>
        </div>
        <p class="note-hint">{{ t('requestStatus.noteHint') }}</p>
        <textarea
          v-model="formData.note"
          class="note-textarea"
          rows="3"
          :placeholder="t('requestStatus.notePlaceholder')"
        ></textarea>
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

        <div class="date-input-section">
          <div v-if="durationType === 'specific'" class="single-date-input">
            <p class="date-hint">{{ t('requestStatus.singleDateHint') }}</p>
            <input
              type="date"
              v-model="formData.specificDate"
              class="date-input"
            />
          </div>

          <div v-else class="date-range-input">
            <p class="date-hint">{{ t('requestStatus.dateRangeHint') }}</p>
            <div class="range-inputs">
              <div class="range-field">
                <input
                  type="date"
                  v-model="formData.startDate"
                  :placeholder="t('requestStatus.startDate')"
                  class="date-input"
                />
              </div>
              <div class="range-field">
                <input
                  type="date"
                  v-model="formData.endDate"
                  :placeholder="t('requestStatus.endDate')"
                  class="date-input"
                />
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
import { ref, onMounted, watch } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import { useNavigation } from '~/composables/useNavigation'
import { useStudentData } from '~/composables/useStudentData'
import { useToast } from '~/composables/useToast'
import ToastNotification from '~/components/ToastNotification.vue'

const { locale, t, setLocale } = useLanguage()
const { goBack } = useNavigation()
const { 
  classOptions, 
  permissionReasons, 
  submitPermissionRequest,
  fetchClassOptions,
  fetchPermissionReasons,
  isLoading 
} = useStudentData()

const { toasts, success, error: showError, removeToast } = useToast()

const durationType = ref('specific')
const isSubmitting = ref(false)
const formData = ref({
  course: '',
  reason: '',
  note: '',
  specificDate: '',
  startDate: '',
  endDate: ''
})

// Add logo error handling
const handleLogoError = () => {
  console.error('Logo image failed to load')
}

watch(permissionReasons, (newReasons) => {
  console.log('Permission reasons updated:', newReasons)
  if (newReasons.length > 0) {
    console.log('First reason translation:', t(`permissionReasons.${newReasons[0].translationKey}`))
  }
})

watch(classOptions, (newOptions) => {
  console.log('Class options updated:', newOptions)
})

const submitForm = async () => {
  // Validation
  if (!formData.value.course || !formData.value.reason) {
    showError(t('requestStatus.requiredFields'), 3000)
    return
  }

  if (durationType.value === 'specific' && !formData.value.specificDate) {
    showError(t('requestStatus.requiredDate'), 3000)
    return
  }

  if (durationType.value === 'range' && (!formData.value.startDate || !formData.value.endDate)) {
    showError(t('requestStatus.requiredDates'), 3000)
    return
  }

  const selectedCourse = classOptions.value.find(c => c.id === formData.value.course)
  const selectedReason = permissionReasons.value.find(r => r.value === formData.value.reason)
  
  const reasonText = selectedReason ? t(`permissionReasons.${selectedReason.translationKey}`) : t('requestStatus.samples.sickness')
  
  const requestData = {
    title: reasonText,
    course: selectedCourse?.name || 'Class',
    courseId: formData.value.course,
    reason: reasonText,
    note: formData.value.note,
    durationType: durationType.value,
    specificDate: formData.value.specificDate,
    startDate: formData.value.startDate,
    endDate: formData.value.endDate,
    reasonId: formData.value.reason
  }

  console.log('Submitting request data:', requestData)

  try {
    isSubmitting.value = true
    const result = await submitPermissionRequest(requestData)
    
    if (result.success) {
      // Show success toast
      success(t('requestStatus.submissionSuccess'), 3000)
      
      // Wait a bit for toast to show, then go back
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
  const today = new Date().toISOString().split('T')[0]
  formData.value.specificDate = today
  formData.value.startDate = today
  formData.value.endDate = today

  console.log('Permission request page mounted')

  // Fetch dynamic data with error handling
  try {
    await Promise.all([
      fetchClassOptions(),
      fetchPermissionReasons()
    ])
    console.log('Data fetched successfully')
    
    // Set default values if available
    if (classOptions.value.length > 0) {
      formData.value.course = classOptions.value[0].id
    }
    if (permissionReasons.value.length > 0) {
      formData.value.reason = permissionReasons.value[0].value
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

/* Logo at the top */
.logo-top {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  margin-top: 20px;
}

.logo-container {
  width: 250px;
  height: 250px;
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
}

.field-header {
  margin-bottom: 8px;
}

.field-label {
  font-weight: bold;
  color: #ffffff;
  font-size: 16px;
}

.select-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
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

.note-section {
  margin-bottom: 35px;
}

.note-hint {
  font-size: 14px;
  color: #afadad;
  margin: 8px 0 15px 0;
  font-style: italic;
}

.note-textarea {
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

.note-textarea:focus {
  border-color: #FFC125;
  box-shadow: 0 0 0 3px rgba(255, 193, 37, 0.1);
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

.date-input-section {
  margin-top: 20px;
}

.date-hint {
  font-size: 14px;
  color: #b1afaf;
  margin-bottom: 15px;
  font-style: italic;
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
}

.date-input:focus {
  border-color: #FFC125;
  box-shadow: 0 0 0 3px rgba(255, 193, 37, 0.1);
}

.date-input::placeholder {
  color: #aba9a9;
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
}

.range-field {
  width: 100%;
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
</style>