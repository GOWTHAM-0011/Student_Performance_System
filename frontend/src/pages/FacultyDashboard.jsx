import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { SubjectBar, ComparisonBar } from '../components/Charts.jsx'
import api from '../services/api.js'
import { scoreClass, categoryBadge, fmtDate } from '../utils/helpers.js'

const NAV = [
  { path: '/faculty', icon: '🏠', label: 'Dashboard' },
  { path: '/faculty/students', icon: '🎓', label: 'My Students' },
  { path: '/faculty/compare', icon: '📈', label: 'Compare' }
]

export default function FacultyDashboard() {
  const [tab, setTab]             = useState('dashboard')
  const [myStudents, setMyStudents] = useState([])
  const [stats, setStats]         = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [perfRecords, setPerfRecords] = useState([])
  const [allAnalytics, setAllAnalytics] = useState([])
  const [loading, setLoading]     = useState(false)

  const loadBase = useCallback(async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        api.get('/faculty/my-students'),
        api.get('/faculty/dashboard')
      ])
      setMyStudents(mRes.data.data || [])
      setStats(sRes.data.data)
    } catch {}
  }, [])

  useEffect(() => { loadBase() }, [loadBase])

  const openAnalytics = async (studentProfileId) => {
    setAnalytics(null); setPerfRecords([]); setTab('analytics'); setLoading(true)
    try {
      const [aRes, pRes] = await Promise.all([
        api.get(`/faculty/students/${studentProfileId}/analytics`),
        api.get(`/faculty/students/${studentProfileId}/performance`)
      ])
      setAnalytics(aRes.data.data)
      setPerfRecords(pRes.data.data || [])
    } catch {}
    setLoading(false)
  }

  const loadComparison = async () => {
    if (myStudents.length === 0) return
    const results = []
    for (const s of myStudents) {
      try {
        const r = await api.get(`/faculty/students/${s.studentProfileId}/analytics`)
        results.push(r.data.data)
      } catch {}
    }
    setAllAnalytics(results)
  }

  useEffect(() => {
    if (tab === 'compare') loadComparison()
  }, [tab])

  const tabs = [
    { key: 'dashboard', label: '🏠 Overview' },
    { key: 'students',  label: '🎓 My Students' },
    { key: 'compare',   label: '📈 Compare' }
  ]

  return (
    <div className="app-layout">
      <Sidebar items={NAV} />
      <div className="main-area">
        <div className="topbar">Faculty Dashboard</div>
        <div className="page">

          <div className="tab-bar">
            {tabs.map(t => (
              <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>

          {/* ── DASHBOARD OVERVIEW ───────────────────────────── */}
          {tab === 'dashboard' && (
            <>
              <div className="stats-row">
                <div className="stat-card blue"><div className="stat-value">{myStudents.length}</div><div className="stat-label">My Students</div></div>
                <div className="stat-card green"><div className="stat-value">{stats?.topPerformers ?? '—'}</div><div className="stat-label">Top Performers (Class)</div></div>
                <div className="stat-card amber"><div className="stat-value">{stats?.classAvg ?? '—'}%</div><div className="stat-label">Class Average</div></div>
                <div className="stat-card red"><div className="stat-value">{stats?.needsAttention ?? '—'}</div><div className="stat-label">Needs Attention</div></div>
              </div>

              {stats?.subjectAvg && Object.keys(stats.subjectAvg).length > 0 && (
                <div className="card mb-16">
                  <div className="card-title">Class Subject Averages</div>
                  <div style={{ height: 220 }}><SubjectBar myScores={stats.subjectAvg} /></div>
                </div>
              )}

              <div className="card">
                <div className="card-title">My Assigned Students</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {myStudents.length === 0 && <div className="empty-state"><div className="empty-icon">👥</div>No students assigned yet</div>}
                  {myStudents.map(s => (
                    <div key={s.assignmentId} className="card" style={{ cursor: 'pointer', border: '1px solid var(--border)' }}
                      onClick={() => openAnalytics(s.studentProfileId)}>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>🎓</div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{s.studentName}</div>
                      <div className="text-muted text-sm" style={{ marginBottom: 10 }}>{s.rollNumber}</div>
                      <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>View Analytics</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── MY STUDENTS LIST ─────────────────────────────── */}
          {tab === 'students' && (
            <>
              <div className="page-header">
                <div><h1>My Students</h1><p>{myStudents.length} assigned</p></div>
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Roll No.</th><th>Actions</th></tr></thead>
                    <tbody>
                      {myStudents.length === 0 && <tr><td colSpan={3}><div className="empty-state"><div className="empty-icon">🎓</div>No students assigned</div></td></tr>}
                      {myStudents.map(s => (
                        <tr key={s.assignmentId}>
                          <td><strong>{s.studentName}</strong></td>
                          <td className="text-mono">{s.rollNumber}</td>
                          <td><button className="btn btn-primary btn-sm" onClick={() => openAnalytics(s.studentProfileId)}>📊 View Analytics</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── COMPARE ──────────────────────────────────────── */}
          {tab === 'compare' && (
            <>
              <div className="page-header"><div><h1>Student Comparison</h1></div></div>
              {allAnalytics.length === 0
                ? <div className="spinner-wrap"><div className="spinner" /></div>
                : (
                  <>
                    <div className="card mb-16">
                      <div className="card-title">Overall Score Comparison</div>
                      <div style={{ height: 240 }}><ComparisonBar students={allAnalytics} /></div>
                    </div>
                    <div className="card">
                      <div className="card-title">Rankings</div>
                      <table>
                        <thead><tr><th>Rank</th><th>Student</th><th>Score</th><th>Grade</th><th>Category</th><th></th></tr></thead>
                        <tbody>
                          {[...allAnalytics].sort((a, b) => b.overallPct - a.overallPct).map((s, i) => (
                            <tr key={s.studentId} className={s.overallPct < 60 ? 'low-row' : ''}>
                              <td><strong>#{i + 1}</strong></td>
                              <td>{s.studentName}<br /><span className="text-sm text-muted">{s.rollNumber}</span></td>
                              <td><span className={`score ${scoreClass(s.overallPct)}`}>{s.overallPct}%</span></td>
                              <td><strong>{s.overallGrade}</strong></td>
                              <td><span className={`badge ${categoryBadge(s.category)}`}>{s.category}</span></td>
                              <td><button className="btn-ghost" onClick={() => openAnalytics(s.studentId)}>Details</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )
              }
            </>
          )}

          {/* ── STUDENT ANALYTICS DETAIL ─────────────────────── */}
          {tab === 'analytics' && (
            <>
              <button className="btn btn-outline mb-16" onClick={() => setTab('students')}>← Back</button>
              {loading && <div className="spinner-wrap"><div className="spinner" /></div>}
              {!loading && analytics && (
                <>
                  <div className="stats-row">
                    <div className="stat-card blue"><div className="stat-value">{analytics.overallPct}%</div><div className="stat-label">Overall Score</div></div>
                    <div className="stat-card green"><div className="stat-value">{analytics.overallGrade}</div><div className="stat-label">Grade</div></div>
                    <div className="stat-card"><div className="stat-value">#{analytics.rank}/{analytics.totalStudents}</div><div className="stat-label">Class Rank</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ fontSize: 16 }}>{analytics.category}</div><div className="stat-label">Category</div></div>
                  </div>
                  <div className="grid-6040 mb-16">
                    <div className="card">
                      <div className="card-title">{analytics.studentName} — Scores vs Class</div>
                      <div style={{ height: 240 }}><SubjectBar myScores={analytics.subjectPct || {}} classAvg={analytics.classAvg || {}} /></div>
                    </div>
                    <div className="card">
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 6 }}>💪 Strengths</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                        {(analytics.strengths || []).map(s => <span key={s} className="badge badge-green">{s}</span>)}
                        {!analytics.strengths?.length && <span className="text-muted text-sm">None identified</span>}
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>📉 Weak Areas</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {(analytics.weaknesses || []).map(s => <span key={s} className="badge badge-red">{s}</span>)}
                        {!analytics.weaknesses?.length && <span className="badge badge-green">All good!</span>}
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-title">Performance Records</div>
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Subject</th><th>Type</th><th>Marks</th><th>%</th><th>Grade</th><th>Date</th><th>Remarks</th></tr></thead>
                        <tbody>
                          {perfRecords.map(r => (
                            <tr key={r.id} className={r.percentage < 50 ? 'low-row' : ''}>
                              <td>{r.subject}</td>
                              <td><span className="badge badge-gray">{(r.examType || '').replace('_', ' ')}</span></td>
                              <td className="text-mono">{r.marksObtained}/{r.maxMarks}</td>
                              <td><span className={`score ${scoreClass(r.percentage)}`}>{r.percentage}%</span></td>
                              <td><strong>{r.grade}</strong></td>
                              <td className="text-sm">{fmtDate(r.examDate)}</td>
                              <td className="text-muted">{r.remarks}</td>
                            </tr>
                          ))}
                          {perfRecords.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>No records</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
