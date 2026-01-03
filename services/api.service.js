// services/api.service.js
export class ApiService {
  constructor() {
    // ✅ USE YOUR ACTUAL BACKEND
    this.baseURL = "https://staging-hohte.batelew.com";
    this.token = null;

    // Load token from localStorage if available
    if (process.client) {
      this.token = localStorage.getItem("auth_token");
    }

    console.log("🔑 API Service Initialized");
    console.log("Server:", this.baseURL);

    if (this.token) {
      console.log("Token loaded from localStorage");
    } else {
      console.log("No token found in localStorage");
    }
  }

  // Set token after successful login
  setToken(token) {
    if (!token) {
      console.error("❌ Cannot set null/empty token");
      return;
    }

    this.token = token;
    if (process.client) {
      localStorage.setItem("auth_token", token);
    }
    console.log("✅ Token set:", token.substring(0, 20) + "...");
  }

  // Clear token on logout
  clearToken() {
    this.token = null;
    if (process.client) {
      localStorage.removeItem("auth_token");
    }
    console.log("✅ Token cleared");
  }

  // Get current token
  getToken() {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Authentication API - DIRECT CALL TO YOUR BACKEND
  async telegramLogin(initData) {
    try {
      console.log("🔐 Sending Telegram login to YOUR backend...");
      console.log("URL:", `${this.baseURL}/api/v1/auth/telegram/login`);

      if (!initData || initData.length < 10) {
        throw new Error("Invalid initData: too short or empty");
      }

      const response = await fetch(
        `${this.baseURL}/api/v1/auth/telegram/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ initData }),
        }
      );

      console.log("📊 Response status:", response.status, response.statusText);

      if (response.status === 404) {
        console.log("⚠️ User needs linking (404)");
        throw new Error("UNLINKED_USER: Account needs linking");
      }

      if (response.status === 401) {
        console.log("⚠️ Unauthorized (401)");
        throw new Error("UNAUTHORIZED: Invalid credentials");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Login failed:", errorText);
        throw new Error(`Login failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Login response:", data);

      if (!data.token) {
        console.error("❌ No token in response");
        throw new Error("No token in response");
      }

      return data;
    } catch (error) {
      console.error("❌ Telegram login failed:", error.message);
      throw error;
    }
  }

  // Update request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add Authorization header if we have a token
    if (this.token && !options.skipAuth) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const config = {
      ...options,
      headers,
    };

    console.log(`🌐 API ${config.method || "GET"} ${url}`);

    try {
      const response = await fetch(url, config);

      console.log(`📊 Response: ${response.status} ${response.statusText}`);

      // Handle auth errors
      if (response.status === 401 || response.status === 403) {
        this.clearToken();
        throw new Error("Session expired");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);

        if (response.status === 404) {
          throw new Error("UNLINKED_USER: Account needs linking");
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
      console.log("✅ API Success");
      return data;
    } catch (error) {
      console.error("❌ API Request failed:", error.message);
      throw error;
    }
  }

  // Your existing methods (keep all these)
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
    if (queryString) endpoint += `?${queryString}`;
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

// Create singleton instance
export const apiService = new ApiService();
