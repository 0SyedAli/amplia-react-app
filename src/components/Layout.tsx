import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

interface LayoutProps {
  children: React.ReactNode
  onLogout: () => void
  userRole?: string
}

const adminNavItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/tax-settings', label: 'Tax Settings', icon: '💰' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/services', label: 'Services', icon: '🛠️' },
  { path: '/categories', label: 'Categories', icon: '📁' },
  { path: '/sub-admins', label: 'Sub Admins', icon: '🛡️' },
  { path: '/bookings', label: 'Bookings', icon: '📅' },
  { path: '/ratings', label: 'Ratings', icon: '⭐' },
  { path: '/tax-calculator', label: 'Tax Calculator', icon: '🧮' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

const subAdminNavItems = [
  { path: '/sub-admin/bookings', label: 'Bookings Management', icon: '📅' },
  { path: '/sub-admin/files', label: 'Files Management', icon: '📁' },
  { path: '/sub-admin/live-chat', label: 'Live Chat Support', icon: '💬' },
]

export default function Layout({ children, onLogout, userRole }: LayoutProps) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminRole')
    onLogout()
    navigate('/login')
  }

  const navItems = userRole === 'subAdmin' ? subAdminNavItems : adminNavItems

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="sidebar flex flex-col h-full shadow-lg">
        <div className="p-10 flex flex-col items-center">
          {/* <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-6 overflow-hidden border border-gray-50"> */}
          <img src={logo} alt="Amplia Logo" className="w-34 h-auto" />
          {/* </div> */}

        </div>

        <nav className="mt-8 flex-1 flex flex-col gap-2 px-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-3.5 transition-all duration-300 rounded-full group ${isActive
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'text-primary-500 hover:bg-white/50 hover:text-primary-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`mr-4 text-xl transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-105' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="font-bold text-sm tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-8 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-primary-500 hover:text-red-600 transition-all duration-300 group"
          >
            <span className="mr-4 text-xl group-hover:rotate-12 transition-transform duration-300">↩️</span>
            <span className="font-bold text-sm uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content flex-1 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
