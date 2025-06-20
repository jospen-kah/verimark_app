import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Check,
  X,
  
} from 'lucide-react';

const InstructorManagement = ({ pendingInstructors, approveInstructor, rejectInstructor }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Pending Instructor Approvals</h2>
          <p className="text-gray-600 mt-1">Review and approve new instructor registrations</p>
        </div>
        <div className="p-6">
          {pendingInstructors.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending instructor approvals</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInstructors.map((instructor) => (
                <div key={instructor.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{instructor.name}</h3>
                    <p className="text-sm text-gray-500">{instructor.email}</p>
                    
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveInstructor(instructor.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectInstructor(instructor.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorManagement;