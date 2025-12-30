import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoginPage } from './pages/LoginPage'
import { UserPage } from './pages/UserPage'
import { AdminPage } from './pages/AdminPage'
import { ProfilePage } from './pages/ProfilePage'

// Root redirect component - handles authentication state and redirects accordingly
const RootRedirect = () => {
  const { user, isLoading } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // If loading takes too long (more than 1 second), redirect to login
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        console.log('Loading timeout in RootRedirect, redirecting to login')
        setShouldRedirect(true)
      }, 1000) // 1 second timeout

      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // If loading timeout reached, redirect to login immediately
  if (shouldRedirect) {
    return <Navigate to="/login" replace />
  }

  // If loading, show loading screen
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // If authenticated, redirect based on role
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />
  } else {
    return <Navigate to="/user" replace />
  }
}

// Protected Route Component
const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode
  requireAdmin?: boolean
}) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/user" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RootRedirect />} />
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
