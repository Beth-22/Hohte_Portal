// services/api.service.js
export class ApiService {
  constructor() {
    this.token = null
    
    if (process.client) {
      this.token = localStorage.getItem('auth_token')
    }

    console.log(" API Service Initialized")
    console.log("Token loaded:", !!this.token)
  }

  // Helper method to get the current baseURL based on school
  getBaseURL() {
    if (process.client) {
      // Always check localStorage for the current school
      const savedSchool = localStorage.getItem('selected_school')
      
      // Import SCHOOLS dynamically to avoid circular dependency
      const { SCHOOLS } = require('~/config/schools')
      
      if (savedSchool && SCHOOLS[savedSchool]) {
        console.log(`Using API URL for school: ${savedSchool} -> ${SCHOOLS[savedSchool].apiBaseURL}`)
        return SCHOOLS[savedSchool].apiBaseURL
      }
      
      // Default to hohte
      console.log('No school found, defaulting to hohte API URL')
      return SCHOOLS.hohte.apiBaseURL
    }
    
    // Fallback for SSR
    return 'https://hohte.batelew.com'
  }

  setToken(token) {
    this.token = token
    if (process.client) {
      localStorage.setItem('auth_token', token)
    }
    console.log(" Token set")
  }

  clearToken() {
    this.token = null
    if (process.client) {
      localStorage.removeItem('auth_token')
    }
    console.log(" Token cleared")
  }

  async request(endpoint, options = {}) {
    // Get the current baseURL based on school
    const baseURL = this.getBaseURL()
    const url = `${baseURL}${endpoint}`

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    console.log(` API ${config.method || "GET"} ${url}`);

    try {
      const response = await fetch(url, config);

      console.log(` Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);

        if (endpoint.includes('/auth/telegram/login')) {
          if (response.status === 404 || response.status === 401) {
            throw new Error(`HTTP ${response.status}: User not linked. Please share contact in Telegram bot.`);
          }
        }

        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = {
            message: `HTTP ${response.status}: ${errorText || "Unknown error"}`,
          };
        }

        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log(" API Success");
      return data;
    } catch (error) {
      console.error(" API Request failed:", error);
      throw error;
    }
  }

  async telegramLogin(initData) {
    return this.request("/api/v1/auth/telegram/login", {
      method: "POST",
      body: JSON.stringify({ initData }),
    });
  }

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

    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    return this.request(endpoint);
  }
  
  async getClassSchedules(classId) {
    return this.request(`/api/v1/student/classes/${classId}`);
  }
  
  async getAttendanceRecords(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    const endpoint = `/api/v1/student/attendance/records${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint);
  }

  async getAttendanceSummary() {
    return this.request("/api/v1/student/attendance/summary");
  }

  async getPermissionReasons() {
    return this.request("/api/v1/student/config/permission-reasons");
  }

  async getClassOptions() {
    return this.request("/api/v1/student/config/classes/options");
  }

  async getPermissionRequests() {
    return this.request("/api/v1/student/permission-requests");
  }

  async getPendingPermissionCount() {
    return this.request("/api/v1/student/permission-requests/pending-count");
  }

  async createPermissionRequest(data) {
    return this.request("/api/v1/student/permission-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async cancelPermissionRequest(id) {
    return this.request(`/api/v1/student/permission-requests/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiService = new ApiService();