import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TaxSettings from './pages/TaxSettings'
import Users from './pages/Users'
import Services from './pages/Services'
import Categories from './pages/Categories'
import Bookings from './pages/Bookings'
import SubAdmins from './pages/SubAdmins'
import Settings from './pages/Settings'
import Ratings from './pages/Ratings'
import BookingsManagement from './pages/subAdmin/BookingsManagement'
import FilesManagement from './pages/subAdmin/FilesManagement'
import LiveChatSupport from './pages/subAdmin/LiveChatSupport'
import TaxCalculatorAdmin from './pages/TaxCalculatorAdmin'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const storedRole = localStorage.getItem('adminRole')

    setIsAuthenticated(!!token)
    setRole(storedRole)
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => {
      setIsAuthenticated(true)
      setRole(localStorage.getItem('adminRole'))
    }} />
  }

  return (
    <Layout onLogout={() => setIsAuthenticated(false)} userRole={role || undefined}>
      <Toaster position="top-right" />
      <Routes>
        {role === 'subAdmin' ? (
          <>
            <Route path="/sub-admin/bookings" element={<BookingsManagement />} />
            <Route path="/sub-admin/files" element={<FilesManagement />} />
            <Route path="/sub-admin/live-chat" element={<LiveChatSupport />} />
            <Route path="*" element={<Navigate to="/sub-admin/bookings" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tax-settings" element={<TaxSettings />} />
            <Route path="/users" element={<Users />} />
            <Route path="/services" element={<Services />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/sub-admins" element={<SubAdmins />} />
            <Route path="/ratings" element={<Ratings />} />
            <Route path="/tax-calculator" element={<TaxCalculatorAdmin />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Layout>
  )
}

export default App
