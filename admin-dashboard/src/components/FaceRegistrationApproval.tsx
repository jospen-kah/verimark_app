import React, { useState, useEffect } from 'react';
import { UserCheck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface FaceRegistrationRequest {
  id: number;
  studentId: string;
  studentName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  time: string;
}

interface FaceRegistrationApprovalProps {
  api?: {
    get: (url: string) => Promise<{ data: { success: boolean; data: any } }>;
    post: (url: string, data?: any) => Promise<{ data: { success: boolean } }>;
  };
  setNotifications?: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const FaceRegistrationApproval: React.FC<FaceRegistrationApprovalProps> = ({ api, setNotifications }) => {
  const [requests, setRequests] = useState<FaceRegistrationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [requestToReject, setRequestToReject] = useState<number | null>(null);

  useEffect(() => {
    fetchFaceRegistrationRequests();
  }, []);

  const generateSampleData = (): FaceRegistrationRequest[] => {
    return [
      {
        id: 1,
        studentId: 'STU001',
        studentName: 'John Doe',
        submittedAt: '2025-01-15T10:30:00Z',
        status: 'pending'
      },
      {
        id: 2,
        studentId: 'STU002',
        studentName: 'Jane Smith',
        submittedAt: '2025-01-14T14:20:00Z',
        status: 'pending'
      },
      {
        id: 3,
        studentId: 'STU003',
        studentName: 'Mike Johnson',
        submittedAt: '2025-01-13T09:15:00Z',
        status: 'approved'
      },
      {
        id: 4,
        studentId: 'STU004',
        studentName: 'Sarah Wilson',
        submittedAt: '2025-01-12T11:45:00Z',
        status: 'rejected'
      },
      {
        id: 5,
        studentId: 'STU005',
        studentName: 'Alex Chen',
        submittedAt: '2025-01-16T11:20:00Z',
        status: 'pending'
      }
    ];
  };

  const fetchFaceRegistrationRequests = async () => {
    setLoading(true);
    try {
      if (api) {
        const response = await api.get('/api/face-registration/requests');
        if (response.data.success) {
          setRequests(response.data.data);
        } else {
          setRequests(generateSampleData());
        }
      } else {
        setRequests(generateSampleData());
      }
    } catch (error) {
      console.error('Failed to fetch face registration requests:', error);
      setRequests(generateSampleData());
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: number) => {
    setLoading(true);
    try {
      if (api) {
        const response = await api.post(`/api/face-registration/approve/${requestId}`);
        if (response.data.success) {
          updateRequestStatus(requestId, 'approved');
          showNotification(`Face registration approved`, 'success');
        }
      } else {
        // Simulate API call
        setTimeout(() => {
          updateRequestStatus(requestId, 'approved');
          showNotification(`Face registration approved`, 'success');
          setLoading(false);
        }, 1000);
        return;
      }
    } catch (error) {
      console.error('Failed to approve request:', error);
      showNotification('Failed to approve face registration request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId: number, reason: string) => {
    setLoading(true);
    try {
      if (api) {
        const response = await api.post(`/api/face-registration/reject/${requestId}`, {
          reason: reason
        });
        
        if (response.data.success) {
          updateRequestStatus(requestId, 'rejected');
          showNotification(`Face registration rejected`, 'info');
        }
      } else {
        // Simulate API call
        setTimeout(() => {
          updateRequestStatus(requestId, 'rejected');
          showNotification(`Face registration rejected`, 'info');
          setLoading(false);
        }, 1000);
        return;
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      showNotification('Failed to reject face registration request', 'error');
    } finally {
      setLoading(false);
    }
    
    setShowRejectModal(false);
    setRejectionReason('');
    setRequestToReject(null);
  };

  const updateRequestStatus = (requestId: number, status: 'approved' | 'rejected') => {
    const updatedRequests = requests.map(req => 
      req.id === requestId ? { ...req, status } : req
    );
    setRequests(updatedRequests);
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    if (setNotifications) {
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message,
        type,
        time: 'Just now'
      }]);
    }
  };

  const handleRejectClick = (requestId: number) => {
    setRequestToReject(requestId);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (requestToReject && rejectionReason.trim()) {
      rejectRequest(requestToReject, rejectionReason.trim());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Face Registration Approval</h2>
          </div>
          <div className="text-sm text-gray-600">
            {pendingRequests.length} pending requests
          </div>
        </div>

        {/* Loading State */}
        {loading && requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading face registration requests...</p>
          </div>
        ) : (
          <>
            {/* Request List */}
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.studentName}</h3>
                          <p className="text-sm text-gray-600">Matricule: {request.studentId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Submitted: {formatDate(request.submittedAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Badge */}
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>

                      {/* Action Buttons */}
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveRequest(request.id)}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(request.id)}
                            disabled={loading}
                            className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {requests.length === 0 && (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-500 mb-2">No requests found</p>
                <p className="text-gray-400">No face registration requests at this time</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Reject Request</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setRequestToReject(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <p className="text-sm text-gray-700">
                  Please provide a reason for rejecting this face registration request.
                </p>
              </div>
              
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setRequestToReject(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim() || loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceRegistrationApproval;