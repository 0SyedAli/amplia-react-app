import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../../lib/api'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ChatModal from '../../components/ChatModal'
import BookingFilesModal from '../../components/BookingFilesModal'

export default function BookingsManagement() {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('new')
    const [chatModalOpen, setChatModalOpen] = useState(false)
    const [selectedBookingForChat, setSelectedBookingForChat] = useState<any>(null)
    const [filesModalOpen, setFilesModalOpen] = useState(false)
    const [selectedBookingForFiles, setSelectedBookingForFiles] = useState<any>(null)

    const { data, isLoading, error } = useQuery({
        queryKey: ['bookings'],
        queryFn: () => bookingsApi.getAll(),
    })

    const assignMutation = useMutation({
        mutationFn: (id: string) => bookingsApi.assign(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
            toast.success('Booking assigned to you!')
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to assign booking')
        }
    })

    const completeMutation = useMutation({
        mutationFn: (id: string) => bookingsApi.update(id, { status: 'completed' }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] })
            toast.success('Booking marked as completed!')
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to complete booking')
        }
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="card bg-red-50 text-red-700">
                <p>Error loading bookings. Please try again.</p>
            </div>
        )
    }

    const allBookings = data?.data?.bookings || []

    // Helper to get current user ID from token if not in storage
    const getUserId = () => {
        // This is a placeholder. You should ideally store userId in context or localStorage on login
        // For now, let's try to find a booking that is assigned to "me" to check logic, 
        // or relies on the backend to filter "my" bookings if we had a dedicated endpoint.
        // BUT, since we fetch ALL bookings, we need to know who "I" am to filter.
        // Let's assume the Login component stored 'adminId' or we decode the token.
        // If 'adminId' is missing, we might have issues filtering "My" bookings.
        return localStorage.getItem('userId')
    }

    const userId = getUserId()

    const filterBookings = (tab: string) => {
        return allBookings.filter((b: any) => {
            const isAssignedToMe = b.assignedTo?._id === userId || b.assignedTo === userId

            switch (tab) {
                case 'new':
                    // Show all unassigned bookings that are not in final states
                    return (!b.assignedTo || b.assignedTo === null) &&
                        b.status !== 'completed' &&
                        b.status !== 'cancelled'
                case 'scheduled':
                    return isAssignedToMe && b.status === 'scheduled'
                case 'active':
                    // Show everything assigned to me that is in progress
                    return isAssignedToMe && 
                        b.status !== 'completed' && 
                        b.status !== 'cancelled' &&
                        b.status !== 'scheduled'
                case 'history':
                    return isAssignedToMe && (b.status === 'completed' || b.status === 'cancelled')
                default:
                    return false
            }
        })
    }

    const bookings = filterBookings(activeTab)

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            case 'scheduled':
                return 'bg-blue-100 text-blue-800'
            case 'active':
                return 'bg-purple-100 text-purple-800'
            case 'new':
                return 'bg-blue-50 text-blue-600'
            case 'approved':
                return 'bg-green-100 text-green-600'
            case 'filed':
                return 'bg-emerald-100 text-emerald-800'
            case 'sent':
                return 'bg-orange-50 text-orange-600'
            case 'preparation':
                return 'bg-purple-50 text-purple-600'
            case 'review':
                return 'bg-indigo-50 text-indigo-600'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Bookings Management</h1>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200 mb-6">
                {['new', 'scheduled', 'active', 'history'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-4 font-medium transition-colors border-b-2 ${activeTab === tab
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'new' ? 'Orders' : ''}
                    </button>
                ))}
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left p-3">Booking ID</th>
                                <th className="text-left p-3">User</th>
                                <th className="text-left p-3">Service</th>
                                <th className="text-left p-3">Start Date</th>
                                <th className="text-left p-3">End Date</th>
                                <th className="text-left p-3">Amount</th>
                                <th className="text-left p-3">Status</th>
                                <th className="text-left p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking: any) => (
                                <tr key={booking._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-mono text-sm">
                                        {booking._id?.slice(-8).toUpperCase() || 'N/A'}
                                    </td>
                                    <td className="p-3">
                                        <div>
                                            <p className="font-medium">{booking.user?.firstName} {booking.user?.lastName}</p>
                                            <p className="text-sm text-gray-500">{booking.user?.email || ''}</p>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center">

                                            <span>{booking.service?.name || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        {booking.startDate ? new Date(booking.startDate).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="p-3 text-gray-600">
                                        {booking.endDate ? new Date(booking.endDate).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="p-3 font-medium">
                                        ${booking.service?.plan.price || booking.service?.plan.price || 0}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                                            {booking.status || 'pending'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {activeTab === 'new' && (
                                            <button
                                                onClick={() => assignMutation.mutate(booking._id)}
                                                disabled={assignMutation.isPending}
                                                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition disabled:opacity-50"
                                            >
                                                {assignMutation.isPending ? 'Accepting...' : 'Accept'}
                                            </button>
                                        )}
                                        {activeTab !== 'new' && booking.assignedTo && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedBookingForChat(booking)
                                                        setChatModalOpen(true)
                                                    }}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                    </svg>
                                                    Chat
                                                </button>
                                                {(booking.status !== 'completed' && booking.status !== 'cancelled') && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to mark this booking as completed?')) {
                                                                completeMutation.mutate(booking._id)
                                                            }
                                                        }}
                                                        disabled={completeMutation.isPending}
                                                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Complete
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setSelectedBookingForFiles(booking)
                                                        setFilesModalOpen(true)
                                                    }}
                                                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition flex items-center gap-1"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                    </svg>
                                                    Files
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        No bookings found in {activeTab}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedBookingForChat && (
                <ChatModal
                    isOpen={chatModalOpen}
                    onClose={() => {
                        setChatModalOpen(false)
                        setSelectedBookingForChat(null)
                    }}
                    bookingId={selectedBookingForChat._id}
                    userId={selectedBookingForChat.user?._id || ''}
                    bookingDetails={selectedBookingForChat}
                    currentUserId={userId || ''}
                />
            )}

            {selectedBookingForFiles && (
                <BookingFilesModal
                    isOpen={filesModalOpen}
                    onClose={() => {
                        setFilesModalOpen(false)
                        setSelectedBookingForFiles(null)
                    }}
                    bookingId={selectedBookingForFiles._id}
                />
            )}
        </div>
    )
}
