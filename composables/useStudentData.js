// composables/useStudentData.js
import { ref, computed, watch } from "vue";
import { useLanguage } from "./useLanguage";
import { apiService } from "~/services/api.service";

export const useStudentData = () => {
  const { locale, t } = useLanguage();

  // Reactive state
  const student = ref(null);
  const classes = ref([]);
  const permissionRequests = ref([]);
  const attendance = ref(null);
  const permissionReasons = ref([]);
  const classOptions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  // Helper function for safe translation
  const safeT = (key, fallback) => {
    try {
      const translation = t(key);
      // If translation returns the key itself (not found), use fallback
      return translation === key ? fallback : translation;
    } catch {
      return fallback;
    }
  };

  // Computed properties
  const currentClasses = computed(() => {
    if (!classes.value || classes.value.length === 0) return [];

    return classes.value.map((cls) => {
      // Get schedule information
      const hasSchedules = cls.schedules && cls.schedules.length > 0;
      const firstSchedule = hasSchedules ? cls.schedules[0] : null;

      // Format schedule time
      let scheduleTime = safeT("course.notScheduled", "Not scheduled");
      if (firstSchedule) {
        const day = firstSchedule.day_of_week || safeT("common.day", "Day");
        const time = firstSchedule.time_in
          ? firstSchedule.time_in.substring(0, 5)
          : "";
        scheduleTime = `${day} ${time}`;
      }

      // Format schedule summary
      let scheduleSummary = safeT(
        "course.scheduleNotAvailable",
        "Schedule not available"
      );
      if (hasSchedules) {
        const days = cls.schedules
          .map((s) => {
            const day = s.day_of_week || "";
            return day.substring(0, 3);
          })
          .join(", ");
        const time = firstSchedule.time_in
          ? firstSchedule.time_in.substring(0, 5)
          : "";
        scheduleSummary = `${days} ${time}`;
      }

      return {
        id: cls.id.toString(),
        code: cls.code || `CLASS${cls.id}`,
        name:
          cls.name ||
          cls.class_name ||
          safeT("api.defaultClass", `Class ${cls.id}`),
        time: scheduleTime,
        description: cls.description || "",
        attendance: {
          attended: cls.stats?.present || 0,
          missed: cls.stats?.absent || 0,
          excused: cls.stats?.permission || 0,
          percentage: cls.stats?.percentage || 0,
        },
        bgImage:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
        schedule: scheduleSummary,
        instructor:
          cls.instructor ||
          cls.teacher_name ||
          safeT("api.defaultInstructor", "Instructor not assigned"),
        room: cls.room || safeT("api.defaultRoom", "Room not assigned"),
      };
    });
  });

  const currentRequests = computed(() => {
    if (!permissionRequests.value || permissionRequests.value.length === 0) {
      console.log(safeT("api.noRequests", "No requests found"));
      return [];
    }

    console.log("Processing permission requests:", permissionRequests.value);

    return permissionRequests.value.map((request) => {
      console.log("Processing request:", request);

      // Extract class name from scope field
      let className = safeT("course.class", "Class");
      if (request.scope && request.scope.includes("Class: ")) {
        className = request.scope.replace("Class: ", "");
      } else if (request.organization_name) {
        className = request.organization_name;
      }

      // Status handling - API returns lowercase, convert to uppercase
      let status = request.status || "pending";
      if (status) {
        status = status.toUpperCase();
      }

      return {
        id: request.id ? request.id.toString() : `req-${Date.now()}`,
        title:
          request.reason ||
          request.category ||
          safeT("permissionReasons.other", "Other"),
        course: className,
        status: status,
        submittedDate: formatDate(request.created_at),
        classDate:
          request.start_date || request.end_date
            ? `${request.start_date} to ${request.end_date}`
            : "Date not specified",
        reason: request.reason || request.category || "No reason provided",
        approvedBy: null,
        approvedDate: null,
        deniedDate: null,
        updatedAt: formatDate(request.created_at),
        raw: request,
      };
    });
  });

  const pendingRequestsCount = computed(() => {
    if (!permissionRequests.value || !Array.isArray(permissionRequests.value)) {
      console.log(safeT("api.noRequests", "No requests found"));
      return 0;
    }

    const pendingCount = permissionRequests.value.filter((req) => {
      if (!req || typeof req !== "object") return false;

      const status = req.status ? req.status.toLowerCase() : "";
      console.log(`Request ${req.id} status: ${status}`);
      return status === "pending";
    }).length;

    console.log("Pending requests count computed:", pendingCount);
    return pendingCount;
  });

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return null;
    console.log("Formatting date:", dateString);

    try {
      // Handle ISO format (2025-12-29T19:40:53.000000Z)
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        // Try simple date format (2025-12-29)
        const parts = dateString.split("-");
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);
          const simpleDate = new Date(year, month, day);
          if (!isNaN(simpleDate.getTime())) {
            const formatted = simpleDate.toLocaleDateString(locale.value, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            console.log("Simple date formatted:", formatted);
            return formatted;
          }
        }
        console.log("Could not parse date, returning as-is:", dateString);
        return dateString;
      }

      const formatted = date.toLocaleDateString(locale.value, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      console.log("ISO date formatted:", formatted);
      return formatted;
    } catch (error) {
      console.error("Date formatting error:", error, "for date:", dateString);
      return dateString;
    }
  };

  // Helper function to get attendance status
  const getAttendanceStatus = (percentage) => {
    if (percentage >= 80) return "good";
    if (percentage >= 60) return "average";
    return "poor";
  };

  // API Methods
  const fetchStudentProfile = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      console.log("Fetching student profile...");
      const data = await apiService.getProfile();

      student.value = {
        id: data.id || data.student_id || "STU001",
        studentId: data.student_id || data.id_number || "S2024001",
        firstName: data.first_name || "Student",
        lastName: data.last_name || "User",
        fullName:
          data.name ||
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
          "Student User",
        email: data.email || "student@example.com",
        phone: data.phone || "+251900000000",
        profileImage:
          data.profile_picture ||
          data.avatar ||
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop",
        enrollmentDate: data.enrollment_date || "2023-09-01",
        currentSemester: data.current_semester || "2nd",
        department: data.department || "Theology",
        program: data.program || "Bachelor of Divinity",
        status: data.status || "active",
      };
      return student.value;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching profile:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchClasses = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      console.log("Fetching classes...");
      const data = await apiService.getMyClasses();

      console.log("Classes API response:", data);
      console.log("Total enrolled classes:", data?.length || 0);

      classes.value = Array.isArray(data) ? data : [];
      return classes.value;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching classes:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchAttendance = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      console.log("Fetching attendance summary...");
      const data = await apiService.getAttendanceSummary();

      attendance.value = {
        percentage: data.percentage || data.attendance_rate || 0,
        status: getAttendanceStatus(
          data.percentage || data.attendance_rate || 0
        ),
        totalClasses: data.total_days || data.total_classes || 0,
        attended: data.present_count || data.attended || 0,
        late: data.late_count || 0,
        absent: data.absent_count || data.absent || 0,
        excused: data.excused_count || data.excused || 0,
      };
      return attendance.value;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching attendance:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPermissionRequests = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      console.log("Fetching permission requests...");
      const data = await apiService.getPermissionRequests();

      console.log(
        "RAW permission requests API response:",
        JSON.stringify(data, null, 2)
      );
      console.log("Type of response:", typeof data);
      console.log("Is array?", Array.isArray(data));

      if (data && typeof data === "object" && !Array.isArray(data)) {
        if (data.data && Array.isArray(data.data)) {
          permissionRequests.value = data.data;
        } else if (data.requests && Array.isArray(data.requests)) {
          permissionRequests.value = data.requests;
        } else if (data.items && Array.isArray(data.items)) {
          permissionRequests.value = data.items;
        } else {
          permissionRequests.value = [];
        }
      } else {
        permissionRequests.value = Array.isArray(data) ? data : [];
      }

      console.log(
        "Processed permission requests:",
        permissionRequests.value.length
      );
      return permissionRequests.value;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching permission requests:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPermissionReasons = async () => {
    try {
      error.value = null;
      console.log("Fetching permission reasons...");
      const data = await apiService.getPermissionReasons();

      console.log("Raw permission reasons data:", data);

      permissionReasons.value = Array.isArray(data)
        ? data.map((reason) => {
            const id = reason.id
              ? reason.id.toString()
              : reason.value || Math.random().toString();

            return {
              value: id,
              translationKey: (reason.category || reason.name || "")
                .toLowerCase()
                .replace(/ /g, "_"),
              category: reason.category || reason.name || "",
              raw: reason,
            };
          })
        : [];

      console.log("Processed permission reasons:", permissionReasons.value);
      return permissionReasons.value;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching permission reasons:", err);
      permissionReasons.value = [];
      return permissionReasons.value;
    }
  };

  const fetchClassOptions = async () => {
    try {
      error.value = null;
      console.log("Fetching class options...");
      const data = await apiService.getClassOptions();

      classOptions.value = Array.isArray(data)
        ? data.map((option) => ({
            id: option.id.toString(),
            name: option.name || option.class_name || `Class ${option.id}`,
          }))
        : [];

      return classOptions.value;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching class options:", err);
      throw err;
    }
  };

  const submitPermissionRequest = async (requestData) => {
    try {
      isLoading.value = true;
      error.value = null;
      console.log("Submitting permission request:", requestData);

      const apiData = {
        class_id: parseInt(requestData.courseId),
        start_date: requestData.startDate || requestData.specificDate,
        end_date: requestData.endDate || requestData.specificDate,
        reason: requestData.note || requestData.reason,
        permission_reason_id: parseInt(requestData.reasonId || 1),
      };

      console.log("API payload:", apiData);

      const result = await apiService.createPermissionRequest(apiData);
      console.log(
        "FULL Permission request response:",
        JSON.stringify(result, null, 2)
      );

      // Refresh permission requests
      await fetchPermissionRequests();

      return { success: true, request: result };
    } catch (err) {
      error.value = err.message;
      console.error("Error submitting permission request:", err);
      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  const cancelPermissionRequest = async (requestId) => {
    try {
      isLoading.value = true;
      error.value = null;
      console.log("Cancelling permission request:", requestId);

      const numericId =
        typeof requestId === "string" ? parseInt(requestId, 10) : requestId;
      console.log("Numeric ID for API:", numericId);

      await apiService.cancelPermissionRequest(numericId);
      console.log("Permission request cancelled via API");

      if (Array.isArray(permissionRequests.value)) {
        const index = permissionRequests.value.findIndex((req) => {
          const reqId = req.id ? parseInt(req.id, 10) : null;
          const targetId = parseInt(requestId, 10);
          return reqId === targetId;
        });

        console.log(
          "Found request index:",
          index,
          "in array of length:",
          permissionRequests.value.length
        );

        if (index !== -1) {
          permissionRequests.value.splice(index, 1);
          console.log("Request removed from local state");
        } else {
          console.log(
            "Request not found in local state, refreshing from API..."
          );
          await fetchPermissionRequests();
        }
      }

      return { success: true };
    } catch (err) {
      error.value = err.message;
      console.error("Error cancelling permission request:", err);

      if (err.message.includes("not found")) {
        console.log("Request already cancelled on server, removing from UI");
        const index = permissionRequests.value.findIndex(
          (req) => parseInt(req.id, 10) === parseInt(requestId, 10)
        );
        if (index !== -1) {
          permissionRequests.value.splice(index, 1);
        }
      }

      return { success: false, error: err.message };
    } finally {
      isLoading.value = false;
    }
  };

  const getPendingCount = async () => {
    try {
      console.log("Fetching pending count...");
      const data = await apiService.getPendingPermissionCount();
      return data.count || 0;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching pending count:", err);
      return 0;
    }
  };

  // Initialize all data
  const initializeData = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      console.log("Initializing student data...");

      // Fetch critical data in parallel
      await Promise.all([
        fetchStudentProfile(),
        fetchClasses(),
        fetchAttendance(),
        fetchPermissionRequests(),
      ]);

      // Fetch optional data in background
      Promise.all([fetchPermissionReasons(), fetchClassOptions()]).catch(
        (err) => console.error("Background data fetch error:", err)
      );

      console.log("Student data initialized successfully");
      return {
        student: student.value,
        courses: classes.value,
        attendance: attendance.value,
        permissionRequests: permissionRequests.value,
      };
    } catch (err) {
      error.value = err.message;
      console.error("Error initializing data:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    // State
    student,
    courses: currentClasses,
    permissionRequests: currentRequests,
    attendance,
    permissionReasons,
    classOptions,
    pendingRequestsCount,
    isLoading,
    error,

    // Methods
    fetchStudentProfile,
    fetchClasses,
    fetchAttendance,
    fetchPermissionRequests,
    fetchPermissionReasons,
    fetchClassOptions,
    submitPermissionRequest,
    cancelPermissionRequest,
    getPendingCount,
    initializeData,
  };
};
