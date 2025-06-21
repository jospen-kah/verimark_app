import React, { useState, useEffect } from 'react';

const CourseModal = ({ isOpen, onClose, onSubmit, course, lecturers }) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    instructorId: '',
    createdDate: new Date().toISOString().split('T')[0]
  });

  // Debug logging
  useEffect(() => {
    console.log('CourseModal Props Debug:');
    console.log('- isOpen:', isOpen);
    console.log('- course:', course);
    console.log('- lecturers:', lecturers);
    console.log('- lecturers length:', lecturers ? lecturers.length : 'undefined');
    
    if (lecturers && lecturers.length > 0) {
      console.log('- First lecturer:', lecturers[0]);
    } else {
      console.log('- No lecturers available!');
    }
  }, [isOpen, course, lecturers]);

  useEffect(() => {
    if (course) {
      console.log('Setting form data for editing course:', course);
      
      // Handle instructor ID extraction
      let instructorId = '';
      if (course.instructorId) {
        if (typeof course.instructorId === 'object' && course.instructorId._id) {
          // Populated instructor object
          instructorId = course.instructorId._id;
        } else {
          // Just the ID
          instructorId = course.instructorId;
        }
      }
      
      // Handle date - use createdAt from your schema
      const dateField = course.createdAt || course.createdDate;
      let formattedDate = new Date().toISOString().split('T')[0];
      
      if (dateField) {
        try {
          formattedDate = new Date(dateField).toISOString().split('T')[0];
        } catch (error) {
          console.error('Error formatting date:', error);
        }
      }

      setFormData({
        title: course.title || '',
        code: course.code || '',
        instructorId: instructorId,
        createdDate: formattedDate
      });
    } else {
      console.log('Setting form data for new course');
      setFormData({
        title: '',
        code: '',
        instructorId: '',
        createdDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [course]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Debug logging
    console.log('Form submission data:', formData);
    console.log('InstructorId:', formData.instructorId);
    console.log('Available lecturers for validation:', lecturers);
    
    // Validation
    if (!formData.instructorId) {
      alert('Please select an instructor');
      return;
    }
    
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {course ? 'Edit Course' : 'Add New Course'}
        </h3>
        
        {/* Debug info - remove this in production */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <strong>Debug:</strong> Lecturers available: {lecturers ? lecturers.length : 0}
        </div>
        
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
              value={formData.instructorId}
              onChange={(e) => {
                console.log('Selected instructor ID:', e.target.value);
                setFormData({...formData, instructorId: e.target.value});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an instructor</option>
              {lecturers && lecturers.length > 0 ? (
                lecturers.map((lecturer) => {
                  const lecturerId = lecturer.id || lecturer._id;
                  console.log('Rendering lecturer option:', lecturer.name, 'ID:', lecturerId);
                  return (
                    <option key={lecturerId} value={lecturerId}>
                      {lecturer.name}
                    </option>
                  );
                })
              ) : (
                <option value="" disabled>No instructors available</option>
              )}
            </select>
            {(!lecturers || lecturers.length === 0) && (
              <p className="text-sm text-red-600 mt-1">
                No instructors loaded. Please refresh the page.
              </p>
            )}
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

export default CourseModal;