import { useQuery } from '@tanstack/react-query'
import { bookingsApi, getImageUrl } from '../lib/api'

export default function Bookings() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.getAll(),
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

  const bookings = data?.data?.bookings || []

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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bookings</h1>
        <p className="text-gray-600">{bookings.length} bookings total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {['pending', 'scheduled', 'completed', 'cancelled'].map((status) => {
          const count = bookings.filter((b: any) => b.status?.toLowerCase() === status).length
          return (
            <div key={status} className="card">
              <p className="text-gray-600 text-sm capitalize">{status}</p>
              <p className="text-2xl font-bold text-gray-800">{count}</p>
            </div>
          )
        })}
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3">Booking ID</th>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Service</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Assigned To</th>
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
                      {booking.service?.cover && (
                        <img
                          src={getImageUrl(booking.service.cover, 'cover')}
                          alt={booking.service.cover}
                          className="w-8 h-8 rounded object-cover mr-2"
                        />
                      )}
                      <span>{booking.service?.name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-3 font-medium">
                    ${booking.amount || booking.service?.price || 0}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {booking.assignedTo ? (
                      <div className="flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs mr-2">
                          {booking.assignedTo.firstName?.[0] || 'A'}
                        </span>
                        {booking.assignedTo.firstName} {booking.assignedTo.lastName}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3">
                    <button className="text-primary-600 hover:text-primary-800 mr-3">
                      View
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      Update
                    </button>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
