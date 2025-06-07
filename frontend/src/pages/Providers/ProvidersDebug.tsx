import React from 'react'
import { useAuth } from '@/hooks/useAuthFixed'
import ProvidersSimpleTable from './ProvidersSimpleTable'

const ProvidersDebug: React.FC = () => {
  const { user } = useAuth()
  
  // Check for demo mode as fallback
  const getDemoUser = () => {
    const isDemoMode = localStorage.getItem('isDemoMode') === 'true'
    const demoUserStr = localStorage.getItem('demoUser')
    if (isDemoMode && demoUserStr) {
      try {
        return JSON.parse(demoUserStr)
      } catch {
        return null
      }
    }
    return null
  }

  const currentUser = user || getDemoUser()
  
  return (
    <div>
      {/* Debug info banner */}
      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '12px',
        marginBottom: '16px',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>Debug Info:</strong>
        <ul style={{ margin: '8px 0 0 20px' }}>
          <li>Current User ID: {currentUser?.id || 'Not logged in'}</li>
          <li>Current User Email: {currentUser?.email || 'No email'}</li>
          <li>Current User Role: {currentUser?.role || 'No role'}</li>
          <li>Provider ID: {currentUser?.provider_id || 'N/A'}</li>
          <li>Is Admin: {(currentUser?.role === 'admin' || currentUser?.role === 'super_admin') ? 'Yes' : 'No'}</li>
          <li>Is Provider: {currentUser?.role === 'provider' ? 'Yes' : 'No'}</li>
        </ul>
        <p style={{ marginTop: '8px', color: '#6b7280' }}>
          <strong>Expected behavior:</strong> 
          {currentUser?.role === 'admin' || currentUser?.role === 'super_admin' ? 
            ' As an admin, you should see "Manage Specialties" button on ALL provider cards.' :
            currentUser?.role === 'provider' ?
            ' As a provider, you should see "Manage Specialties" only on your own card, and "View Specialties" on others.' :
            ' You should only see "View Specialties" buttons.'}
        </p>
      </div>
      
      {/* The actual providers component */}
      <ProvidersSimpleTable />
    </div>
  )
}

export default ProvidersDebug