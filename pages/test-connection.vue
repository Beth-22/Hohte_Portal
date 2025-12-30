<template>
  <div class="test-page">
    <h1>✅ API Connection Test</h1>
    
    <div class="connection-info">
      <p><strong>Server:</strong> https://staging-hohte.batelew.com</p>
      <p><strong>Status:</strong> <span class="status-good">Connected</span></p>
      <p><strong>Token:</strong> Valid JWT token configured</p>
    </div>

    <div class="test-buttons">
      <button @click="testAll">Test All APIs</button>
      <button @click="goToHome">Go to Home</button>
    </div>

    <div v-if="results.length > 0" class="results">
      <h3>Test Results:</h3>
      <div v-for="(result, index) in results" :key="index" class="result-item" :class="result.status">
        {{ result.endpoint }}: {{ result.message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from '#app'
import { apiService } from '~/services/api.service'

const router = useRouter()
const results = ref([])

const testAll = async () => {
  results.value = []
  
  const tests = [
    { name: 'Profile', method: apiService.getProfile },
    { name: 'Classes', method: apiService.getMyClasses },
    { name: 'Attendance', method: apiService.getAttendanceSummary },
    { name: 'Permission Reasons', method: apiService.getPermissionReasons },
    { name: 'Class Options', method: apiService.getClassOptions },
    { name: 'Permission Requests', method: apiService.getPermissionRequests },
  ]
  
  for (const test of tests) {
    try {
      const data = await test.method()
      results.value.push({
        endpoint: test.name,
        status: 'success',
        message: `✅ Success (${data.length || 'data'} received)`
      })
    } catch (err) {
      results.value.push({
        endpoint: test.name,
        status: 'error',
        message: `❌ ${err.message}`
      })
    }
  }
}

const goToHome = () => {
  router.push('/home')
}

// Auto-test on page load
testAll()
</script>

<style scoped>
.test-page {
  padding: 20px;
  background: #1e3971;
  color: white;
  min-height: 100vh;
}

.connection-info {
  background: #2b4b8f;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
}

.status-good {
  color: #4CAF50;
  font-weight: bold;
}

.test-buttons {
  margin: 20px 0;
}

.test-buttons button {
  padding: 12px 24px;
  background: #ffc125;
  color: #1e3971;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  margin-right: 10px;
  cursor: pointer;
}

.results {
  margin-top: 30px;
}

.result-item {
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.05);
}

.result-item.success {
  border-left: 4px solid #4CAF50;
}

.result-item.error {
  border-left: 4px solid #F44336;
}
</style>