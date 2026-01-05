import { ref, computed, watch } from "vue";
import { useLanguage } from "./useLanguage";
import { apiService } from "~/services/api.service";

export const useStudentData = () => {
  const { locale, t } = useLanguage();

  const student = ref(null);
  const classes = ref([]);
  const permissionRequests = ref([]);
  const attendance = ref(null);
  const permissionReasons = ref([]);
  const classOptions = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const safeT = (key, fallback) => {
    try {
      const translation = t(key);
      return translation === key ? fallback : translation;
    } catch {
      return fallback;
    }
  };

  const checkAuth = () => {
    if (!apiService.token) {
      error.value = "Not authenticated. Please login first.";
      return false;
    }
    return true;
  };

  const currentClasses = computed(() => {
    console.log("currentClasses computed - classes.value:", classes.value);

    if (!classes.value || classes.value.length === 0) {
      console.log("No classes available");
      return [];
    }

    return classes.value.map((cls, index) => {
      console.log(`Processing class ${index}:`, cls);

      const formatSchedule = (schedules) => {
        console.log("Formatting schedules:", schedules);

        if (!schedules || schedules.length === 0) {
          console.log("No schedules found");
          return "No schedule information";
        }

        const validSchedules = schedules.filter((schedule) => {
          const day = schedule.day_of_week || schedule.name || "";
          const timeIn = schedule.time_in || "";
          const timeOut = schedule.time_out || "";

          console.log("Schedule item:", { day, timeIn, timeOut });

          const isValid =
            day.trim() !== "" || timeIn.trim() !== "" || timeOut.trim() !== "";
          console.log("Is valid schedule?", isValid);
          return isValid;
        });

        console.log("Valid schedules:", validSchedules);

        if (validSchedules.length === 0) {
          console.log("No valid schedules found");
          return "No schedule information";
        }

        const formatTime = (timeString) => {
          if (!timeString) return "";
          if (timeString.includes(":")) {
            const parts = timeString.split(":");
            if (parts.length >= 2) {
              return `${parts[0]}:${parts[1]}`;
            }
          }
          return timeString;
        };

        const scheduleText = validSchedules
          .map((schedule) => {
            const day = schedule.day_of_week || schedule.name || "";
            const timeIn = formatTime(schedule.time_in);
            const timeOut = formatTime(schedule.time_out);

            console.log("Processing schedule for display:", {
              day,
              timeIn,
              timeOut,
            });

            if (timeIn && timeOut) {
              return `${day} ${timeIn} - ${timeOut}`;
            } else if (timeIn) {
              return `${day} ${timeIn}`;
            } else if (timeOut) {
              return `${day} until ${timeOut}`;
            } else if (day) {
              return day;
            }
            return "";
          })
          .filter((text) => text.trim() !== "")
          .join(", ");

        console.log("Final schedule text:", scheduleText);
        return scheduleText || "No schedule information";
      };

      const getRoomInfo = (roomData) => {
        if (!roomData || roomData.trim() === "") {
          return "No room information";
        }
        return roomData;
      };

      const scheduleText = formatSchedule(cls.schedules);
      console.log(`Class ${cls.name || cls.id} schedule:`, scheduleText);

      return {
        id: cls.id ? cls.id.toString() : `class-${index}`,
        code: cls.code || `CLASS${cls.id || index}`,
        name:
          cls.name ||
          cls.class_name ||
          safeT("api.defaultClass", `Class ${cls.id || index}`),
        time: scheduleText,
        description: cls.description || "",
        attendance: {
          attended: cls.stats?.present || 0,
          missed: cls.stats?.absent || 0,
          excused: cls.stats?.permission || 0,
          percentage: cls.stats?.percentage || 0,
        },
        bgImage: "/assets/images/class_image.png",
        schedule: scheduleText,
        instructor:
          cls.instructor ||
          cls.teacher_name ||
          safeT("api.defaultInstructor", "Instructor not assigned"),
        room: getRoomInfo(cls.room),
        raw: cls,
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

      let className = safeT("course.class", "Class");
      if (request.scope && request.scope.includes("Class: ")) {
        className = request.scope.replace("Class: ", "");
      } else if (request.organization_name) {
        className = request.organization_name;
      }

      let status = request.status || "pending";
      status = status.toLowerCase();

      if (status === "rejected") {
        status = "denied";
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

  const formatDate = (dateString) => {
    if (!dateString) return null;
    console.log("Formatting date:", dateString);

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
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

  const getAttendanceStatus = (percentage) => {
    if (percentage >= 80) return "good";
    if (percentage >= 60) return "average";
    return "poor";
  };

  const fetchStudentProfile = async () => {
    try {
      if (!checkAuth()) {
        throw new Error("Not authenticated");
      }

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
        phone: data.phone || data.phone_number || "+251900000000",
        profileImage: data.photo_url || data.profile_picture || data.avatar,
        enrollmentDate: data.enrollment_date || "2023-09-01",
        currentSemester: data.current_semester || "2nd",
        department: data.department || "Theology",
        program: data.program || "Bachelor of Divinity",
        status: data.status || "active",
        raw: data,
      };

      console.log(
        "Student profile loaded with photo_url:",
        student.value.profileImage
      );
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
      if (!checkAuth()) {
        throw new Error("Not authenticated");
      }

      isLoading.value = true;
      error.value = null;
      console.log("Fetching classes...");
      const data = await apiService.getMyClasses();

      console.log("Classes API response:", data);
      console.log("Total enrolled classes:", data?.length || 0);

      if (Array.isArray(data)) {
        classes.value = await Promise.all(
          data.map(async (cls) => {
            console.log(
              `Class ${cls.name}: schedules_count = ${cls.schedules_count}`
            );

            let enrichedCls = { ...cls };

            if (cls.schedules_count > 0 || cls.schedule_count > 0) {
              try {
                console.log(`Fetching schedule details for class ${cls.id}...`);
                const classDetails = await apiService.getClassSchedules(cls.id);

                if (classDetails && classDetails.schedules) {
                  enrichedCls.schedules = classDetails.schedules;
                  console.log(
                    `Fetched ${classDetails.schedules.length} schedules for ${cls.name}`
                  );
                } else if (classDetails && classDetails.schedule) {
                  enrichedCls.schedules = classDetails.schedule;
                  console.log(`Fetched schedule for ${cls.name}`);
                }
              } catch (scheduleError) {
                console.warn(
                  `Could not fetch schedule for class ${cls.id}:`,
                  scheduleError.message
                );
                
              }
            }

            return enrichedCls;
          })
        );
      } else {
        classes.value = [];
      }

      console.log("Processed classes with schedules:", classes.value);
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
      if (!checkAuth()) {
        throw new Error("Not authenticated");
      }

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
      if (!checkAuth()) {
        throw new Error("Not authenticated");
      }

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
      if (!checkAuth()) {
        throw new Error("Not authenticated");
      }

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
      if (!checkAuth()) {
        throw new Error("Not authenticated");
      }

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
      if (!checkAuth()) {
        throw new Error("Not authenticated");
      }

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
      if (!checkAuth()) {
        throw new Error("Not authenticated");
      }

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
      if (!checkAuth()) {
        throw new Error("Not authenticated");
      }

      console.log("Fetching pending count...");
      const data = await apiService.getPendingPermissionCount();
      return data.count || 0;
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching pending count:", err);
      return 0;
    }
  };

  const initializeData = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      console.log("Initializing student data...");

      if (!checkAuth()) {
        throw new Error("Not authenticated. Please login first.");
      }

      await Promise.all([
        fetchStudentProfile(),
        fetchClasses(),
        fetchAttendance(),
        fetchPermissionRequests(),
      ]);

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
    student,
    courses: currentClasses,
    permissionRequests: currentRequests,
    attendance,
    permissionReasons,
    classOptions,
    pendingRequestsCount,
    isLoading,
    error,

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
