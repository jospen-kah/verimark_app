import React, { useState, useEffect } from "react";
import {
  Bell,
  Home,
  Users,
  UserCheck,
  GraduationCap,
  Settings,
  BookOpen,
  Camera,
  Download,
} from "lucide-react";
import CourseManagement from "./components/CourseManagement";
import LecturerManagement from "./components/LecturerManagement";
import StudentManagement from "./components/StudentManagement";
import DashboardHome from "./components/DashboardHome";
import InstructorManagement from "./components/InstructorManagement";
import SettingsPage from "./components/Settings";
import FaceRegistrationApproval from "./components/FaceRegistrationApproval";
import api from "./api";
import CourseModal from "./components/CourseModal";
import DownloadReports from "./components/DownloadReport";

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [searchCourse, setSearchCourse] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddLecturerModal, setShowAddLecturerModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  // State for all data
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [courses, setCourses] = useState([]);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch lecturers from API
      const lecturersResponse = await api.get("api/user/instructors");
      if (lecturersResponse.data.success) {
        setLecturers(lecturersResponse.data.data);
      }

      // Fetch students from API
      const studentsResponse = await api.get("api/user/students");
      if (studentsResponse.data.success) {
        setStudents(studentsResponse.data.data);
      }

      // Fetch courses from API and extract lecturers
      const coursesResponse = await api.get("api/courses");
      if (coursesResponse.data.success) {
        const coursesData = coursesResponse.data.data;
        setCourses(coursesData);

        // Extract unique lecturers from the populated courses data
        const uniqueLecturers = [];
        const seenIds = new Set();

        coursesData.forEach((course) => {
          if (
            course.instructorId &&
            typeof course.instructorId === "object" &&
            course.instructorId._id
          ) {
            // This is a populated instructor object
            const instructor = course.instructorId;
            if (!seenIds.has(instructor._id)) {
              seenIds.add(instructor._id);
              uniqueLecturers.push({
                _id: instructor._id,
                id: instructor._id, // Add both for compatibility
                name: instructor.name,
                email: instructor.email,
              });
            }
          }
        });

        console.log("Extracted lecturers from courses:", uniqueLecturers);

        // If we have lecturers from courses, merge them with existing lecturers
        if (uniqueLecturers.length > 0) {
          setLecturers((prevLecturers) => {
            // Merge and deduplicate lecturers
            const allLecturers = [...prevLecturers];
            const existingIds = new Set(
              prevLecturers.map((l) => l.id || l._id)
            );

            uniqueLecturers.forEach((lecturer) => {
              if (!existingIds.has(lecturer.id)) {
                allLecturers.push(lecturer);
              }
            });

            return allLecturers;
          });
        }
      }

      // Fetch pending instructors from API
      const pendingResponse = await api.get("api/instructors/pending");
      if (pendingResponse.data.success) {
        setPendingInstructors(pendingResponse.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Fallback to sample data if API fails
      setLecturers([]);

      setStudents([]);

      setCourses([]);

      setPendingInstructors([]);
    } finally {
      setLoading(false);
    }
  };

  // Sample attendance data generator
  const generateAttendanceData = (courseName) => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];
    return weeks.map((week) => ({
      week,
      attended: Math.floor(Math.random() * 80) + 20,
      total: 100,
      attendanceRate: Math.floor(Math.random() * 60 + 40),
    }));
  };

  const handleCourseSearch = () => {
    if (searchCourse.trim()) {
      const data = generateAttendanceData(searchCourse);
      setCourseData(data);
    }
  };

  // Instructor Management Functions
  const approveInstructor = async (id) => {
    try {
      const response = await api.patch(`api/instructors/approve/${id}`);
      if (response.data.success) {
        setPendingInstructors((prev) =>
          prev.filter((instructor) => (instructor.id || instructor._id) !== id)
        );
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `Instructor approved successfully`,
            type: "success",
            time: "Just now",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to approve instructor:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Failed to approve instructor`,
          type: "error",
          time: "Just now",
        },
      ]);
    }
  };

  const rejectInstructor = async (id) => {
    try {
      const response = await api.delete(`api/instructors/reject/${id}`);
      if (response.data.success) {
        setPendingInstructors((prev) =>
          prev.filter((instructor) => (instructor.id || instructor._id) !== id)
        );
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `Instructor registration rejected`,
            type: "success",
            time: "Just now",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to reject instructor:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Failed to reject instructor`,
          type: "error",
          time: "Just now",
        },
      ]);
    }
  };

  // Student Management Functions
  const deleteStudent = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this student?"
    );
    if (!confirm) return;

    try {
      await api.delete(`api/user/students/${id}`);
      setStudents((prev) => prev.filter((student) => student.id !== id));
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Student deleted successfully`,
          type: "success",
          time: "Just now",
        },
      ]);
    } catch (error) {
      console.error("Failed to delete student:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Failed to delete student`,
          type: "error",
          time: "Just now",
        },
      ]);
    }
  };

  const editStudent = async (id, updatedData) => {
    try {
      const response = await api.put(`api/user/students/${id}`, updatedData);
      if (response.data.success) {
        setStudents((prev) =>
          prev.map((student) =>
            student.id === id ? response.data.data : student
          )
        );
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `Student updated successfully`,
            type: "success",
            time: "Just now",
          },
        ]);
        return response.data.data;
      }
    } catch (error) {
      console.error("Failed to edit student:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Failed to update student`,
          type: "error",
          time: "Just now",
        },
      ]);
      throw error;
    }
  };

  const addStudent = async (studentData) => {
    try {
      const response = await api.post("api/user/students", studentData);
      if (response.data.success) {
        setStudents((prev) => [...prev, response.data.data]);
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `Student added successfully`,
            type: "success",
            time: "Just now",
          },
        ]);
        return true;
      }
    } catch (error) {
      console.error("Failed to add student:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Failed to add student`,
          type: "error",
          time: "Just now",
        },
      ]);
      return false;
    }
  };

  // Lecturer Management Functions
  const deleteLecturer = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this lecturer?"
    );
    if (!confirm) return;

    try {
      await api.delete(`api/user/instructors/${id}`);
      setLecturers((prev) => prev.filter((lecturer) => lecturer.id !== id));
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Lecturer deleted successfully`,
          type: "success",
          time: "Just now",
        },
      ]);
    } catch (error) {
      console.error("Failed to delete lecturer:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Failed to delete lecturer`,
          type: "error",
          time: "Just now",
        },
      ]);
    }
  };

  const editLecturer = async (id, updatedData) => {
    try {
      const response = await api.put(`api/user/instructors/${id}`, updatedData);
      if (response.data.success) {
        setLecturers((prev) =>
          prev.map((lecturer) =>
            lecturer.id === id ? response.data.data : lecturer
          )
        );
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `Lecturer updated successfully`,
            type: "success",
            time: "Just now",
          },
        ]);
        return response.data.data;
      }
    } catch (error) {
      console.error("Failed to edit lecturer:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Failed to update lecturer`,
          type: "error",
          time: "Just now",
        },
      ]);
      throw error;
    }
  };

  const addLecturer = async (lecturerData) => {
    try {
      const response = await api.post("api/user/instructors", lecturerData);
      if (response.data.success) {
        setLecturers((prev) => [...prev, response.data.data]);
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `Lecturer added successfully`,
            type: "success",
            time: "Just now",
          },
        ]);
        return true;
      }
    } catch (error) {
      console.error("Failed to add lecturer:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Failed to add lecturer`,
          type: "error",
          time: "Just now",
        },
      ]);
      return false;
    }
  };

  // Course Management Functions
  const deleteCourse = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this course?"
    );
    if (!confirm) return;

    try {
      await api.delete(`api/courses/${id}`);
      setCourses((prev) => prev.filter((course) => course.id !== id));
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Course deleted successfully`,
          type: "success",
          time: "Just now",
        },
      ]);
    } catch (error) {
      console.error("Failed to delete course:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Failed to delete course`,
          type: "error",
          time: "Just now",
        },
      ]);
    }
  };

  // Updated addCourse function
  const addCourse = async (courseData) => {
    try {
      console.log("Sending course data:", courseData);

      // Ensure we're sending instructorId, not instructor name
      const dataToSend = {
        title: courseData.title,
        code: courseData.code,
        instructorId: courseData.instructorId, // This should be the ObjectId
        createdDate: courseData.createdDate,
      };

      // Validation on frontend
      if (!dataToSend.instructorId) {
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: "Please select an instructor",
            type: "error",
            time: "Just now",
          },
        ]);
        return false;
      }

      console.log("Data being sent to API:", dataToSend);

      const response = await api.post("/api/courses", dataToSend);

      console.log("API Response:", response.data);

      if (response.data.success) {
        const newCourse = {
          ...response.data.data,
          id: response.data.data._id,
        };

        setCourses((prev) => [...prev, newCourse]);
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `Course "${courseData.title}" added successfully`,
            type: "success",
            time: "Just now",
          },
        ]);
        return true;
      } else {
        console.error("API returned success: false", response.data);
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: response.data.message || "Failed to add course",
            type: "error",
            time: "Just now",
          },
        ]);
        return false;
      }
    } catch (error) {
      console.error("Failed to add course - Full error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Failed to add course";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: errorMessage,
          type: "error",
          time: "Just now",
        },
      ]);
      return false;
    }
  };

  // Function to fetch instructors for dropdown
  const fetchInstructors = async () => {
    try {
      const response = await api.get("/api/instructors"); // or '/api/users'
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch instructors:", error);
      return [];
    }
  };

  const editCourse = async (id, courseData) => {
    try {
      const response = await api.put(`api/courses/${id}`, {
        ...courseData,
        createdDate: courseData.createdDate + "T00:00:00Z",
      });
      if (response.data.success) {
        setCourses((prev) =>
          prev.map((course) => (course.id === id ? response.data.data : course))
        );
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: `Course updated successfully`,
            type: "success",
            time: "Just now",
          },
        ]);
        return response.data.data;
      }
    } catch (error) {
      console.error("Failed to edit course:", error);
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          message: `Failed to update course`,
          type: "error",
          time: "Just now",
        },
      ]);
      throw error;
    }
  };

  const handleCourseSubmit = async (formData) => {
    if (editingCourse) {
      await editCourse(editingCourse.id, formData);
      setEditingCourse(null);
    } else {
      await addCourse(formData);
    }
    setShowAddCourseModal(false);
  };

  const sidebarItems = [
    { id: "home", icon: Home, label: "Dashboard" },
    { id: "instructors", icon: UserCheck, label: "Approve Instructors" },
    { id: "students", icon: Users, label: "Manage Students" },
    { id: "lecturers", icon: GraduationCap, label: "Manage Lecturers" },
    { id: "courses", icon: BookOpen, label: "Manage Courses" },
    {
      id: "face-registration",
      icon: Camera,
      label: "Face Registration Approval",
    },
    { id: "download-reports", icon: Download, label: "Download Reports" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <DashboardHome
            pendingInstructors={pendingInstructors}
            courseData={courseData}
            searchCourse={searchCourse}
            setSearchCourse={setSearchCourse}
            handleCourseSearch={handleCourseSearch}
            totalCourses={courses.length}
            totalStudents={students.length} // Add this line
            activeInstructors={lecturers.length} // Add this line
          />
        );
      case "instructors":
        return (
          <InstructorManagement
            pendingInstructors={pendingInstructors}
            approveInstructor={approveInstructor}
            rejectInstructor={rejectInstructor}
          />
        );
      case "students":
        return (
          <StudentManagement
            students={students}
            deleteStudent={deleteStudent}
            editStudent={editStudent}
            addStudent={addStudent}
            setShowAddStudentModal={setShowAddStudentModal}
            loading={loading}
          />
        );
      case "lecturers":
        return (
          <LecturerManagement
            lecturers={lecturers}
            deleteLecturer={deleteLecturer}
            editLecturer={editLecturer}
            addLecturer={addLecturer}
            setShowAddLecturerModal={setShowAddLecturerModal}
            loading={loading}
          />
        );
      case "courses":
        return (
          <CourseManagement
            courses={courses}
            lecturers={lecturers}
            loading={loading}
            deleteCourse={deleteCourse}
            editCourse={editCourse}
            addCourse={addCourse}
            setShowAddCourseModal={setShowAddCourseModal}
            setEditingCourse={setEditingCourse}
          />
        );
      case "face-registration":
        return (
          <FaceRegistrationApproval
          // Pass any props your FaceRegistrationApproval component needs
          // For example:
          // pendingRegistrations={pendingFaceRegistrations}
          // approveFaceRegistration={approveFaceRegistration}
          // rejectFaceRegistration={rejectFaceRegistration}
          />
        );
      case "download-reports":
        console.log("Rendering DownloadReports component");
        return (
          <DownloadReports
            courses={courses}
            students={students}
            lecturers={lecturers}
          />
        );
      case "settings":
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Attendance Management</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {sidebarItems.find((item) => item.id === activeTab)?.label ||
                "Dashboard"}
            </h2>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === "success"
                                  ? "bg-green-500"
                                  : notification.type === "warning"
                                  ? "bg-yellow-500"
                                  : notification.type === "error"
                                  ? "bg-red-500"
                                  : "bg-blue-500"
                              }`}
                            />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">{renderContent()}</main>
      </div>

      {/* Course Modal */}
      <CourseModal
        isOpen={showAddCourseModal || editingCourse !== null}
        onClose={() => {
          setShowAddCourseModal(false);
          setEditingCourse(null);
        }}
        onSubmit={handleCourseSubmit}
        course={editingCourse}
        lecturers={lecturers}
      />
    </div>
  );
};

export default AdminDashboard;
