import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Trash2,
  Edit,
  X,
  Loader,
  Search
} from 'lucide-react';

// Edit Student Modal Component
const EditStudentModal = ({ isOpen, onClose, onSubmit, student, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    matriNumber: ''
  });

  useEffect(() => {
    if (student) {
      // Split the name back into firstName and lastName
      const nameParts = student.name.split(' ');
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: student.email,
        matriNumber: student.matriNumber
      });
    }
  }, [student]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Student</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter first name"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter last name"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matriculation Number
            </label>
            <input
              type="text"
              required
              value={formData.matriNumber}
              onChange={(e) => setFormData({...formData, matriNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter matriculation number"
              disabled={loading}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Student'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentManagement = ({ students = [], deleteStudent, editStudent, setShowAddStudentModal, loading }) => {
  const [editingStudent, setEditingStudent] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(students);

  // Filter students based on search term
  useEffect(() => {
    if (!students || !Array.isArray(students)) {
      setFilteredStudents([]);
      return;
    }
    
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student => 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matriNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleEditClick = (student) => {
    setEditingStudent(student);
  };

  const handleEditSubmit = async (formData) => {
    setEditLoading(true);
    try {
      await editStudent(editingStudent.id, formData);
      setEditingStudent(null);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Edit failed:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditClose = () => {
    setEditingStudent(null);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading students...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Manage Students</h2>
              <p className="text-gray-600 mt-1">Add, edit, or remove student accounts</p>
            </div>
            <button 
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students by name, email, or matriculation number..."
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
              {filteredStudents.length === 0 ? (
                <p>No students found matching "{searchTerm}"</p>
              ) : (
                <p>
                  {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found 
                  {filteredStudents.length !== students.length && ` out of ${students.length} total`}
                </p>
              )}
            </div>
          )}

          {filteredStudents.length === 0 && !searchTerm ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found.</p>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Add your first student
              </button>
            </div>
          ) : filteredStudents.length === 0 && searchTerm ? (
            <div className="text-center py-8 text-gray-500">
              <p>No students match your search criteria.</p>
              <button
                onClick={clearSearch}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div>
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <p className="text-sm text-gray-500">ID: {student.matriNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(student)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteStudent(student.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        isOpen={editingStudent !== null}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        student={editingStudent}
        loading={editLoading}
      />
    </div>
  );
};

export default StudentManagement;