import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, X, Search } from 'lucide-react';

// Add/Edit Lecturer Modal Component
const LecturerModal = ({ isOpen, onClose, onSubmit, lecturer, isEditing }) => {
  const [formData, setFormData] = useState({
    title: lecturer?.title || '',
    firstName: lecturer?.firstName || '',
    lastName: lecturer?.lastName || '',
    email: lecturer?.email || '',
    isApproved: lecturer?.isApproved || false
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (lecturer) {
      setFormData({
        title: lecturer.title || '',
        firstName: lecturer.firstName || '',
        lastName: lecturer.lastName || '',
        email: lecturer.email || '',
        isApproved: lecturer.isApproved || false
      });
    } else {
      setFormData({
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        isApproved: false
      });
    }
  }, [lecturer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const success = await onSubmit(lecturer?.id, formData);
    
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {isEditing ? 'Edit Lecturer' : 'Add New Lecturer'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <select
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select title</option>
              <option value="Dr.">Dr.</option>
              <option value="Prof.">Prof.</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
            </select>
          </div>
          
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
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isApproved"
              checked={formData.isApproved}
              onChange={(e) => setFormData({...formData, isApproved: e.target.checked})}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isApproved" className="ml-2 block text-sm text-gray-700">
              Approved
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update Lecturer' : 'Add Lecturer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LecturerManagement = ({ 
  lecturers = [], 
  deleteLecturer, 
  editLecturer, 
  addLecturer, 
  setShowAddLecturerModal, 
  loading 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLecturers, setFilteredLecturers] = useState(lecturers);

  // Filter lecturers based on search term
  useEffect(() => {
    if (!lecturers || !Array.isArray(lecturers)) {
      setFilteredLecturers([]);
      return;
    }
    
    if (!searchTerm.trim()) {
      setFilteredLecturers(lecturers);
    } else {
      const filtered = lecturers.filter(lecturer => 
        lecturer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecturer.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLecturers(filtered);
    }
  }, [searchTerm, lecturers]);

  const handleAddLecturer = () => {
    setEditingLecturer(null);
    setShowModal(true);
  };

  const handleEditLecturer = (lecturer) => {
    setEditingLecturer(lecturer);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingLecturer(null);
  };

  const handleModalSubmit = async (id, formData) => {
    if (editingLecturer) {
      // Edit existing lecturer
      return await editLecturer(id, formData);
    } else {
      // Add new lecturer
      return await addLecturer(formData);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold">Manage Lecturers</h2>
              <p className="text-gray-600 mt-1">Add, edit, or remove lecturer accounts</p>
            </div>
            <button 
              onClick={handleAddLecturer}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Lecturer
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search lecturers by name, email, title, or status..."
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
              {filteredLecturers.length === 0 ? (
                <p>No lecturers found matching "{searchTerm}"</p>
              ) : (
                <p>
                  {filteredLecturers.length} lecturer{filteredLecturers.length !== 1 ? 's' : ''} found 
                  {filteredLecturers.length !== lecturers.length && ` out of ${lecturers.length} total`}
                </p>
              )}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-500">Loading lecturers...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLecturers.length === 0 && !searchTerm && !loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No lecturers found.</p>
                  <button 
                    onClick={handleAddLecturer}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Add your first lecturer
                  </button>
                </div>
              ) : filteredLecturers.length === 0 && searchTerm ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No lecturers match your search criteria.</p>
                  <button
                    onClick={clearSearch}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                filteredLecturers.map((lecturer) => (
                  <div
                    key={lecturer.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{lecturer.name}</h3>
                      <p className="text-sm text-gray-500">{lecturer.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            lecturer.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {lecturer.status}
                        </span>
                        {/* {lecturer.title && (
                          <span className="text-xs text-gray-400">
                            {lecturer.title}
                          </span>
                        )} */}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditLecturer(lecturer)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteLecturer(lecturer.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <LecturerModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        lecturer={editingLecturer}
        isEditing={!!editingLecturer}
      />
    </div>
  );
};

export default LecturerManagement;