// Centralized Configuration for Schools
const TENANT_CONFIG = {
  hohte: {
    baseURL: "https://hohte.batelew.com",
    name: "HOHTE",
    logo: "logo2-modified.png", // Ensure this exists in assets/images/
  },
  fikure: {
    baseURL: "https://fikure.batelew.com",
    name: "FIKURE",
    logo: "logo-fikure.jpg", // Update this when i have the Fikure logo
  }
};

export class ApiService {
  constructor() {
    this.tenant = 'hohte'; // Default
    this.baseURL = TENANT_CONFIG.hohte.baseURL;
    this.token = null;
    
    if (process.client) {
      // 1. Check URL for ?school=xxx
      const urlParams = new URLSearchParams(window.location.search);
      const schoolParam = urlParams.get('school');

      if (schoolParam && TENANT_CONFIG[schoolParam]) {
        this.tenant = schoolParam;
        localStorage.setItem('active_tenant', schoolParam);
      } else {
        // 2. Fallback to last used tenant (useful for refreshes)
        this.tenant = localStorage.getItem('active_tenant') || 'hohte';
      }

      this.baseURL = TENANT_CONFIG[this.tenant].baseURL;
      // 3. Load namespaced token (e.g., hohte_auth_token)
      this.token = localStorage.getItem(`${this.tenant}_auth_token`);
    }

    console.log(`🚀 API Service: ${this.tenant.toUpperCase()} Mode Active`);
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
        if (endpoint.includes('/auth/telegram/login')) {
          if (response.status === 404 || response.status === 401) {
            throw new Error(`HTTP ${response.status}: User not linked.`);
          }
        }

        let errorData;
        try { errorData = JSON.parse(errorText); } 
        catch { errorData = { message: `HTTP ${response.status}: ${errorText || "Error"}` }; }

        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("❌ API Request failed:", error);
      throw error;
    }
  }

  // --- Auth Methods ---
  async telegramLogin(initData) {
    return this.request("/api/v1/auth/telegram/login", {
      method: "POST",
      body: JSON.stringify({ initData }),
    });
  }

  // --- Student Data Methods ---
  async getProfile() { return this.request("/api/v1/student/profile"); }
  async getMyClasses() { return this.request("/api/v1/student/classes"); }
  
  async getClassDetails(classId, startDate = null, endDate = null) {
    let endpoint = `/api/v1/student/classes/${classId}`;
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const query = params.toString();
    return this.request(query ? `${endpoint}?${query}` : endpoint);
  }

  async getAttendanceSummary() { return this.request("/api/v1/student/attendance/summary"); }
  async getPermissionRequests() { return this.request("/api/v1/student/permission-requests"); }
  
  async createPermissionRequest(data) {
    return this.request("/api/v1/student/permission-requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async cancelPermissionRequest(id) {
    return this.request(`/api/v1/student/permission-requests/${id}`, { method: "DELETE" });
  }
}

export const apiService = new ApiService();