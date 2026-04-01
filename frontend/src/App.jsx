import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import api from './services/api.js'
import LoginPage        from './pages/LoginPage.jsx'
import AdminDashboard   from './pages/AdminDashboard.jsx'
import FacultyDashboard from './pages/FacultyDashboard.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'

/* ── Auth Context ───────────────────────────────────────────── */
const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Check existing session on mount
  useEffect(() => {
    api.get('/auth/me')
      .then(r => setUser(r.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const r = await api.post('/auth/login', { username, password })
    setUser(r.data.data)
    return r.data.data
  }

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

/* ── Guards ─────────────────────────────────────────────────── */
function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />
  return children
}

function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN')   return <Navigate to="/admin"   replace />
  if (user.role === 'FACULTY') return <Navigate to="/faculty" replace />
  return <Navigate to="/student" replace />
}

/* ── App ─────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/"         element={<RoleRedirect />} />
          <Route path="/admin/*"  element={<RequireAuth roles={['ADMIN']}><AdminDashboard /></RequireAuth>} />
          <Route path="/faculty/*" element={<RequireAuth roles={['FACULTY']}><FacultyDashboard /></RequireAuth>} />
          <Route path="/student/*" element={<RequireAuth roles={['STUDENT']}><StudentDashboard /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
