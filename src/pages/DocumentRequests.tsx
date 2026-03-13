import { useState, useEffect } from 'react'
import { bookingsApi, filesApi, getImageUrl } from '../lib/api'
import { toast } from 'react-hot-toast'
import { 
    RefreshCw, 
    FileText, 
    Eye, 
    CheckCircle2, 
    XCircle, 
    FolderOpen,
    Upload,
    Check
} from 'lucide-react'

interface DocumentRequest {
    _id: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    service: {
        name: string;
    };
    status: string;
    files: any[];
}

export default function DocumentRequests() {
    const [requests, setRequests] = useState<DocumentRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRequest, setSelectedRequest] = useState<DocumentRequest | null>(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [isRejecting, setIsRejecting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<any>(null)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const res = await bookingsApi.getAll()
            const allBookings = res.data.bookings || []

            const targetStatuses = ['in_start', 'sent', 'received', 'preparation', 'review', 'approved', 'filed']
            const filteredBookings = allBookings.filter((b: any) =>
                targetStatuses.includes(b.status) && b.filedFiles && b.filedFiles.length > 0
            )

            setRequests(filteredBookings.map((b: any) => ({
                ...b,
                files: b.filedFiles
            })))
        } catch (error) {
            console.error('Error fetching requests:', error)
            toast.error('Failed to load document requests')
        } finally {
            setLoading(false)
        }
    }

    const handleMarkReceived = async (fileId: string) => {
        try {
            await filesApi.update(fileId, { status: 'received' })
            toast.success('Document marked as received')
            fetchRequests()
        } catch (error) {
            toast.error('Failed to update document status')
        }
    }

    const handleReject = async (fileId: string) => {
        if (!rejectionReason) {
            toast.error('Please provide a rejection reason')
            return
        }
        try {
            await filesApi.update(fileId, {
                status: 'rejected',
                rejectionReason
            })
            toast.success('Document rejected')
            setRejectionReason('')
            setIsRejecting(false)
            fetchRequests()
        } catch (error) {
            toast.error('Failed to reject document')
        }
    }

    const handleMarkAllReceived = async (files: any[]) => {
        try {
            await Promise.all(files.map(file =>
                filesApi.update(file._id, { status: 'received' })
            ))
            toast.success('All documents marked as received')
            fetchRequests()
        } catch (error) {
            toast.error('Failed to update some documents')
        }
    }

    const handlePrepare = async (bookingId: string) => {
        try {
            await bookingsApi.update(bookingId, { status: 'preparation' })
            toast.success('Booking moved to Preparation stage')
            fetchRequests()
        } catch (error) {
            toast.error('Failed to update booking status')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Document Requests</h1>
                <button
                    onClick={fetchRequests}
                    className="flex items-center gap-2 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-semibold"
                >
                    <RefreshCw size={18} className={`${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Requests List */}
                <div className="md:col-span-1 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Recent Uploads</h2>
                    {loading ? (
                        <div className="flex justify-center p-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="card text-center p-8 text-gray-500">
                            No pending document requests
                        </div>
                    ) : (
                        requests.map(req => (
                            <div
                                key={req._id}
                                onClick={() => setSelectedRequest(req)}
                                className={`card cursor-pointer transition-all ${selectedRequest?._id === req._id ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-900">{req.user?.firstName} {req.user?.lastName}</p>
                                        <p className="text-sm text-gray-500">{req.service?.name}</p>
                                    </div>
                                    <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">
                                        {req._id.slice(-6).toUpperCase()}
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                        {req.files.length} Files
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${req.status === 'preparation' ? 'bg-purple-100 text-purple-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {req.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Detail View */}
                <div className="md:col-span-2">
                    {selectedRequest ? (
                        <div className="card space-y-6">
                            <div className="flex justify-between items-center border-b pb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {selectedRequest.user?.firstName}'s Documents
                                    </h2>
                                    <p className="text-gray-500">{selectedRequest.user?.email}</p>
                                </div>
                                {selectedRequest.status !== 'preparation' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleMarkAllReceived(selectedRequest.files)}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                                        >
                                            <CheckCircle2 size={18} />
                                            Mark All Received
                                        </button>
                                        <button
                                            onClick={() => handlePrepare(selectedRequest._id)}
                                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition"
                                        >
                                            <Check size={18} />
                                            Start Preparation
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {selectedRequest.files.map((file: any) => (
                                    <div key={file._id} className="border rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{file.name}</p>
                                                <p className="text-sm text-gray-500">Year: {file.year} • {new Date(file.createdAt).toLocaleDateString()}</p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${file.status === 'received' ? 'bg-green-100 text-green-800' :
                                                        file.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                        {file.status || 'sent'}
                                                    </span>
                                                    {file.type === 'return_doc' && (
                                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Return Doc</span>
                                                    )}
                                                    {file.rejectionReason && (
                                                        <span className="text-xs text-red-600 italic">"{file.rejectionReason}"</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={getImageUrl(file.url, 'file')}
                                                target="_blank"
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="View File"
                                            >
                                                <Eye size={18} />
                                            </a>
                                            {file.type !== 'return_doc' && (
                                                <>
                                                    <button
                                                        onClick={() => handleMarkReceived(file._id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                        title="Mark Received"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedFile(file);
                                                            setIsRejecting(true);
                                                        }}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Stage Logic */}
                            <div className="mt-8 pt-6 border-t">
                                {selectedRequest.status === 'received' && (
                                    <div className="bg-blue-50 p-6 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-blue-900">Documents Verified</h3>
                                            <p className="text-blue-700">All documents are in order. Start the tax preparation phase.</p>
                                        </div>
                                        <button
                                            onClick={() => handlePrepare(selectedRequest._id)}
                                            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
                                        >
                                            <Upload size={18} />
                                            Start Preparation
                                        </button>
                                    </div>
                                )}

                                {selectedRequest.status === 'preparation' && (
                                    <div className="bg-purple-50 p-6 rounded-2xl space-y-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-purple-900">Tax Preparation In Progress</h3>
                                            <p className="text-purple-700">Upload the final return document to share with the client.</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="file"
                                                id="return-upload"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const formData = new FormData();
                                                        formData.append('file', file);
                                                        formData.append('name', 'Tax Return Final');
                                                        // Use the year from the booking's existing user files
                                                        const userDocYear = selectedRequest.files?.find((f: any) => f.type === 'user_doc')?.year || new Date().getFullYear();
                                                        formData.append('year', String(userDocYear));
                                                        formData.append('bookingId', selectedRequest._id); // This will push to filedFiles
                                                        formData.append('type', 'return_doc');
                                                        try {
                                                            await filesApi.upload(formData);
                                                            await bookingsApi.update(selectedRequest._id, { status: 'review' });
                                                            toast.success('Return uploaded successfully!');
                                                            fetchRequests();
                                                        } catch (err) {
                                                            toast.error('Upload failed');
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => document.getElementById('return-upload')?.click()}
                                                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200"
                                            >
                                                <Upload size={18} />
                                                Upload Return Document
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {selectedRequest.status === 'approved' && (
                                    <div className="bg-green-50 p-6 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-green-900">Client Approved!</h3>
                                            <p className="text-green-700">Ready to finalize the filing process.</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await bookingsApi.update(selectedRequest._id, { status: 'filed' });
                                                    toast.success('Marked as Filed!');
                                                    fetchRequests();
                                                } catch (err) {
                                                    toast.error('Operation failed');
                                                }
                                            }}
                                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200"
                                        >
                                            <Check size={18} />
                                            Confirm Filing Complete
                                        </button>
                                    </div>
                                )}

                                {selectedRequest.status === 'filed' && (
                                    <div className="bg-gray-100 p-6 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Filing Completed</h3>
                                            <p className="text-gray-700">The process is finished. Reset for next year/session?</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await bookingsApi.update(selectedRequest._id, { status: 'new' });
                                                    toast.success('Process reset successfully');
                                                    fetchRequests();
                                                    setSelectedRequest(null);
                                                } catch (err) {
                                                    toast.error('Reset failed');
                                                }
                                            }}
                                            className="flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900"
                                        >
                                            <RefreshCw size={18} />
                                            Reset Process
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isRejecting && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-3 mt-6">
                                    <p className="text-red-800 font-bold">Reject Document</p>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Tell the user why this document is incorrect..."
                                        className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                                        rows={3}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setIsRejecting(false)}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleReject(selectedFile?._id)}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                        >
                                            Confirm Rejection
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl p-12">
                            <FolderOpen size={64} className="mb-4 text-gray-300" />
                            <p className="text-xl">Select a request to review documents</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

