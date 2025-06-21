import React from 'react';
import { UserCheck, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const InstructorManagement = ({ 
  pendingInstructors, 
  approveInstructor, 
  rejectInstructor,
  loading 
}) => {
  const handleApprove = async (id) => {
    const confirmed = window.confirm('Are you sure you want to approve this instructor?');
    if (confirmed) {
      await approveInstructor(id);
    }
  };

  const handleReject = async (id) => {
    const confirmed = window.confirm('Are you sure you want to reject this instructor? This will remove them from the system.');
    if (confirmed) {
      await rejectInstructor(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading pending instructors...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900">{pendingInstructors.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ready for Review</p>
              <p className="text-2xl font-bold text-gray-900">{pendingInstructors.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Action Required</p>
              <p className="text-2xl font-bold text-gray-900">{pendingInstructors.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Instructors List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Instructor Approvals</h3>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve instructor registration requests
          </p>
        </div>

        {pendingInstructors.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
            <p className="mt-1 text-sm text-gray-500">
              All instructor registrations have been processed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {pendingInstructors.map((instructor) => (
              <div key={instructor.id || instructor._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {instructor.name?.charAt(0)?.toUpperCase() || instructor.firstName?.charAt(0)?.toUpperCase() || 'I'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {instructor.name || `${instructor.firstName} ${instructor.lastName}`}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <span>{instructor.email}</span>
                        {instructor.department && (
                          <span>• {instructor.department}</span>
                        )}
                        {instructor.createdAt && (
                          <span>• Applied {new Date(instructor.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                      {instructor.specialization && (
                        <p className="text-sm text-gray-500 mt-1">
                          Specialization: {instructor.specialization}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReject(instructor.id || instructor._id)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(instructor.id || instructor._id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                  </div>
                </div>
                
                {/* Additional instructor details */}
                {(instructor.qualifications || instructor.experience) && (
                  <div className="mt-3 pl-14">
                    <div className="bg-gray-50 rounded-md p-3">
                      {instructor.qualifications && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-700">Qualifications:</span>
                          <p className="text-sm text-gray-600 mt-1">{instructor.qualifications}</p>
                        </div>
                      )}
                      {instructor.experience && (
                        <div>
                          <span className="text-xs font-medium text-gray-700">Experience:</span>
                          <p className="text-sm text-gray-600 mt-1">{instructor.experience}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Instructor Approval Process
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Review each instructor's qualifications and experience carefully</li>
                <li>Approved instructors will gain access to create and manage courses</li>
                <li>Rejected instructors will be removed from the system permanently</li>
                <li>You can contact instructors directly via their provided email addresses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorManagement;