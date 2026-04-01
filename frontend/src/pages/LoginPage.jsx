import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App.jsx'

const DEMOS = [
  { role: 'Admin',    user: 'admin',    pass: 'password123' },
  { role: 'Faculty',  user: 'faculty1', pass: 'password123' },
  { role: 'Student',  user: 'student1', pass: 'password123' }
]

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      if (user.role === 'ADMIN')   navigate('/admin')
      else if (user.role === 'FACULTY') navigate('/faculty')
      else navigate('/student')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (u, p) => { setUsername(u); setPassword(p); setError('') }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">📊 SPBS</div>
        <p className="login-sub">Student Performance Benchmarking System</p>

        {error && <div className="login-err">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '9px' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

    
      </div>
    </div>
  )
}
