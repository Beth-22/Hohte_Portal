// Centralized Configuration for Schools
const TENANT_CONFIG = {
  hohte: {
    baseURL: "https://hohte.batelew.com",
    name: "HOHTE",
    logo: "logo2-modified.png",
  },
  fikure: {
    baseURL: "https://fikure.batelew.com",
    name: "FIKURE",
    logo: "logo2-modified.png", // Update this when you have the Fikure logo
  }
};

export class ApiService {
  constructor() {
    this.tenant = 'hohte'; // Default
    this.baseURL = TENANT_CONFIG.hohte.baseURL;
    this.token = null;
    
    if (process.client) {
      // 1. Check URL for ?school=xxx (This is the "Source of Truth")
      const urlParams = new URLSearchParams(window.location.search);
      const schoolParam = urlParams.get('school');

      if (schoolParam && TENANT_CONFIG[schoolParam]) {
        this.tenant = schoolParam;
        localStorage.setItem('active_tenant', schoolParam);
      } else {
        // 2. Fallback to last used tenant
        this.tenant = localStorage.getItem('active_tenant') || 'hohte';
      }

      this.baseURL = TENANT_CONFIG[this.tenant].baseURL;
      // 3. Load namespaced token (e.g., hohte_auth_token)
      this.token = localStorage.getItem(`${this.tenant}_auth_token`);
    }

    console.log(`🚀 API Service: ${this.tenant.toUpperCase()} Mode Active`);
    console.log(`🔗 Backend: ${this.baseURL}`);
  }

  getTenantInfo() {
    return TENANT_CONFIG[this.tenant];
  }

  setToken(token) {
    this.token = token;
    if (process.client) {
      localStorage.setItem(`${this.tenant}_auth_token`, token);
    }
  }

  clearToken() {
    this.token = null;
    if (process.client) {
      localStorage.removeItem(`${this.tenant}_auth_token`);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const config = { ...options, headers };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        
        // Specific error handling for Telegram Login
        if (endpoint.includes('/auth/telegram/login')) {
          if (response.status === 404 || response.status === 401) {
            throw new Error(`HTTP ${response.status}: User not linked. Please share contact.`);
          }
        }

        let errorData;
        try { 
          errorData = JSON.parse(errorText); 
        } catch { 
          errorData = { message: `HTTP ${response.status}: ${errorText || "Error"}` }; 
        }

        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ API Request failed:", error);
      throw error;
    }
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  async telegramLogin(initData) {
    return this.request("/api/v1/auth/telegram/login", {
      method: "POST",
      body: JSON.stringify({ initData }),
    });
  }

  // ==========================================
  // STUDENT PROFILE & CLASSES
  // ==========================================
  async getProfile() { 
    return this.request("/api/v1/student/profile"); 
  }

  async getMyClasses() { 
    return this.request("/api/v1/student/classes"); 
  }
  
  async getClassDetails(classId, startDate = null, endDate = null) {
    let endpoint = `/api/v1/student/classes/${classId}`;
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const query = params.toString();
    return this.request(query ? `${endpoint}?${query}` : endpoint);
  }

  // REQUIRED BY useStudentData.js
  async getClassSchedules(classId) {
    return this.request(`/api/v1/student/classes/${classId}/schedules`);
  }

  // REQUIRED BY Permission Page
  async getClassOptions() {
    return this.request("/api/v1/student/class-options");
  }

  // ==========================================
  // ATTENDANCE
  // ==========================================
  async getAttendanceSummary() { 
    return this.request("/api/v1/student/attendance/summary"); 
  }

  async getAttendanceRecords(classId, startDate = null, endDate = null) {
    let endpoint = `/api/v1/student/classes/${classId}/attendance`;
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const query = params.toString();
    return this.request(query ? `${endpoint}?${query}` : endpoint);
  }

  // ==========================================
  // PERMISSION REQUESTS
  // ==========================================
  async getPermissionRequests() { 
    return this.request("/api/v1/student/permission-requests"); 
  }
  
  // REQUIRED BY Permission Form
  async getPermissionReasons() {
    return this.request("/api/v1/student/permission-reasons");
  }

  async createPermissionRequest(data) {
    return this.request("/api/v1/student/permission-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async cancelPermissionRequest(id) {
    return this.request(`/api/v1/student/permission-requests/${id}`, { 
      method: "DELETE" 
    });
  }
}

export const apiService = new ApiService();