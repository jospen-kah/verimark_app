import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Home, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Settings, 
  BookOpen,
} from 'lucide-react';
import CourseManagement from './components/CourseManagement';
import LecturerManagement from './components/LecturerManagement';
import StudentManagement from './components/StudentManagement';
import DashboardHome from './components/DashboardHome';
import InstructorManagement from './components/InstructorManagement';
import SettingsPage from './components/Settings';
import api from './api'; // Add your API import

// Course Modal Component
const CourseModal = ({ isOpen, onClose, onSubmit, course, lecturers }) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    instructor: '',
    createdDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        code: course.code,
        instructor: course.instructor,
        createdDate: course.createdDate.split('T')[0]
      });
    } else {
      setFormData({
        title: '',
        code: '',
        instructor: '',
        createdDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [course]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {course ? 'Edit Course' : 'Add New Course'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Introduction to Computer Science"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Code
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., CS101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructor
            </label>
            <select
              required
              value={formData.instructor}
              onChange={(e) => setFormData({...formData, instructor: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an instructor</option>
              {lecturers.map((lecturer) => (
                <option key={lecturer.id} value={lecturer.name}>
                  {lecturer.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <input
              type="date"
              required
              value={formData.createdDate}
              onChange={(e) => setFormData({...formData, createdDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {course ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchCourse, setSearchCourse] = useState('');
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New instructor registration pending approval', type: 'warning', time: '2 hours ago' },
    { id: 2, message: 'System maintenance scheduled for tonight', type: 'info', time: '1 day ago' },
    { id: 3, message: 'High attendance rate in CS101 this week', type: 'success', time: '2 days ago' }
  ]);
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
      const lecturersResponse = await api.get('api/user/instructors');
      if (lecturersResponse.data.success) {
        setLecturers(lecturersResponse.data.data);
      }

      // You can add more API calls here for other data
      // const studentsResponse = await api.get('/users/students');
      // const coursesResponse = await api.get('/courses');
      // etc.

    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Fallback to sample data if API fails
      setLecturers([
        { id: 1, name: 'Dr. Emily Davis', email: 'emily@university.edu', status: 'active' },
        { id: 2, name: 'Prof. Michael Brown', email: 'michael@university.edu', status: 'active' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Sample data fallback
  useEffect(() => {
    // Initialize other data that might not have API endpoints yet
    setPendingInstructors([
      { id: 1, name: 'Dr. John Smith', email: 'john.smith@university.edu', status: 'pending' },
      { id: 2, name: 'Prof. Sarah Johnson', email: 'sarah.johnson@university.edu', status: 'pending' }
    ]);
    
    setStudents([
      { id: 1, name: 'Alice Cooper', email: 'alice@student.edu', matriNumber: 'ST001' },
      { id: 2, name: 'Bob Wilson', email: 'bob@student.edu', matriNumber: 'ST002' }
    ]);

    setCourses([
      { id: 1, title: 'Introduction to Computer Science', code: 'CS101', instructor: 'Dr. Emily Davis', createdDate: '2024-01-15T00:00:00Z' },
      { id: 2, title: 'Advanced Mathematics', code: 'MATH201', instructor: 'Prof. Michael Brown', createdDate: '2024-02-01T00:00:00Z' },
      { id: 3, title: 'Physics Fundamentals', code: 'PHY101', instructor: 'Dr. Emily Davis', createdDate: '2024-01-20T00:00:00Z' }
    ]);
  }, []);

  // Sample attendance data generator
  const generateAttendanceData = (courseName) => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
    return weeks.map(week => ({
      week,
      attended: Math.floor(Math.random() * 80) + 20,
      total: 100,
      attendanceRate: Math.floor((Math.random() * 60) + 40)
    }));
  };

  const handleCourseSearch = () => {
    if (searchCourse.trim()) {
      const data = generateAttendanceData(searchCourse);
      setCourseData(data);
    }
  };

  const approveInstructor = (id) => {
    setPendingInstructors(prev => prev.filter(instructor => instructor.id !== id));
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message: `Instructor approved successfully`,
      type: 'success',
      time: 'Just now'
    }]);
  };

  const rejectInstructor = (id) => {
    setPendingInstructors(prev => prev.filter(instructor => instructor.id !== id));
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message: `Instructor registration rejected`,
      type: 'error',
      time: 'Just now'
    }]);
  };

  const deleteStudent = (id) => {
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  const deleteLecturer = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this lecturer?');
    if (!confirm) return;

    try {
      await api.delete(`/users/instructors/${id}`);
      // Update local state after successful deletion
      setLecturers(prev => prev.filter(lecturer => lecturer.id !== id));
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `Lecturer deleted successfully`,
        type: 'success',
        time: 'Just now'
      }]);
    } catch (error) {
      console.error('Failed to delete lecturer:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `Failed to delete lecturer`,
        type: 'error',
        time: 'Just now'
      }]);
    }
  };

  const deleteCourse = (id) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  };

  const handleCourseSubmit = (formData) => {
    if (editingCourse) {
      // Update existing course
      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id 
          ? { ...course, ...formData, createdDate: formData.createdDate + 'T00:00:00Z' }
          : course
      ));
      setEditingCourse(null);
    } else {
      // Add new course
      const newCourse = {
        id: Date.now(),
        ...formData,
        createdDate: formData.createdDate + 'T00:00:00Z'
      };
      setCourses(prev => [...prev, newCourse]);
    }
    setShowAddCourseModal(false);
  };

  const sidebarItems = [
    { id: 'home', icon: Home, label: 'Dashboard' },
    { id: 'instructors', icon: UserCheck, label: 'Approve Instructors' },
    { id: 'students', icon: Users, label: 'Manage Students' },
    { id: 'lecturers', icon: GraduationCap, label: 'Manage Lecturers' },
    { id: 'courses', icon: BookOpen, label: 'Manage Courses' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <DashboardHome 
            pendingInstructors={pendingInstructors}
            courseData={courseData}
            searchCourse={searchCourse}
            setSearchCourse={setSearchCourse}
            handleCourseSearch={handleCourseSearch}
            totalCourses={courses.length}
          />
        );
      case 'instructors':
        return (
          <InstructorManagement
            pendingInstructors={pendingInstructors}
            approveInstructor={approveInstructor}
            rejectInstructor={rejectInstructor}
          />
        );
      case 'students':
        return (
          <StudentManagement
            students={students}
            deleteStudent={deleteStudent}
            setShowAddStudentModal={setShowAddStudentModal}
          />
        );
      case 'lecturers':
        return (
          <LecturerManagement
            lecturers={lecturers}
            deleteLecturer={deleteLecturer}
            setShowAddLecturerModal={setShowAddLecturerModal}
            loading={loading}
          />
        );
      case 'courses':
        return (
          <CourseManagement
            courses={courses}
            deleteCourse={deleteCourse}
            setShowAddCourseModal={setShowAddCourseModal}
            setEditingCourse={setEditingCourse}
          />
        );
      case 'settings':
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
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
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
              {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
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
                      <h3 className="font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div key={notification.id} className="p-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'success' ? 'bg-green-500' :
                              notification.type === 'warning' ? 'bg-yellow-500' :
                              notification.type === 'error' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
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
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
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