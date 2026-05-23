import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { AuthCallback } from './pages/AuthCallback'
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Default route redirects to dashboard (which will redirect to login if not authenticated) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
