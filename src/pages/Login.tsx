import { useState } from 'react'
import { authApi } from '../lib/api'

import logo from '../assets/logo.png'

interface LoginProps {
  onLogin: () => void
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authApi.login(email, password)

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token)
        localStorage.setItem('adminRole', response.data.user.role)
        localStorage.setItem('userId', response.data.user._id)
        onLogin()
      } else {
        setError('Invalid response from server')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-bg bg-fixed">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="text-center mb-10">
          <img src={logo} alt="Amplia Logo" className="w-48 h-auto mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-primary-800 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 mt-2 font-medium">Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@amplia.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
