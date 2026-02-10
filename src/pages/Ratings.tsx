import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ratingsApi, getImageUrl } from '../lib/api'
import { toast } from 'react-hot-toast'

export default function Ratings() {
    const queryClient = useQueryClient()

    const { data, isLoading, error } = useQuery({
        queryKey: ['ratings'],
        queryFn: () => ratingsApi.getAll(),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ratingsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ratings'] })
            toast.success('Rating deleted successfully')
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to delete rating')
        }
    })

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this rating? This action cannot be undone.')) {
            deleteMutation.mutate(id)
        }
    }

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
                <p>Error loading ratings. Please try again.</p>
            </div>
        )
    }

    const ratings = data?.data?.ratings || []

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Ratings & Reviews</h1>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="text-left p-3">User</th>
                                <th className="text-left p-3">Service</th>
                                <th className="text-left p-3">Rating</th>
                                <th className="text-left p-3">Review</th>
                                <th className="text-left p-3">Date</th>
                                <th className="text-right p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ratings.map((rating: any) => (
                                <tr key={rating._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                                {rating.user?.profile ? (
                                                    <img
                                                        src={getImageUrl(rating.user.profile, 'profile')}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-gray-500 font-bold">
                                                        {rating.user?.firstName?.[0] || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium">{rating.user?.firstName} {rating.user?.lastName}</p>
                                                <p className="text-sm text-gray-500">{rating.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center space-x-3">
                                            {rating.service?.cover && (
                                                <img
                                                    src={getImageUrl(rating.service.cover, 'cover')}
                                                    alt=""
                                                    className="h-8 w-8 rounded object-cover"
                                                />
                                            )}
                                            <span className="font-medium">{rating.service?.name || 'Deleted Service'}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <span className="text-yellow-400 mr-1">★</span>
                                            <span className="font-bold">{rating.rating}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 max-w-xs">
                                        <p className="text-sm text-gray-600 truncate" title={rating.review}>
                                            {rating.review}
                                        </p>
                                    </td>
                                    <td className="p-3 text-sm text-gray-500">
                                        {new Date(rating.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => handleDelete(rating._id)}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="Delete review"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {ratings.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No ratings found.
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
