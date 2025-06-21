import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Trash2,
  Edit,
  Search,
  X
} from 'lucide-react';

// CourseModal Component (inline)
const CourseModal = ({ isOpen, onClose, onSubmit, course, lecturers }) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    instructorId: '',
    createdDate: new Date().toISOString().split('T')[0]
  });

  React.useEffect(() => {
    console.log('CourseModal useEffect triggered');
    console.log('Course data:', course);
    console.log('Available lecturers:', lecturers);
    
    if (course) {
      // Handle instructor data - it might be populated or just an ID
      let instructorId = '';
      
      if (course.instructorId) {
        if (typeof course.instructorId === 'object' && course.instructorId._id) {
          // Populated instructor object from MongoDB
          instructorId = course.instructorId._id;
        } else if (typeof course.instructorId === 'string') {
          // Just the instructor ID as string
          instructorId = course.instructorId;
        }
      }
      
      console.log('Instructor ID found:', instructorId);
      
      // Handle date formatting - check both createdDate and createdAt
      const dateField = course.createdDate || course.createdAt;
      let formattedDate;
      
      if (dateField) {
        if (typeof dateField === 'string') {
          if (dateField.includes('T')) {
            // ISO date format
            formattedDate = dateField.split('T')[0];
          } else if (dateField.includes('/')) {
            // MM/DD/YYYY format - convert to YYYY-MM-DD
            const dateParts = dateField.split('/');
            if (dateParts.length === 3) {
              const month = dateParts[0].padStart(2, '0');
              const day = dateParts[1].padStart(2, '0');
              const year = dateParts[2];
              formattedDate = `${year}-${month}-${day}`;
            } else {
              formattedDate = new Date().toISOString().split('T')[0];
            }
          } else if (dateField.includes('-')) {
            // Already in YYYY-MM-DD format
            formattedDate = dateField;
          } else {
            // Try to parse as date
            const parsed = new Date(dateField);
            if (!isNaN(parsed.getTime())) {
              formattedDate = parsed.toISOString().split('T')[0];
            } else {
              formattedDate = new Date().toISOString().split('T')[0];
            }
          }
        } else {
          // Date object or other format
          const parsed = new Date(dateField);
          if (!isNaN(parsed.getTime())) {
            formattedDate = parsed.toISOString().split('T')[0];
          } else {
            formattedDate = new Date().toISOString().split('T')[0];
          }
        }
      } else {
        formattedDate = new Date().toISOString().split('T')[0];
      }
      
      console.log('Original date:', dateField);
      console.log('Formatted date:', formattedDate);
      
      const newFormData = {
        title: course.title || '',
        code: course.code || '',
        instructorId: instructorId,
        createdDate: formattedDate
      };
      
      console.log('Setting form data to:', newFormData);
      setFormData(newFormData);
    } else {
      console.log('No course data, setting empty form');
      setFormData({
        title: '',
        code: '',
        instructorId: '',
        createdDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [course, lecturers]);

  const handleSubmit = () => {
    // Debug logging
    console.log('Form submission data:', formData);
    console.log('InstructorId:', formData.instructorId);
    console.log('Available lecturers:', lecturers);
    
    // Validation
    if (!formData.instructorId) {
      alert('Please select an instructor');
      return;
    }
    
    // Find the instructor name for the selected ID
    const selectedLecturer = lecturers.find(lecturer => 
      (lecturer.id || lecturer._id) === formData.instructorId
    );
    
    // Submit data with both ID and name for compatibility
    const submitData = {
      ...formData,
      instructor: selectedLecturer ? selectedLecturer.name : ''
    };
    
    console.log('Final submit data:', submitData);
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {course ? 'Edit Course' : 'Add New Course'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
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
              value={formData.instructorId}
              onChange={(e) => {
                console.log('Selected instructor ID:', e.target.value);
                setFormData({...formData, instructorId: e.target.value});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an instructor</option>
              {lecturers.map((lecturer) => {
                const lecturerId = lecturer.id || lecturer._id;
                console.log('Rendering lecturer option:', lecturer.name, 'ID:', lecturerId);
                return (
                  <option key={lecturerId} value={lecturerId}>
                    {lecturer.name}
                  </option>
                );
              })}
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
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {course ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Course Management Component
const CourseManagement = ({ 
  courses = [], 
  lecturers = [], 
  deleteCourse, 
  editCourse, 
  addCourse, 
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Filter courses based on search term
  useEffect(() => {
    if (!courses || !Array.isArray(courses)) {
      setFilteredCourses([]);
      return;
    }
    
    if (!searchTerm.trim()) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course => {
        // Get instructor name for search
        let instructorName = '';
        if (course.instructorId && typeof course.instructorId === 'object' && course.instructorId.name) {
          instructorName = course.instructorId.name;
        }
        
        return (
          course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instructorName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setFilteredCourses(filtered);
    }
  }, [searchTerm, courses]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleAddCourse = () => {
    setEditingCourse(null);
    setShowModal(true);
  };

  const handleEditCourse = (course) => {
    console.log('Editing course:', course); // Debug log
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCourse(null);
  };

  const handleModalSubmit = async (formData) => {
    console.log('Modal submit called with:', formData); // Debug log
    let success = false;
    
    if (editingCourse) {
      // Edit existing course
      console.log('Calling editCourse with ID:', editingCourse._id || editingCourse.id);
      success = await editCourse(editingCourse._id || editingCourse.id, formData);
    } else {
      // Add new course
      console.log('Calling addCourse');
      success = await addCourse(formData);
    }
    
    if (success) {
      handleModalClose();
    }
    
    return success;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Manage Courses</h2>
              <p className="text-gray-600 mt-1">Add, edit, or remove courses</p>
            </div>
            <button 
              onClick={handleAddCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search courses by title, code, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {/* Search Results Info */}
          {searchTerm && (
            <div className="mb-4 text-sm text-gray-600">
              {filteredCourses.length === 0 ? (
                <p>No courses found matching "{searchTerm}"</p>
              ) : (
                <p>
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found 
                  {filteredCourses.length !== courses.length && ` out of ${courses.length} total`}
                </p>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500">Loading courses...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCourses.length === 0 && !searchTerm && !loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No courses found.</p>
                  <button 
                    onClick={handleAddCourse}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Add your first course
                  </button>
                </div>
              ) : filteredCourses.length === 0 && searchTerm ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No courses match your search criteria.</p>
                  <button
                    onClick={clearSearch}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                filteredCourses.map((course) => {
                  // Handle instructor display - THIS IS THE KEY FIX
                  let instructorName = 'No instructor assigned';
                  
                  if (course.instructorId) {
                    if (typeof course.instructorId === 'object' && course.instructorId.name) {
                      // This is the populated instructor object from MongoDB
                      instructorName = course.instructorId.name;
                    } else {
                      // This is just the instructor ID - find instructor by ID in lecturers list
                      const instructorId = course.instructorId._id || course.instructorId;
                      const matchingLecturer = lecturers.find(lecturer => 
                        (lecturer.id || lecturer._id) === instructorId
                      );
                      instructorName = matchingLecturer ? matchingLecturer.name : 'Instructor not found';
                    }
                  }
                  
                  // Handle date display - use createdAt from schema
                  const dateField = course.createdAt || course.createdDate;
                  
                  return (
                    <div
                      key={course._id || course.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500">Code: {course.code}</p>
                        <p className="text-sm text-gray-500">Instructor: {instructorName}</p>
                        <p className="text-sm text-gray-500">Created: {formatDate(dateField)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditCourse(course)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCourse(course._id || course.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Course Modal */}
      <CourseModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        course={editingCourse}
        lecturers={lecturers}
      />
    </div>
  );
};

export default CourseManagement;