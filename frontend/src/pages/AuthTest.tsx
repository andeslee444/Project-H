import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DEMO_CREDENTIALS } from '@/config/features/demo.config'

const AuthTest: React.FC = () => {
  const { user, isAuthenticated, loading, error, signIn, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    
    try {
      const result = await signIn(email, password)
      if (result.error) {
        setLoginError(result.error.message || 'Login failed')
      }
    } catch (err) {
      setLoginError('An unexpected error occurred')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleDemoLogin = async (credentials: typeof DEMO_CREDENTIALS[0]) => {
    setLoginError('')
    setLoginLoading(true)
    
    try {
      const result = await signIn(credentials.email, credentials.password)
      if (result.error) {
        setLoginError(result.error.message || 'Demo login failed')
      }
    } catch (err) {
      setLoginError('An unexpected error occurred')
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      {/* Current Status */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Current Status:</h2>
        <ul className="space-y-1">
          <li>Loading: {loading ? 'Yes' : 'No'}</li>
          <li>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</li>
          <li>User ID: {user?.id || 'None'}</li>
          <li>User Email: {user?.email || 'None'}</li>
          <li>User Role: {user?.role || 'None'}</li>
          <li>Is Admin: {user?.role === 'admin' || user?.role === 'super_admin' ? 'Yes' : 'No'}</li>
          <li>Is Provider: {user?.role === 'provider' ? 'Yes' : 'No'}</li>
        </ul>
        {error && <p className="text-red-600 mt-2">Auth Error: {error}</p>}
      </div>

      {!isAuthenticated ? (
        <>
          {/* Demo Login Buttons */}
          <div className="mb-6">
            <h2 className="font-semibold mb-3">Quick Demo Login:</h2>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.email}
                  onClick={() => handleDemoLogin(cred)}
                  disabled={loginLoading}
                  className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-left"
                >
                  <div className="font-medium">Login as {cred.role}</div>
                  <div className="text-sm opacity-90">{cred.email}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Login Form */}
          <div className="border-t pt-6">
            <h2 className="font-semibold mb-3">Manual Login:</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loginLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
          
          {loginError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {loginError}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="font-semibold text-green-800">You are logged in!</p>
            <p className="text-sm text-green-700 mt-1">
              Now you can navigate to the Providers page and should see the "Manage Specialties" button
              {user?.role === 'admin' || user?.role === 'super_admin' 
                ? ' on all provider cards.' 
                : user?.role === 'provider'
                ? ' on your own provider card.'
                : '.'}
            </p>
          </div>
          
          <div className="flex gap-4">
            <a 
              href="/providers" 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Providers Page
            </a>
            <button
              onClick={() => logout()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({ user, isAuthenticated, loading, error }, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default AuthTest