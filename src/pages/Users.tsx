import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { usersApi } from '../lib/api'
import { 
  Bell, 
  Search, 
  Trash2, 
  Users as UsersIcon
} from 'lucide-react'

export default function Users() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  })

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action will hide the user from the list.')) {
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
        <p>Error loading users. Please try again.</p>
      </div>
    )
  }

  const users = data?.data?.data || []

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-400 font-medium">User Management</p>
        </div>
        <div className="relative">
          <button className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100 hover:bg-gray-50 transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="flex gap-4 mb-8">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </span>
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all shadow-sm"
          />
        </div>
        {/* <button className="btn-primary flex items-center gap-2 px-6">
          <UserPlus size={20} />
          Add User
        </button> */}
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {users.map((user: any) => (
          <div key={user._id} className="card hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
            <div className="flex items-start justify-between p-2">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 shadow-inner">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{user.name || 'User Name'}</h3>
                  <p className="text-gray-500 font-medium mb-3">{user.email}</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-md bg-emerald-900 text-white text-[10px] font-bold uppercase tracking-tight">
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-3 py-1 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-tight">
                      {user.role || 'Client'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 mt-4">
              <button
                onClick={() => handleDelete(user._id)}
                disabled={deleteMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-gray-600 hover:text-red-600 border border-gray-200 rounded-xl transition-all font-semibold text-sm shadow-sm hover:shadow-md bg-white hover:bg-red-50"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        ))}

        {users.length === 0 && (
          <div className="card text-center py-20 bg-white/50 backdrop-blur-sm">
            <div className="flex justify-center mb-4 text-gray-300">
              <UsersIcon size={48} />
            </div>
            <p className="text-gray-500 text-lg font-medium">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}
