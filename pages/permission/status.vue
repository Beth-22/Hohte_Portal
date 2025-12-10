<template>
  <div class="requests-container">
    <header class="requests-header">
      <div class="logo-center">
        <img
          src="~/assets/images/logo2-modified.png"
          alt="HOHTE Logo"
          class="logo-image"
        />
      </div>

      <div class="header-content">
        <button class="back-button" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <h1 class="page-title">{{ t('requestStatus.title') }}</h1>

        <div class="header-right">
          <button class="language-toggle" @click="toggleLanguage">
            <span>{{ locale === 'en' ? 'አማ' : 'EN' }}</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <div class="filter-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <main class="requests-main">
      <div v-if="filteredRequests.length === 0" class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>{{ t('requestStatus.noRequests') }}</h3>
        <p>{{ t('requestStatus.noRequestsDesc') }}</p>
      </div>

      <div v-else class="requests-list">
        <div
          v-for="request in filteredRequests"
          :key="request.id"
          class="request-card"
          :class="request.status.toLowerCase()"
        >
          <div class="request-header">
            <div class="course-icon">
              <span>{{ getCourseIcon(request.course) }}</span>
            </div>
            <div class="request-info">
              <h3 class="request-title">{{ request.title }}</h3>
              <p class="course-name">{{ request.course }}</p>
            </div>
            <div class="request-status" :class="request.status.toLowerCase()">
              <span class="status-text">{{ getStatusText(request.status) }}</span>
              <div class="status-icon">
                <svg
                  v-if="request.status === 'PENDING'"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="2"/>
                  <path d="M8 4V8L10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <svg
                  v-else-if="request.status === 'APPROVED'"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path d="M13.3333 4L6.00001 11.3333L2.66668 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <svg
                  v-else
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="request-details">
            <div class="detail-row">
              <span class="detail-label">{{ t('requestStatus.submitted') }}:</span>
              <span class="detail-value">{{ request.submittedDate }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">{{ t('requestStatus.classDate') }}:</span>
              <span class="detail-value">{{ request.classDate }}</span>
            </div>
            <div
              v-if="request.status === 'DENIED' && request.reason"
              class="reason-row"
            >
              <span class="reason-label">{{ t('requestStatus.reason') }}:</span>
              <span class="reason-text">{{ request.reason }}</span>
            </div>
            <div
              v-else-if="request.status === 'APPROVED' && request.approvedBy"
              class="reason-row"
            >
              <span class="reason-label">{{ t('requestStatus.approvedBy') }}:</span>
              <span class="reason-text">{{ request.approvedBy }}</span>
            </div>
          </div>

          <div class="request-footer">
            <div class="footer-left">
              <div
                v-if="request.status === 'PENDING'"
                class="pending-indicator"
              >
                <span class="pending-dot"></span>
                <span>{{ t('requestStatus.underReview') }}</span>
              </div>
              <div
                v-else-if="request.status === 'APPROVED'"
                class="approved-time"
              >
                <span>{{ t('requestStatus.approvedOn') }} {{ request.approvedDate || request.updatedAt }}</span>
              </div>
              <div v-else class="denied-time">
                <span>{{ t('requestStatus.deniedOn') }} {{ request.deniedDate || request.updatedAt }}</span>
              </div>
            </div>
            <div class="footer-right">
              <button
                v-if="request.status === 'PENDING'"
                class="cancel-button"
                @click="cancelRequest(request.id)"
                :disabled="isCancelling"
              >
                {{ isCancelling ? t('requestStatus.cancelling') : t('requestStatus.cancel') }}
              </button>
              <button
                v-else-if="request.status === 'DENIED'"
                class="resubmit-button"
                @click="resubmitRequest(request)"
              >
                {{ t('requestStatus.resubmit') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="new-request-section">
        <button class="new-request-button" @click="goToPermissionRequest">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          {{ t('requestStatus.newRequest') }}
        </button>
      </div>
    </main>

    <div
      v-if="showCancelModal"
      class="modal-overlay"
      @click.self="showCancelModal = false"
    >
      <div class="modal-content">
        <h3>{{ t('requestStatus.cancelRequest') }}</h3>
        <p>{{ t('requestStatus.cancelConfirm') }}</p>
        <div class="modal-actions">
          <button class="modal-cancel" @click="showCancelModal = false">
            {{ t('common.no') }}
          </button>
          <button class="modal-confirm" @click="confirmCancel">
            {{ t('common.yes') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useLanguage } from "~/composables/useLanguage";
import { useNavigation } from "~/composables/useNavigation";
import { useStudentData } from "~/composables/useStudentData";

const { locale, t, setLocale } = useLanguage();
const { goBack, goToPermissionRequest } = useNavigation();
const { permissionRequests, cancelPermissionRequest, pendingRequestsCount } = useStudentData();

const activeTab = ref("all");
const showCancelModal = ref(false);
const isCancelling = ref(false);
let requestToCancel = null;

const tabs = computed(() => [
  { id: "all", label: t("requestStatus.tabs.all") },
  { id: "pending", label: t("requestStatus.tabs.pending") },
  { id: "approved", label: t("requestStatus.tabs.approved") },
  { id: "denied", label: t("requestStatus.tabs.denied") },
]);

const filteredRequests = computed(() => {
  if (activeTab.value === "all") {
    return permissionRequests.value;
  }
  return permissionRequests.value.filter(
    (request) => request.status.toLowerCase() === activeTab.value
  );
});

const toggleLanguage = () => {
  const newLocale = locale.value === "en" ? "am" : "en";
  setLocale(newLocale);
};

const getStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return t("requestStatus.tabs.pending");
    case "APPROVED":
      return t("requestStatus.tabs.approved");
    case "DENIED":
      return t("requestStatus.tabs.denied");
    default:
      return status;
  }
};

const getCourseIcon = (courseName) => {
  const icons = {
    "Media Kifi": "🎬",
    "Kedamay Course": "📚",
    "Abalat Kifi": "🎵",
    "General Studies": "📖",
  };
  return icons[courseName] || "📝";
};

const cancelRequest = (id) => {
  requestToCancel = id;
  showCancelModal.value = true;
};

const confirmCancel = async () => {
  if (requestToCancel) {
    isCancelling.value = true;
    try {
      const result = await cancelPermissionRequest(requestToCancel);
      if (result.success) {
        alert(t('requestStatus.cancelledSuccess'));
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert(t('requestStatus.cancellationFailed'));
    } finally {
      isCancelling.value = false;
      showCancelModal.value = false;
      requestToCancel = null;
    }
  }
};

const resubmitRequest = (request) => {
  if (confirm(t('requestStatus.resubmitMessage', { title: request.title }))) {
    goToPermissionRequest();
  }
};

onMounted(() => {
  console.log('Permission requests loaded:', permissionRequests.value.length);
});
</script>

<style scoped>
.requests-container {
  min-height: 100vh;
  background: #1e3971;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  padding-bottom: 80px;
}

.requests-header {
  background: #1e3971;
  padding: 20px 20px 16px;
  color: white;
}

.logo-center {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
}

.logo-image {
  width: 90px;
  height: 90px;
  object-fit: contain;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  font-weight: 700;
  margin: 0;
  color: white;
  text-align: center;
  flex: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
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
}

.language-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
}

.filter-tabs {
  display: flex;
  padding: 16px 20px;
  background: #1e3971;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  gap: 4px;
}

.tab-button {
  flex: 1;
  padding: 12px 8px;
  border: none;
  background: #2b4b8f;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
  border-radius: 8px 8px 0 0;
}

.tab-button:hover {
  background: #3a5bb5;
}

.tab-button.active {
  background: #ffc125;
  color: #1e3971;
  border-bottom-color: #ffc125;
  font-weight: 600;
}

.requests-main {
  padding: 20px;
  padding-bottom: 100px;
  background: #1e3971;
  min-height: calc(100vh - 200px);
  border-radius: 24px 24px 0 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #2b4b8f;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #a0b3d9;
  font-size: 14px;
  margin: 0;
}

.requests-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.request-card {
  background: #2b4b8f;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #1e3971;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.request-card.pending {
  border-left-color: #ffc125;
}

.request-card.approved {
  border-left-color: #4cd964;
}

.request-card.denied {
  border-left-color: #ff3b30;
}

.request-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.course-icon {
  width: 48px;
  height: 48px;
  background: #1e3971;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.request-card.pending .course-icon {
  background: #ffc125;
}

.request-card.approved .course-icon {
  background: #4cd964;
}

.request-card.denied .course-icon {
  background: #ff3b30;
}

.request-info {
  flex: 1;
}

.request-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.course-name {
  font-size: 14px;
  color: #fbf5f5;
  margin: 0;
}

.request-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.request-status.pending {
  background: #fff3e0;
  color: #ff9800;
}

.request-status.approved {
  background: #e8f5e9;
  color: #4caf50;
}

.request-status.denied {
  background: #ffebee;
  color: #f44336;
}

.status-icon {
  display: flex;
  align-items: center;
}

.request-details {
  padding: 16px;
  background: #1e3971;
  border-radius: 12px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #ffffff;
  font-weight: 500;
}

.detail-value {
  color: #fcfcfc;
  font-weight: 500;
}

.reason-row {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8ecf1;
  font-size: 14px;
}

.reason-label {
  color: #ffffff;
  font-weight: 500;
  white-space: nowrap;
}

.reason-text {
  color: #ffffff;
  flex: 1;
  line-height: 1.5;
}

.request-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e8ecf1;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #a0b3d9;
}

.pending-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ff9800;
  font-weight: 500;
}

.pending-dot {
  width: 8px;
  height: 8px;
  background: #ff9800;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

.approved-time {
  color: #4caf50;
}

.denied-time {
  color: #f44336;
}

.footer-right {
  display: flex;
  gap: 8px;
}

.cancel-button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffebee;
  color: #f44336;
}

.cancel-button:hover:not(:disabled) {
  background: #f44336;
  color: white;
}

.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.resubmit-button {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #e3f2fd;
  color: #1976d2;
}

.resubmit-button:hover {
  background: #1976d2;
  color: white;
}

.new-request-section {
  position: fixed;
  bottom: 80px;
  left: 20px;
  right: 20px;
  z-index: 100;
}

.new-request-button {
  width: 100%;
  padding: 16px;
  background: #ffc125;
  border: none;
  border-radius: 16px;
  color: #1e3971;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(30, 57, 113, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.new-request-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(30, 57, 113, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.modal-content p {
  color: #666;
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-cancel {
  background: #f0f2f5;
  color: #666;
}

.modal-cancel:hover {
  background: #e4e6e9;
}

.modal-confirm {
  background: #f44336;
  color: white;
}

.modal-confirm:hover {
  background: #d32f2f;
}

@media (max-width: 480px) {
  .requests-header {
    padding: 16px 16px 12px;
  }

  .logo-image {
    width: 70px;
    height: 70px;
  }

  .page-title {
    font-size: 20px;
  }

  .requests-main {
    padding: 16px;
    padding-bottom: 100px;
  }

  .filter-tabs {
    padding: 12px 16px;
  }

  .tab-button {
    font-size: 12px;
    padding: 10px 4px;
  }

  .request-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .footer-right {
    justify-content: flex-end;
  }

  .new-request-section {
    left: 16px;
    right: 16px;
    bottom: 70px;
  }
}
</style>