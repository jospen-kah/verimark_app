import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

// Course Management Component
const CourseManagement = ({ courses, deleteCourse, setShowAddCourseModal, setEditingCourse }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Manage Courses</h2>
              <p className="text-gray-600 mt-1">Add, edit, or remove courses</p>
            </div>
            <button 
              onClick={() => setShowAddCourseModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500">Code: {course.code}</p>
                  <p className="text-sm text-gray-500">Instructor: {course.instructor}</p>
                  <p className="text-sm text-gray-500">Created: {formatDate(course.createdDate)}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingCourse(course)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;