import React, { useState, useEffect } from 'react';
import { 
  Plus,
  Trash2,
  Edit
} from 'lucide-react';

const StudentManagement = ({ students, deleteStudent, setShowAddStudentModal }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
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
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                  <p className="text-sm text-gray-500">ID: {student.matriNumber} </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteStudent(student.id)}
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

export default StudentManagement;