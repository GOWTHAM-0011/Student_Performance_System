import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { SubjectBar, TrendLine } from '../components/Charts.jsx'
import api from '../services/api.js'
import { scoreClass, categoryBadge, progressClass, fmtDate } from '../utils/helpers.js'

const NAV = [
  { path: '/student', icon: '🏠', label: 'My Dashboard' },
  { path: '/student/records', icon: '📋', label: 'My Records' },
  { path: '/student/compare', icon: '📈', label: 'Class Compare' }
]

export default function StudentDashboard() {
  const [tab, setTab]           = useState('dashboard')
  const [analytics, setAnalytics] = useState(null)
  const [records, setRecords]   = useState([])
  const [classStats, setClassStats] = useState(null)
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [aRes, rRes] = await Promise.all([
        api.get('/student/analytics'),
        api.get('/student/performance')
      ])
      setAnalytics(aRes.data.data)
      setRecords(rRes.data.data || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (tab === 'compare') {
      api.get('/student/class-stats').then(r => setClassStats(r.data.data)).catch(() => {})
    }
  }, [tab])

  const tabs = [
    { key: 'dashboard', label: '🏠 My Dashboard' },
    { key: 'records',   label: '📋 My Records' },
    { key: 'compare',   label: '📈 Class Compare' }
  ]

  if (loading) return <div className="spinner-wrap" style={{ height: '100vh' }}><div className="spinner" /></div>

  const subjects = Object.entries(analytics?.subjectPct || {})

  return (
    <div className="app-layout">
      <Sidebar items={NAV} />
      <div className="main-area">
        <div className="topbar">Student Dashboard</div>
        <div className="page">

          <div className="tab-bar">
            {tabs.map(t => (
              <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>

          {/* ── MY DASHBOARD ─────────────────────────────────── */}
          {tab === 'dashboard' && analytics && (
            <>
              <div className="page-header">
                <div>
                  <h1>Hello, {analytics.studentName?.split(' ')[0]} 👋</h1>
                  <p>{analytics.rollNumber} · Semester Performance</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 30, fontWeight: 700, color: 'var(--primary)' }}>{analytics.overallPct}%</div>
                  <span className={`badge ${categoryBadge(analytics.category)}`}>{analytics.category}</span>
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-card blue"><div className="stat-value">{analytics.overallPct}%</div><div className="stat-label">Overall Score</div></div>
                <div className="stat-card green"><div className="stat-value">{analytics.overallGrade}</div><div className="stat-label">Grade</div></div>
                <div className="stat-card"><div className="stat-value">#{analytics.rank} / {analytics.totalStudents}</div><div className="stat-label">Class Rank</div></div>
                <div className="stat-card"><div className="stat-value">{subjects.length}</div><div className="stat-label">Subjects</div></div>
              </div>

              <div className="grid-6040 mb-16">
                <div className="card">
                  <div className="card-title">My Scores vs Class Average</div>
                  <div style={{ height: 240 }}>
                    <SubjectBar myScores={analytics.subjectPct || {}} classAvg={analytics.classAvg || {}} />
                  </div>
                </div>
                <div className="card">
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--success)', marginBottom: 6 }}>💪 Strengths (≥75%)</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(analytics.strengths || []).map(s => <span key={s} className="badge badge-green">{s}</span>)}
                      {!analytics.strengths?.length && <span className="text-muted text-sm">Keep working hard!</span>}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 }}>📉 Focus Areas (&lt;55%)</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(analytics.weaknesses || []).map(s => <span key={s} className="badge badge-red">{s}</span>)}
                      {!analytics.weaknesses?.length && <span className="badge badge-green">All above threshold!</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Subject Breakdown</div>
                {subjects.map(([subj, pct]) => {
                  const classVal = analytics.classAvg?.[subj]
                  const diff = classVal != null ? (pct - classVal).toFixed(1) : null
                  return (
                    <div key={subj} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{subj}</span>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {diff != null && (
                            <span style={{ fontSize: 11, color: Number(diff) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {Number(diff) >= 0 ? '+' : ''}{diff}% vs class
                            </span>
                          )}
                          <span className={`score ${scoreClass(pct)}`}>{pct}%</span>
                        </div>
                      </div>
                      <div className="progress">
                        <div className={`progress-fill ${progressClass(pct)}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* ── MY RECORDS ───────────────────────────────────── */}
          {tab === 'records' && (
            <>
              <div className="page-header">
                <div><h1>My Performance Records</h1><p>{records.length} total records</p></div>
              </div>

              {records.length > 0 && (
                <div className="card mb-16">
                  <div className="card-title">Score Trend</div>
                  <div style={{ height: 200 }}><TrendLine records={records} /></div>
                </div>
              )}

              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Subject</th><th>Code</th><th>Type</th><th>Marks</th><th>%</th><th>Grade</th><th>Date</th><th>Remarks</th></tr></thead>
                    <tbody>
                      {records.length === 0 && <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📋</div>No records yet</div></td></tr>}
                      {records.map(r => (
                        <tr key={r.id} className={r.percentage < 50 ? 'low-row' : ''}>
                          <td><strong>{r.subject}</strong></td>
                          <td className="text-mono text-sm">{r.subjectCode}</td>
                          <td><span className="badge badge-gray">{(r.examType || '').replace('_', ' ')}</span></td>
                          <td className="text-mono">{r.marksObtained}/{r.maxMarks}</td>
                          <td><span className={`score ${scoreClass(r.percentage)}`}>{r.percentage}%</span></td>
                          <td><strong>{r.grade}</strong></td>
                          <td className="text-sm">{fmtDate(r.examDate)}</td>
                          <td className="text-muted text-sm">{r.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── CLASS COMPARE ────────────────────────────────── */}
          {tab === 'compare' && (
            <>
              <div className="page-header"><div><h1>Class Comparison</h1><p>How you stand among classmates</p></div></div>

              {!classStats
                ? <div className="spinner-wrap"><div className="spinner" /></div>
                : (
                  <>
                    <div className="stats-row">
                      <div className="stat-card blue"><div className="stat-value">{classStats.classAvg}%</div><div className="stat-label">Class Average</div></div>
                      <div className="stat-card green"><div className="stat-value">{classStats.topPerformers}</div><div className="stat-label">Top Performers (≥75%)</div></div>
                      <div className="stat-card red"><div className="stat-value">{classStats.needsAttention}</div><div className="stat-label">Below 50%</div></div>
                      <div className="stat-card"><div className="stat-value">#{analytics?.rank} / {analytics?.totalStudents}</div><div className="stat-label">Your Rank</div></div>
                    </div>

                    <div className="card mb-16">
                      <div className="card-title">Your Score vs Class Average (by subject)</div>
                      <div style={{ height: 240 }}>
                        <SubjectBar myScores={analytics?.subjectPct || {}} classAvg={classStats.subjectAvg || {}} />
                      </div>
                    </div>

                    <div className="card">
                      <div className="card-title">Class Leaderboard (Top 5)</div>
                      <table>
                        <thead><tr><th>Rank</th><th>Student</th><th>Score</th><th>Grade</th><th>Category</th></tr></thead>
                        <tbody>
                          {(classStats.topStudents || []).map((s, i) => {
                            const isMe = s.studentId === analytics?.studentId
                            return (
                              <tr key={s.studentId} className={isMe ? 'highlight-row' : ''}>
                                <td><strong>#{i + 1}</strong></td>
                                <td>
                                  {s.studentName} {isMe && <span className="badge badge-blue" style={{ fontSize: 10 }}>You</span>}
                                  <br /><span className="text-sm text-muted">{s.rollNumber}</span>
                                </td>
                                <td><span className={`score ${scoreClass(s.overallPct)}`}>{s.overallPct}%</span></td>
                                <td><strong>{s.overallGrade}</strong></td>
                                <td><span className={`badge ${categoryBadge(s.category)}`}>{s.category}</span></td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )
              }
            </>
          )}
        </div>
      </div>
    </div>
  )
}
