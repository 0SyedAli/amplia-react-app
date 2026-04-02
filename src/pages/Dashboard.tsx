import { useQuery } from '@tanstack/react-query'
import { usersApi, servicesApi, bookingsApi, categoriesApi } from '../lib/api'
import {
  Users,
  Wrench,
  Folder,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react'

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
      icon: <Users size={24} className="text-white" />,
      color: 'bg-blue-500',
    },
    {
      label: 'Services',
      value: servicesData?.data?.data?.length || 0,
      icon: <Wrench size={24} className="text-white" />,
      color: 'bg-green-500',
    },
    {
      label: 'Categories',
      value: categoriesData?.data?.data?.length || 0,
      icon: <Folder size={24} className="text-white" />,
      color: 'bg-purple-500',
    },
    {
      label: 'Bookings',
      value: bookingsData?.data?.data?.length || 0,
      icon: <Calendar size={24} className="text-white" />,
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
              {stat.icon}
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
          <a href="/tax-settings" className="p-6 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all duration-300 group border border-primary-100/50">
            <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <DollarSign size={24} className="text-primary-600" />
            </div>
            <h3 className="font-bold text-primary-700 mb-1">Manage Tax Brackets</h3>
            <p className="text-sm text-gray-600">Update US Federal tax brackets</p>
          </a>
          <a href="/users" className="p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all duration-300 group border border-blue-100/50">
            <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Users size={24} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-blue-700 mb-1">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage user accounts</p>
          </a>
          <a href="/services" className="p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-all duration-300 group border border-green-100/50">
            <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <Wrench size={24} className="text-green-600" />
            </div>
            <h3 className="font-bold text-green-700 mb-1">Manage Services</h3>
            <p className="text-sm text-gray-600">Add or edit available services</p>
          </a>
        </div>
      </div>

      {/* System Info */}
      <div className="card mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Activity size={20} className="mr-2 text-primary-500" />
          System Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-sm">API Status</p>
            <div className="flex items-center mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <p className="text-green-600 font-semibold text-sm uppercase tracking-wider">Online</p>
            </div>
          </div>
          <div>
            <p className="text-gray-600 text-sm">Last Updated</p>
            <p className="text-gray-800 font-medium mt-1">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
