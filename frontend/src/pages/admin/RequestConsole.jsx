import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const RequestConsole = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [stats, setStats] = useState({
        total_vendors: 0,
        pending_requests: 0,
        active_requests: 0
    });

    // Filter and pagination states
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, []);

    // Apply filters whenever requests, filterType, or filterStatus changes
    useEffect(() => {
        let filtered = [...requests];

        // Filter by type
        if (filterType !== 'all') {
            filtered = filtered.filter(req => req.type === filterType);
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(req => req.status === filterStatus);
        }

        setFilteredRequests(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [requests, filterType, filterStatus]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/api/admin/requests');
            const data = await response.json();

            if (data.success) {
                setRequests(data.requests);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to load requests',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/admin/stats');
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleUpdateStatus = async (requestId, newStatus) => {
        try {
            const response = await fetch(`http://localhost:8000/api/admin/requests/${requestId}/status?status=${newStatus}`, {
                method: 'PUT',
            });
            const data = await response.json();

            if (data.success) {
                Swal.fire({
                    title: 'Success',
                    text: 'Status updated successfully',
                    icon: 'success',
                    confirmButtonColor: '#ea580c',
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchRequests();
                fetchStats();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Swal.fire({
                title: 'Error',
                text: 'Failed to update status',
                icon: 'error',
                confirmButtonColor: '#ea580c',
            });
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            'Pending': 'bg-amber-50 text-amber-600 border-amber-200',
            'Approved': 'bg-green-50 text-green-600 border-green-200',
            'Rejected': 'bg-red-50 text-red-600 border-red-200',
            'New': 'bg-blue-50 text-blue-600 border-blue-200',
        };
        return colors[status] || 'bg-zinc-50 text-zinc-500';
    };

    if (loading) {
        return (
            <div className="w-full max-w-6xl mx-auto animate-fade-in p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                    <p className="mt-4 text-zinc-600">Loading requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in p-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-zinc-900">{stats.total_vendors}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 mb-1">Pending Requests</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending_requests}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-xl p-4">
                    <p className="text-xs text-zinc-500 mb-1">Total Requests</p>
                    <p className="text-2xl font-bold text-orange-600">{requests.length}</p>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Request Console</h2>
                    <p className="text-sm text-zinc-500 mt-1">Monitor user activity and manage incoming update requests.</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="flex items-center gap-2 px-3 py-2 bg-zinc-900 text-white rounded-lg text-sm hover:bg-zinc-800 transition-colors shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                >
                    <option value="all">All Types</option>
                    <option value="Bank Details Update">Bank Details Update</option>
                    <option value="User Details Update">User Details Update</option>
                    <option value="Moving House">Moving House</option>
                    <option value="Login">Login</option>
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Completed">Completed</option>
                </select>

                <select
                    value={rowsPerPage}
                    onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                >
                    <option value="5">5 rows</option>
                    <option value="10">10 rows</option>
                    <option value="20">20 rows</option>
                    <option value="50">50 rows</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-50/50 border-b border-zinc-100">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Grantor No</th>
                                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Activity Type</th>
                                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {paginatedRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-zinc-500">
                                        No requests found
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-orange-50/30 transition-colors group">
                                        <td className="px-6 py-3">
                                            <span className="font-mono text-sm font-medium text-zinc-900">{req.vendor_id}</span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xs">
                                                    {req.user.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-zinc-900">{req.user}</div>
                                                    <div className="text-[10px] text-zinc-400">{req.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${req.type === 'Login' ? 'bg-zinc-100 text-zinc-600' :
                                                req.type === 'Moving House' ? 'bg-orange-50 text-orange-700' :
                                                    req.type === 'Bank Details Update' ? 'bg-blue-50 text-blue-700' :
                                                        req.type === 'User Details Update' ? 'bg-purple-50 text-purple-700' :
                                                            'bg-orange-50 text-orange-700'
                                                }`}>
                                                {req.type === 'Login' ? '🔐' :
                                                    req.type === 'Moving House' ? '🏠' :
                                                        req.type === 'Bank Details Update' ? '💳' :
                                                            req.type === 'User Details Update' ? '👤' :
                                                                '✏️'}
                                                {req.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            {req.type !== 'Login' ? (
                                                <button
                                                    onClick={() => setSelectedRequest(req)}
                                                    className="text-orange-600 hover:text-orange-700 underline text-sm font-medium transition-colors"
                                                >
                                                    View Details
                                                </button>
                                            ) : (
                                                <span className="text-zinc-600 text-sm">{req.detail}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-zinc-400 text-xs font-mono">{req.time}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            {(req.type === 'Moving House' || req.type === 'Bank Details Update' || req.type === 'User Details Update') && req.status === 'Pending' && (
                                                <div className="flex gap-1 justify-end">
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'approved')}
                                                        className="text-green-600 hover:text-green-700 transition-colors p-1"
                                                        title="Approve"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'rejected')}
                                                        className="text-red-600 hover:text-red-700 transition-colors p-1"
                                                        title="Reject"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/30 flex justify-between items-center text-xs">
                    <span className="text-zinc-500">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} records
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-zinc-600 px-2">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 border border-zinc-200 rounded hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Request Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900">Request Details</h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {selectedRequest.type} - {selectedRequest.vendor_id}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* User Information */}
                            <div className="bg-zinc-50 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-zinc-900 mb-3">User Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Grantor Number</p>
                                        <p className="text-sm font-mono font-medium text-zinc-900">{selectedRequest.vendor_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Name</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedRequest.user}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Email</p>
                                        <p className="text-sm text-zinc-900">{selectedRequest.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Postcode</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedRequest.postcode}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Request Information */}
                            <div className="bg-zinc-50 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-zinc-900 mb-3">Request Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Type</p>
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${selectedRequest.type === 'Login' ? 'bg-zinc-100 text-zinc-600' :
                                            selectedRequest.type === 'Moving House' ? 'bg-orange-50 text-orange-700' :
                                                selectedRequest.type === 'Bank Details Update' ? 'bg-blue-50 text-blue-700' :
                                                    selectedRequest.type === 'User Details Update' ? 'bg-purple-50 text-purple-700' :
                                                        'bg-orange-50 text-orange-700'
                                            }`}>
                                            {selectedRequest.type === 'Login' ? '🔐' :
                                                selectedRequest.type === 'Moving House' ? '🏠' :
                                                    selectedRequest.type === 'Bank Details Update' ? '💳' :
                                                        selectedRequest.type === 'User Details Update' ? '👤' :
                                                            '✏️'}
                                            {selectedRequest.type}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Status</p>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(selectedRequest.status)}`}>
                                            {selectedRequest.status}
                                        </span>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs text-zinc-500 mb-1">Submitted</p>
                                        <p className="text-sm text-zinc-900">{selectedRequest.time}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Moving House Specific Details */}
                            {selectedRequest.type === 'Moving House' && selectedRequest.extra_data && (
                                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                    <h4 className="text-sm font-semibold text-zinc-900 mb-3">Moving House Details</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Old Address</p>
                                            <p className="text-sm font-medium text-zinc-900">{selectedRequest.extra_data.old_address}</p>
                                            <p className="text-xs text-zinc-500 mt-1">Postcode: {selectedRequest.postcode}</p>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">New Address</p>
                                            <p className="text-sm font-medium text-zinc-900">{selectedRequest.extra_data.new_address}</p>
                                        </div>
                                        <div className="border-t border-orange-200 pt-4 mt-4">
                                            <p className="text-xs text-zinc-500 mb-2">New Owner Information</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-zinc-500">Name</p>
                                                    <p className="text-sm font-medium text-zinc-900">{selectedRequest.extra_data.new_owner_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-zinc-500">Mobile</p>
                                                    <p className="text-sm text-zinc-900">{selectedRequest.extra_data.new_owner_mobile}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs text-zinc-500">Email</p>
                                                    <p className="text-sm text-zinc-900">{selectedRequest.extra_data.new_owner_email}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bank Details Update */}
                            {selectedRequest.type === 'Bank Details Update' && selectedRequest.extra_data && (
                                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                    <h4 className="text-sm font-semibold text-zinc-900 mb-4">Bank Details Update</h4>
                                    <div className="space-y-4">
                                        {/* Column Headers */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <h5 className="text-xs font-bold text-zinc-700 uppercase tracking-wider bg-zinc-200 py-2 rounded-lg">
                                                    Previous Details
                                                </h5>
                                            </div>
                                            <div className="text-center">
                                                <h5 className="text-xs font-bold text-green-700 uppercase tracking-wider bg-green-100 py-2 rounded-lg">
                                                    Updated Details
                                                </h5>
                                            </div>
                                        </div>

                                        {/* Render each field */}
                                        {Object.entries(selectedRequest.extra_data).map(([fieldName, fieldData]) => (
                                            <div key={fieldName} className="grid grid-cols-2 gap-4">
                                                <div className={`rounded-lg p-3 ${fieldData.updated ? 'bg-white/50' : 'bg-zinc-50/50'}`}>
                                                    <p className="text-xs text-zinc-500 mb-1">{fieldName}</p>
                                                    <p className={`text-sm font-mono ${fieldData.updated ? 'text-zinc-600 line-through' : 'text-zinc-500'}`}>
                                                        {fieldData.old}
                                                    </p>
                                                </div>
                                                <div className={`rounded-lg p-3 ${fieldData.updated ? 'bg-white border-2 border-green-200' : 'bg-zinc-50/50'}`}>
                                                    <p className={`text-xs mb-1 ${fieldData.updated ? 'text-green-600' : 'text-zinc-500'}`}>{fieldName}</p>
                                                    <p className={`text-sm font-mono ${fieldData.updated ? 'font-medium text-zinc-900' : 'text-zinc-500'}`}>
                                                        {fieldData.new}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2 border-t border-blue-200">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Updated fields are highlighted with green border, unchanged fields are grayed out</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Details Update */}
                            {selectedRequest.type === 'User Details Update' && selectedRequest.extra_data && (
                                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                    <h4 className="text-sm font-semibold text-zinc-900 mb-4">User Details Update</h4>
                                    <div className="space-y-4">
                                        {/* Column Headers */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <h5 className="text-xs font-bold text-zinc-700 uppercase tracking-wider bg-zinc-200 py-2 rounded-lg">
                                                    Previous Details
                                                </h5>
                                            </div>
                                            <div className="text-center">
                                                <h5 className="text-xs font-bold text-green-700 uppercase tracking-wider bg-green-100 py-2 rounded-lg">
                                                    Updated Details
                                                </h5>
                                            </div>
                                        </div>

                                        {/* Render each field */}
                                        {Object.entries(selectedRequest.extra_data).map(([fieldName, fieldData]) => (
                                            <div key={fieldName} className="grid grid-cols-2 gap-4">
                                                <div className={`rounded-lg p-3 ${fieldData.updated ? 'bg-white/50' : 'bg-zinc-50/50'}`}>
                                                    <p className="text-xs text-zinc-500 mb-1">{fieldName}</p>
                                                    <p className={`text-sm ${fieldData.updated ? 'text-zinc-600 line-through' : 'text-zinc-500'}`}>
                                                        {fieldData.old}
                                                    </p>
                                                </div>
                                                <div className={`rounded-lg p-3 ${fieldData.updated ? 'bg-white border-2 border-green-200' : 'bg-zinc-50/50'}`}>
                                                    <p className={`text-xs mb-1 ${fieldData.updated ? 'text-green-600' : 'text-zinc-500'}`}>{fieldName}</p>
                                                    <p className={`text-sm ${fieldData.updated ? 'font-medium text-zinc-900' : 'text-zinc-500'}`}>
                                                        {fieldData.new}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-2 text-xs text-zinc-500 pt-2 border-t border-purple-200">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Updated fields are highlighted with green border, unchanged fields are grayed out</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {(selectedRequest.type === 'Moving House' || selectedRequest.type === 'Bank Details Update' || selectedRequest.type === 'User Details Update') && selectedRequest.status === 'Pending' && (
                                <div className="flex gap-3 pt-4 border-t border-zinc-200">
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(selectedRequest.id, 'approved');
                                            setSelectedRequest(null);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Approve Request
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(selectedRequest.id, 'rejected');
                                            setSelectedRequest(null);
                                        }}
                                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Reject Request
                                    </button>
                                </div>
                            )}

                            {/* Close Button */}
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="px-6 py-2.5 border border-zinc-300 text-zinc-700 font-medium rounded-lg hover:bg-zinc-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RequestConsole;
