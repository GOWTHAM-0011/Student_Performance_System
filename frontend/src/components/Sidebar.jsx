import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App.jsx'

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function Sidebar({ items }) {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-name">📊 SPBS</div>
        <div className="brand-sub">Benchmarking System</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">Navigation</div>
        {/* {items.map(item => (
          <button
            key={item.path}
            className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))} */}
        <button
  className="nav-btn"
  onClick={() => navigate("/dashboard")}
>
  <span className="nav-text">🏠 My Dashboard</span>
</button>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials(user?.fullName)}</div>
          <div style={{ overflow: 'hidden' }}>
            <div className="user-name">{user?.fullName}</div>
            <div className="user-role">{user?.role}</div>
          </div>
        </div>
        <button className="btn-signout" onClick={handleLogout}>Sign Out</button>
      </div>
    </aside>
  )
}
