// services/api.service.js
export class ApiService {
  constructor() {
    // ✅ CORRECT CONFIGURATION
    this.baseURL = "https://staging-hohte.batelew.com";
    this.token =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJhMGIxM2I3MC02N2FhLTRjMGYtYTczNy1hODA3MzI4MmY3MTkiLCJqdGkiOiI4ZDdmZDVhYjU4NDNlZDA4MDBmNzlhNmUwMzQwZDU3MmM1NGIzMzQ1ZjU4MjNlMzEyNjdlOWZmMDA0ZTk3YmE0MDlhYjQ1ZTZjNTJlNjI1MSIsImlhdCI6MTc2NzAzMDUxMi44ODE3MDcsIm5iZiI6MTc2NzAzMDUxMi44ODE3MTEsImV4cCI6MTc5ODU2NjUxMi44NjAwMDksInN1YiI6IjI0MzEiLCJzY29wZXMiOltdfQ.BUXqafuykZqzlzIqrmN2HtpCyRrliMcMekSQoLUsmoki1twEiFlD4m9ULBDrpukUtv_Ch4xbcm3FgZ4BNb1ejzphpHSm3dcwpTNRWJHYau9R9LczTkuP2hyAllLAnUJikQ-4gqwqROriz9b2TXsSiH0WQF0-tYs7k4xrQPgalq-96iYpCG6Ftc5O0RvZQY8txaG5-kuGPmD8E-7FaanU1RtK3CiTs8hXzDYGqGnKfaHDtNFA0xPUPjLxoFVHigyvSHOigd9myCID64gqq5CSYRn_AJK19AefAmiYxA8s5kRUuqCch1v6yBpLKIZKp9dZhMEMQNxv10tWwYLG81a_Tnd7MHyXwG9_gj5MF02hwkgl2y7Bm7gnLTq_gYMvQwBnxs0fqlodOl-vopJEJArQFazJjnqcYaBwU9x7JPInIGk5MY6X_7h0rxKGklT1NLAwRLyf6L-R2vGoPSZKj6MRv9bGMmJ6-6XNIgD19lgnbGeJGszAWRRduHOFT66BXZdzCY-ICqnRdpJTX5SS_17uI9aJvgp5MtrZs00NpFSkcYnOgx8xC_JTvgpA9cqmd7VRIxLGfeMscvqI8A0da5vE_90-CjS_wdjPkkabsbK_9wutCzSeDjTnB_2saIM0TcVlG9yWuOK-mehQ50yvgwBeUBm8FctGMtPGlfyfpeyaKbg";

    // Log token info for debugging
    console.log("🔑 API Service Initialized");
    console.log("Server:", this.baseURL);
    console.log("Token preview:", this.token.substring(0, 50) + "...");

    // Decode token to verify
    try {
      const parts = this.token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log("Token decoded successfully:", {
          subject: payload.sub,
          issued: new Date(payload.iat * 1000).toLocaleString(),
          expires: new Date(payload.exp * 1000).toLocaleString(),
        });
      }
    } catch (e) {
      console.log("Token decode warning:", e.message);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Always add the Authorization header
    headers["Authorization"] = `Bearer ${this.token}`;

    const config = {
      ...options,
      headers,
    };

    console.log(`🌐 API ${config.method || "GET"} ${url}`);

    try {
      const response = await fetch(url, config);

      console.log(`📊 Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);

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
      console.error("❌ API Request failed:", error);
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
