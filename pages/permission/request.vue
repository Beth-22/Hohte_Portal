<template>
  <div class="permission-request">
    <div class="form-card">
      <div class="header-section">
        <button class="back-button" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <h1 class="page-title">{{ t('requestStatus.newRequest') }}</h1>
        <div class="language-toggle" @click="toggleLanguage">
          <span>{{ locale === 'en' ? 'አማ' : 'EN' }}</span>
        </div>
      </div>

      <div class="form-section">
        <div class="form-row">
          <div class="form-field">
            <div class="field-header">
              <span class="field-label">{{ t('requestStatus.class') }}</span>
            </div>
            <select v-model="formData.course" class="select-input">
              <option value="" disabled selected>{{ t('requestStatus.selectClass') }}</option>
              <option
                v-for="course in courses"
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
              <option v-for="reason in reasons" :key="reason.value" :value="reason.value">
                {{ locale === 'en' ? reason.en : reason.am }}
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
import { ref, onMounted } from 'vue'
import { useLanguage } from '~/composables/useLanguage'
import { useNavigation } from '~/composables/useNavigation'
import { useStudentData } from '~/composables/useStudentData'

const { locale, t, setLocale } = useLanguage()
const { goBack } = useNavigation()
const { courses, submitPermissionRequest } = useStudentData()

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

const reasons = [
  { value: 'sickness', en: 'Sickness', am: 'ህመም' },
  { value: 'family', en: 'Family Emergency', am: 'የቤተሰብ አስቸኳይ ጉዳይ' },
  { value: 'work', en: 'Work', am: 'ስራ' },
  { value: 'travel', en: 'Travel', am: 'ጉዞ' },
  { value: 'other', en: 'Other', am: 'ሌላ' }
]

const toggleLanguage = () => {
  const newLocale = locale.value === 'en' ? 'am' : 'en'
  setLocale(newLocale)
}

const submitForm = async () => {
  if (!formData.value.course || !formData.value.reason) {
    alert(t('requestStatus.requiredFields'))
    return
  }

  if (durationType.value === 'specific' && !formData.value.specificDate) {
    alert(t('requestStatus.requiredDate'))
    return
  }

  if (durationType.value === 'range' && (!formData.value.startDate || !formData.value.endDate)) {
    alert(t('requestStatus.requiredDates'))
    return
  }

  const selectedCourse = courses.value.find(c => c.id === formData.value.course)
  
  const requestData = {
    title: selectedCourse?.name || '',
    course: selectedCourse?.name || '',
    courseId: formData.value.course,
    reason: formData.value.reason,
    note: formData.value.note,
    durationType: durationType.value,
    specificDate: formData.value.specificDate,
    startDate: formData.value.startDate,
    endDate: formData.value.endDate,
    submittedDate: new Date().toISOString().split('T')[0],
    classDate: new Date().toLocaleDateString(locale.value, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  try {
    isSubmitting.value = true
    const result = await submitPermissionRequest(requestData)
    
    if (result.success) {
      alert(t('requestStatus.submissionSuccess'))
      goBack()
    } else {
      alert(result.error || t('requestStatus.submissionFailed'))
    }
  } catch (error) {
    alert(t('requestStatus.submissionFailed'))
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  const today = new Date().toISOString().split('T')[0]
  formData.value.specificDate = today
  formData.value.startDate = today
  formData.value.endDate = today
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
}

.form-card {
  background-color: #1e3971;
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 800px;
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

.language-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: white;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.language-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
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
  margin-top: 40px;
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
}
</style>