// composables/useStudentData.js
import { ref, computed } from "vue";
import { useLanguage } from "~/composables/useLanguage";

export const useStudentData = () => {
  const { locale } = useLanguage();

  // Student data
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

  // Courses data with translation keys
  const rawCourses = ref([
    {
      id: "1",
      code: "MED101",
      name: "Media Kifi",
      translationKey: "courses.Media Kifi",
      schedule: "Sunday, 10:00 AM - 12:00 PM",
      description: "Practical engagement through singing and discussion",
      attendance: { attended: 24, missed: 2, excused: 1, percentage: 80 },
      bgImage:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
      instructor: "Dr. Michael",
      room: "Room 101",
    },
    {
      id: "2",
      code: "KED201",
      name: "Kedamay Course",
      translationKey: "courses.Kedamay Course",
      schedule: "Saturday, 2:00 PM - 4:00 PM",
      description:
        "Advanced theological studies focusing on Ethiopian church traditions",
      attendance: { attended: 18, missed: 4, excused: 2, percentage: 75 },
      bgImage:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1000&auto=format&fit=crop",
      instructor: "Prof. Sarah",
      room: "Room 202",
    },
  ]);

  // Courses computed property
  const courses = computed(() => {
    return rawCourses.value;
  });

  // Attendance data
  const attendance = ref({
    percentage: 85,
    status: "good",
    totalClasses: 40,
    attended: 34,
    late: 3,
    absent: 3,
    excused: 2,
  });

  // Permission requests
  const rawPermissionRequests = ref([
    {
      id: "1",
      title: "Permission for Medical Appointment",
      translationKey: "permissions.Permission for Medical Appointment",
      course: "Media Kifi",
      status: "PENDING",
      submittedDate: "2024-01-15",
      classDate: "Sunday, Jan 21, 2024 - 10:00 AM",
      reason: "Medical appointment",
      daysPending: 2,
    },
    {
      id: "2",
      title: "Permission for Family Event",
      translationKey: "permissions.Permission for Family Event",
      course: "Kedamay Course",
      status: "APPROVED",
      submittedDate: "2024-01-10",
      classDate: "Saturday, Jan 20, 2024 - 2:00 PM",
      reason: "Family wedding",
      approvedBy: "Prof. Sarah",
      approvedDate: "2024-01-11",
    },
  ]);

  const permissionRequests = computed(() => rawPermissionRequests.value);

  const pendingRequestsCount = computed(
    () =>
      permissionRequests.value.filter((req) => req.status === "PENDING").length
  );

  // Initialize data
  const initializeData = () => ({
    student: student.value,
    courses: courses.value,
    attendance: attendance.value,
    permissionRequests: permissionRequests.value,
  });

  // Trigger language update
  const triggerLanguageUpdate = () => true;

  return {
    student,
    courses,
    permissionRequests,
    attendance,
    pendingRequestsCount,
    initializeData,
    triggerLanguageUpdate,
  };
};
