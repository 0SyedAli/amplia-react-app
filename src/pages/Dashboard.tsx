import { useQuery } from '@tanstack/react-query'
import { usersApi, servicesApi, bookingsApi, categoriesApi } from '../lib/api'

export default function Dashboard() {
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })

  const { data: servicesData } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.getAll(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  })

  const { data: bookingsData } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.getAll(),
  })

  const stats = [
    {
      label: 'Total Users',
      value: usersData?.data?.data?.length || 0,
      icon: '👥',
      color: 'bg-blue-500',
    },
    {
      label: 'Services',
      value: servicesData?.data?.data?.length || 0,
      icon: '🛠️',
      color: 'bg-green-500',
    },
    {
      label: 'Categories',
      value: categoriesData?.data?.data?.length || 0,
      icon: '📁',
      color: 'bg-purple-500',
    },
    {
      label: 'Bookings',
      value: bookingsData?.data?.data?.length || 0,
      icon: '📅',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center">
            <div className={`${stat.color} p-4 rounded-lg mr-4`}>
              <span className="text-3xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/tax-settings" className="p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
            <span className="text-2xl mb-2 block">💰</span>
            <h3 className="font-semibold text-primary-700">Manage Tax Brackets</h3>
            <p className="text-sm text-gray-600">Update US Federal tax brackets</p>
          </a>
          <a href="/users" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <span className="text-2xl mb-2 block">👥</span>
            <h3 className="font-semibold text-blue-700">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage user accounts</p>
          </a>
          <a href="/services" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <span className="text-2xl mb-2 block">🛠️</span>
            <h3 className="font-semibold text-green-700">Manage Services</h3>
            <p className="text-sm text-gray-600">Add or edit available services</p>
          </a>
        </div>
      </div>

      {/* System Info */}
      <div className="card mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">System Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">API Status</p>
            <p className="text-green-600 font-semibold">● Online</p>
          </div>
          <div>
            <p className="text-gray-600">Last Updated</p>
            <p className="text-gray-800">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
