// services/api.service.js
export class ApiService {
  constructor() {
    // For local testing, use localhost
    this.baseURL = "http://localhost:8000";
    this.token = null;

    // Load token from localStorage if available
    if (process.client) {
      this.token = localStorage.getItem("auth_token");
    }

    console.log("🔑 API Service Initialized");
    console.log("Server:", this.baseURL);

    if (this.token) {
      console.log(
        "Token loaded from localStorage:",
        this.token?.substring(0, 20) + "..."
      );
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
    const hasToken = !!this.token;
    console.log("🔍 Auth check - Has token?", hasToken);
    return hasToken;
  }

  // Authentication API
  async telegramLogin(initData) {
    try {
      console.log(
        "🔐 Sending Telegram login request to:",
        `${this.baseURL}/api/v1/auth/telegram/login`
      );
      console.log("initData length:", initData?.length);

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

      console.log(
        "📊 Login response status:",
        response.status,
        response.statusText
      );

      if (response.status === 404 || response.status === 401) {
        console.log("⚠️ User is unlinked (404/401)");
        throw new Error("UNLINKED_USER: Account needs linking");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Login error response:", errorText);
        throw new Error(
          `Login failed: ${response.status} - ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("✅ Login successful, response data:", data);

      if (!data.token) {
        console.error("❌ No token in response:", data);
        throw new Error("No token in response");
      }

      return data;
    } catch (error) {
      console.error("❌ Telegram login failed:", error.message);
      throw error;
    }
  }

  // Update the request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add Authorization header only if we have a token AND not skipping auth
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

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        console.log("⚠️ Token expired/invalid (401/403)");
        this.clearToken();
        throw new Error("Session expired. Please login again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);

        // Check for unlinked user (404)
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

  // Profile API
  async getProfile() {
    return this.request("/api/v1/student/profile");
  }

  // Classes API
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

  // Class Schedules API
  async getClassSchedules(classId) {
    return this.request(`/api/v1/student/classes/${classId}`);
  }

  // Attendance API
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

  // Permission API
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
