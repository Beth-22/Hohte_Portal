// composables/useStudentData.js
import { ref, computed } from "vue";
import { useLanguage } from "./useLanguage";

export const useStudentData = () => {
  const { locale } = useLanguage();

  // Student data - REAL mock data (not promises)
  const student = ref({
    id: "STU001",
    studentId: "S2024001",
    firstName: "Alem",
    lastName: "Kebede",
    fullName: "Alem Kebede",
    email: "alem.kebede@student.hohte.edu.et",
    phone: "+251911223344",
    profileImage:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&auto=format&fit=crop",
    enrollmentDate: "2023-09-01",
    currentSemester: "2nd",
    department: "Theology",
    program: "Bachelor of Divinity",
    status: "active",
  });

  // Courses data - REAL mock data
  const courses = ref([
    {
      id: "1",
      code: "MED101",
      name: { en: "Media Kifi", am: "ሚድያ ክፍል" },
      time: { en: "Sunday morning", am: "እሑድ ጠዋት" },
      description: {
        en: "Practical engagement through singing and discussion",
        am: "የተግባራዊ ተሳትፎ በመዝሙር እና በውይይት",
      },
      attendance: { attended: 24, missed: 2, excused: 1, percentage: 80 },
      bgImage:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
      schedule: {
        en: "Sunday, 10:00 AM - 12:00 PM",
        am: "እሑድ, 10:00 ጥዋት - 12:00 ቀን",
      },
      instructor: { en: "Dr. Michael", am: "ዶ/ር ማይክል" },
      room: "Room 101",
    },
    {
      id: "2",
      code: "KED201",
      name: { en: "Kedamay Course", am: "ከዳማይ ኮርስ" },
      time: { en: "Saturday Afternoon", am: "ቅዳሜ ከሰዓት በኋላ" },
      description: {
        en: "Advanced theological studies focusing on Ethiopian church traditions",
        am: "የኢትዮጵያ ቤተክርስትያን ልማዶችን የሚያተኩር ላይኛ የሆነ ጥናት",
      },
      attendance: { attended: 18, missed: 4, excused: 2, percentage: 75 },
      bgImage:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop",
      schedule: {
        en: "Saturday, 2:00 PM - 4:00 PM",
        am: "ቅዳሜ, 2:00 ቀን - 4:00 ከሰዓት",
      },
      instructor: { en: "Prof. Sarah", am: "ፕሮፌሰር ሳራ" },
      room: "Room 202",
    },
  ]);

  // Permission requests - REAL mock data
  const permissionRequests = ref([
    {
      id: "1",
      title: { en: "Permission for Medical Appointment", am: "ለህክምና ቀጠሮ ፈቃድ" },
      course: { en: "Media Kifi", am: "ሚድያ ክፍል" },
      status: "PENDING",
      submittedDate: "2024-01-15",
      classDate: "Sunday, Jan 21, 2024 - 10:00 AM",
      reason: { en: "Medical appointment", am: "ህክምና ቀጠሮ" },
      daysPending: 2,
    },
    {
      id: "2",
      title: { en: "Permission for Family Event", am: "ለቤተሰብ ዝግጅት ፈቃድ" },
      course: { en: "Kedamay Course", am: "ከዳማይ ኮርስ" },
      status: "APPROVED",
      submittedDate: "2024-01-10",
      classDate: "Saturday, Jan 20, 2024 - 2:00 PM",
      reason: { en: "Family wedding", am: "የቤተሰብ ጋብቻ" },
      approvedBy: "Prof. Sarah",
      approvedDate: "2024-01-11",
    },
  ]);

  // Attendance data - REAL mock data
  const attendance = ref({
    percentage: 85,
    status: "good",
    totalClasses: 40,
    attended: 34,
    late: 3,
    absent: 3,
    excused: 2,
  });

  // Computed properties - SYNC, no async
  const currentCourses = computed(() => {
    return courses.value.map((course) => ({
      ...course,
      name: course.name[locale.value] || course.name.en,
      time: course.time[locale.value] || course.time.en,
      description: course.description[locale.value] || course.description.en,
      schedule: course.schedule[locale.value] || course.schedule.en,
      instructor: course.instructor[locale.value] || course.instructor.en,
    }));
  });

  const currentRequests = computed(() => {
    return permissionRequests.value.map((request) => ({
      ...request,
      title: request.title[locale.value] || request.title.en,
      course: request.course[locale.value] || request.course.en,
      reason: request.reason
        ? request.reason[locale.value] || request.reason.en || request.reason
        : "",
    }));
  });

  const pendingRequestsCount = computed(() => {
    return permissionRequests.value.filter((req) => req.status === "PENDING")
      .length;
  });

  // Simple methods that return data immediately (not promises)
  const fetchStudentData = () => {
    return student.value;
  };

  const fetchCourses = () => {
    return courses.value;
  };

  const fetchAttendance = () => {
    return attendance.value;
  };

  const fetchPermissionRequests = () => {
    return permissionRequests.value;
  };

  const submitPermissionRequest = (requestData) => {
    // Mock implementation - synchronous
    const newRequest = {
      id: (permissionRequests.value.length + 1).toString(),
      title: { en: requestData.title, am: requestData.title },
      course: { en: requestData.course, am: requestData.course },
      status: "PENDING",
      submittedDate: new Date().toISOString().split("T")[0],
      classDate: `${new Date().toLocaleDateString()} - ${
        requestData.time || "Morning"
      }`,
      reason: requestData.reason
        ? { en: requestData.reason, am: requestData.reason }
        : { en: "", am: "" },
      daysPending: 0,
    };

    permissionRequests.value.unshift(newRequest);
    return { success: true, request: newRequest };
  };

  const cancelPermissionRequest = (requestId) => {
    const index = permissionRequests.value.findIndex(
      (req) => req.id === requestId
    );
    if (index !== -1) {
      permissionRequests.value.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: "Request not found" };
  };

  // Initialize data - SYNC version
  const initializeData = () => {
    // Return the data immediately
    return {
      student: student.value,
      courses: courses.value,
      attendance: attendance.value,
      permissionRequests: permissionRequests.value,
    };
  };

  return {
    // State - direct access (no promises)
    student,
    courses: currentCourses,
    permissionRequests: currentRequests,
    attendance,
    pendingRequestsCount,

    // Methods - synchronous
    fetchStudentData,
    fetchCourses,
    fetchAttendance,
    fetchPermissionRequests,
    submitPermissionRequest,
    cancelPermissionRequest,
    initializeData,
  };
};
