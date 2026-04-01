import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Modal   from '../components/Modal.jsx'
import { SubjectBar, GradeDoughnut } from '../components/Charts.jsx'
import api from '../services/api.js'
import { scoreClass, categoryBadge, fmtDate } from '../utils/helpers.js'

const NAV = [
  { path: '/admin',             icon: '🏠', label: 'Overview'    },
  { path: '/admin/students',    icon: '🎓', label: 'Students'    },
  { path: '/admin/faculty',     icon: '👨‍🏫', label: 'Faculty'    },
  { path: '/admin/performance', icon: '📊', label: 'Performance' },
  { path: '/admin/assignments', icon: '🔗', label: 'Assignments' },
]

const BLANK_USER = {
  username: '', email: '', password: '', fullName: '', role: 'STUDENT',
  rollNumber: '', department: 'Computer Science', semester: 3, section: 'A',
  dateOfBirth: '', employeeCode: '', specialization: '',
}
const BLANK_PERF = {
  studentProfileId: '', subject: '', subjectCode: '',
  marksObtained: '', maxMarks: 100,
  examType: 'MID_TERM', examDate: '', semester: 3, grade: '', remarks: '',
}
const BLANK_ASSIGN = { facultyProfileId: '', studentProfileId: '' }

function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card ${color || ''}`}>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [tab,       setTab]       = useState('overview')
  const [stats,     setStats]     = useState(null)
  const [students,  setStudents]  = useState([])
  const [faculty,   setFaculty]   = useState([])
  const [perf,      setPerf]      = useState([])
  const [assigns,   setAssigns]   = useState([])
  const [analytics, setAnalytics] = useState(null)

  const [showUser,   setShowUser]   = useState(false)
  const [showPerf,   setShowPerf]   = useState(false)
  const [showAssign, setShowAssign] = useState(false)
  const [editUser,   setEditUser]   = useState(null)
  const [editPerf,   setEditPerf]   = useState(null)

  const [userForm,   setUserForm]   = useState(BLANK_USER)
  const [perfForm,   setPerfForm]   = useState(BLANK_PERF)
  const [assignForm, setAssignForm] = useState(BLANK_ASSIGN)
  const [formErr,    setFormErr]    = useState('')

  // ── Loaders ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const [dashRes, facRes, stuRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/faculty'),
        api.get('/admin/students'),
      ])
      setStats(dashRes.data.data)
      setFaculty(facRes.data.data  || [])
      setStudents(stuRes.data.data || [])
    } catch (e) { console.error('load failed', e) }
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (tab === 'performance')
      api.get('/admin/performance').then(r => setPerf(r.data.data || [])).catch(() => {})
    if (tab === 'assignments')
      api.get('/admin/assignments').then(r => setAssigns(r.data.data || [])).catch(() => {})
  }, [tab])

  // ── Analytics ─────────────────────────────────────────────────────────────
  const openAnalytics = async (studentProfileId) => {
    setAnalytics(null); setTab('analytics')
    try {
      const r = await api.get(`/admin/students/${studentProfileId}/analytics`)
      setAnalytics(r.data.data)
    } catch (e) { console.error(e) }
  }

  // ── Save user ─────────────────────────────────────────────────────────────
  const saveUser = async () => {
    setFormErr('')
    try {
      if (editUser) {
        await api.put(`/admin/users/${editUser.id}`, userForm)
      } else {
        await api.post('/admin/users', userForm)
      }
      setShowUser(false); setEditUser(null); setUserForm(BLANK_USER); load()
    } catch (e) {
      const d = e.response?.data
      if (d?.data && typeof d.data === 'object') {
        setFormErr(Object.values(d.data).join(' | '))
      } else {
        setFormErr(d?.message || 'Error saving. Check all required fields.')
      }
    }
  }

  // ── Save performance record ────────────────────────────────────────────────
  const savePerf = async () => {
    setFormErr('')
    if (!perfForm.studentProfileId) { setFormErr('Please select a student'); return }
    if (!perfForm.subject.trim())   { setFormErr('Subject is required');      return }
    if (perfForm.marksObtained === '') { setFormErr('Marks obtained is required'); return }
    try {
      const body = {
        studentId:     Number(perfForm.studentProfileId), // PROFILE id, not user id
        subject:       perfForm.subject.trim(),
        subjectCode:   perfForm.subjectCode.trim() || null,
        marksObtained: Number(perfForm.marksObtained),
        maxMarks:      Number(perfForm.maxMarks) || 100,
        examType:      perfForm.examType || 'MID_TERM',
        examDate:      perfForm.examDate || null,
        semester:      Number(perfForm.semester) || null,
        grade:         perfForm.grade.trim() || null,
        remarks:       perfForm.remarks.trim() || null,
      }
      if (editPerf) await api.put(`/admin/performance/${editPerf.id}`, body)
      else          await api.post('/admin/performance', body)
      setShowPerf(false); setEditPerf(null); setPerfForm(BLANK_PERF)
      api.get('/admin/performance').then(r => setPerf(r.data.data || []))
      load()
    } catch (e) {
      const d = e.response?.data
      if (d?.data && typeof d.data === 'object') setFormErr(Object.values(d.data).join(' | '))
      else setFormErr(d?.message || 'Error saving record.')
    }
  }

  // ── Save assignment ────────────────────────────────────────────────────────
  const saveAssign = async () => {
    setFormErr('')
    if (!assignForm.facultyProfileId) { setFormErr('Please select a faculty member'); return }
    if (!assignForm.studentProfileId) { setFormErr('Please select a student');        return }
    try {
      await api.post('/admin/assignments', {
        facultyId: Number(assignForm.facultyProfileId), // PROFILE id
        studentId: Number(assignForm.studentProfileId), // PROFILE id
      })
      setShowAssign(false); setAssignForm(BLANK_ASSIGN)
      api.get('/admin/assignments').then(r => setAssigns(r.data.data || []))
    } catch (e) {
      setFormErr(e.response?.data?.message || 'Assignment failed. May already exist.')
    }
  }

  // ── Deletes ───────────────────────────────────────────────────────────────
  const deleteUser = async id => {
    if (!window.confirm('Delete this user? Their profile and records will also be removed.')) return
    try { await api.delete(`/admin/users/${id}`); load() }
    catch (e) { alert(e.response?.data?.message || 'Delete failed') }
  }

  const deletePerf = async id => {
    if (!window.confirm('Delete this record?')) return
    try {
      await api.delete(`/admin/performance/${id}`)
      api.get('/admin/performance').then(r => setPerf(r.data.data || []))
      load()
    } catch {}
  }

  const deleteAssign = async id => {
    if (!window.confirm('Remove this assignment?')) return
    try {
      await api.delete(`/admin/assignments/${id}`)
      api.get('/admin/assignments').then(r => setAssigns(r.data.data || []))
    } catch {}
  }

  // ── Open modals ───────────────────────────────────────────────────────────
  const openEditUser = u => {
    setEditUser(u)
    setUserForm({ username: u.username, email: u.email, password: '', fullName: u.fullName,
      role: u.role, rollNumber: u.rollNumber || '', department: u.department || '',
      semester: u.semester || 3, section: u.section || 'A', dateOfBirth: '',
      employeeCode: u.employeeCode || '', specialization: u.specialization || '' })
    setFormErr(''); setShowUser(true)
  }

  const openEditPerf = p => {
    setEditPerf(p)
    setPerfForm({ studentProfileId: String(p.studentId), subject: p.subject,
      subjectCode: p.subjectCode || '', marksObtained: p.marksObtained,
      maxMarks: p.maxMarks, examType: p.examType || 'MID_TERM',
      examDate: p.examDate ? String(p.examDate) : '',
      semester: p.semester || 3, grade: p.grade || '', remarks: p.remarks || '' })
    setFormErr(''); setShowPerf(true)
  }

  const openAddUser = role => {
    setEditUser(null); setUserForm({ ...BLANK_USER, role })
    setFormErr(''); setShowUser(true)
  }

  const openAddPerf = () => {
    setEditPerf(null); setPerfForm(BLANK_PERF)
    setFormErr(''); setShowPerf(true)
  }

  const openAddAssign = () => {
    setAssignForm(BLANK_ASSIGN); setFormErr(''); setShowAssign(true)
  }

  const uf = (k, v) => setUserForm(f => ({ ...f, [k]: v }))
  const pf = (k, v) => setPerfForm(f => ({ ...f, [k]: v }))

  const TABS = [
    { key: 'overview',     label: '🏠 Overview'    },
    { key: 'students',     label: '🎓 Students'    },
    { key: 'faculty',      label: '👨‍🏫 Faculty'    },
    { key: 'performance',  label: '📊 Performance' },
    { key: 'assignments',  label: '🔗 Assignments' },
  ]

  return (
    <div className="app-layout">
      <Sidebar items={NAV} />
      <div className="main-area">
        <div className="topbar">Admin Dashboard</div>
        <div className="page">

          <div className="tab-bar">
            {TABS.map(t => (
              <button key={t.key}
                className={`tab-btn ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>

          {/* ── OVERVIEW ─────────────────────────────────────── */}
          {tab === 'overview' && stats && (
            <>
              <div className="stats-row">
                <StatCard label="Total Students"  value={stats.totalStudents}  color="blue"  />
                <StatCard label="Class Average"   value={`${stats.classAvg}%`} color="green" />
                <StatCard label="Top Performers"  value={stats.topPerformers}  color="blue"  />
                <StatCard label="Needs Attention" value={stats.needsAttention} color="red"   />
              </div>
              <div className="grid-6040" style={{ marginBottom: 18 }}>
                <div className="card">
                  <div className="card-title">Class Subject Averages</div>
                  <div style={{ height: 240 }}>
                    <SubjectBar myScores={stats.subjectAvg || {}} />
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">Grade Distribution</div>
                  <div style={{ height: 240 }}>
                    <GradeDoughnut distribution={stats.gradeDist || {}} />
                  </div>
                </div>
              </div>
              <div className="grid-2">
                <div className="card">
                  <div className="card-title">🏆 Top Performers</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>#</th><th>Name</th><th>Score</th><th>Category</th><th></th></tr></thead>
                      <tbody>
                        {(stats.topStudents || []).map((s, i) => (
                          <tr key={s.studentId}>
                            <td><strong>{i + 1}</strong></td>
                            <td>{s.studentName}<br /><span className="text-sm text-muted">{s.rollNumber}</span></td>
                            <td><span className={`score ${scoreClass(s.overallPct)}`}>{s.overallPct}%</span></td>
                            <td><span className={`badge ${categoryBadge(s.category)}`}>{s.category}</span></td>
                            <td><button className="btn-ghost" onClick={() => openAnalytics(s.studentId)}>View</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <div className="card-title">⚠ Needs Attention (&lt;60%)</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Name</th><th>Score</th><th></th></tr></thead>
                      <tbody>
                        {!(stats.lowStudents?.length) && (
                          <tr><td colSpan={3} style={{ textAlign:'center', color:'var(--success)', padding:20 }}>
                            🎉 All above 60%
                          </td></tr>
                        )}
                        {(stats.lowStudents || []).map(s => (
                          <tr key={s.studentId} className="low-row">
                            <td>{s.studentName}<br /><span className="text-sm text-muted">{s.rollNumber}</span></td>
                            <td><span className="score score-lo">{s.overallPct}%</span></td>
                            <td><button className="btn-ghost" onClick={() => openAnalytics(s.studentId)}>View</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── STUDENTS ─────────────────────────────────────── */}
          {tab === 'students' && (
            <>
              <div className="page-header">
                <div><h1>Students</h1><p>{students.length} enrolled</p></div>
                <button className="btn btn-primary" onClick={() => openAddUser('STUDENT')}>+ Add Student</button>
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Roll No.</th><th>Dept</th><th>Sem</th><th>Sec</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {students.length === 0 && (
                        <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🎓</div>No students yet</div></td></tr>
                      )}
                      {students.map(s => (
                        <tr key={s.id}>
                          <td><strong>{s.fullName}</strong><br /><span className="text-sm text-muted">{s.email}</span></td>
                          <td className="text-mono">{s.rollNumber || '—'}</td>
                          <td>{s.department}</td><td>{s.semester}</td><td>{s.section}</td>
                          <td><span className={`badge ${s.active ? 'badge-green' : 'badge-red'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
                          <td style={{ display:'flex', gap:4 }}>
                            <button className="btn btn-sm btn-outline" title="Analytics"
                              onClick={() => s.profileId && openAnalytics(s.profileId)} disabled={!s.profileId}>📊</button>
                            <button className="btn btn-sm btn-outline" onClick={() => openEditUser(s)}>✏️</button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteUser(s.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── FACULTY ──────────────────────────────────────── */}
          {tab === 'faculty' && (
            <>
              <div className="page-header">
                <div><h1>Faculty</h1><p>{faculty.length} members</p></div>
                <button className="btn btn-primary" onClick={() => openAddUser('FACULTY')}>+ Add Faculty</button>
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Emp. Code</th><th>Department</th><th>Specialization</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {faculty.length === 0 && (
                        <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">👨‍🏫</div>No faculty yet</div></td></tr>
                      )}
                      {faculty.map(f => (
                        <tr key={f.id}>
                          <td><strong>{f.fullName}</strong><br /><span className="text-sm text-muted">{f.email}</span></td>
                          <td className="text-mono">{f.employeeCode || '—'}</td>
                          <td>{f.department}</td><td>{f.specialization}</td>
                          <td><span className={`badge ${f.active ? 'badge-green' : 'badge-red'}`}>{f.active ? 'Active' : 'Inactive'}</span></td>
                          <td style={{ display:'flex', gap:4 }}>
                            <button className="btn btn-sm btn-outline" onClick={() => openEditUser(f)}>✏️</button>
                            <button className="btn btn-sm btn-danger" onClick={() => deleteUser(f.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── PERFORMANCE ──────────────────────────────────── */}
          {tab === 'performance' && (
            <>
              <div className="page-header">
                <div><h1>Performance Records</h1><p>{perf.length} records</p></div>
                <button className="btn btn-primary" onClick={openAddPerf}>+ Add Record</button>
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Student</th><th>Subject</th><th>Type</th><th>Marks</th><th>%</th><th>Grade</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {perf.length === 0 && (
                        <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📊</div>No records yet</div></td></tr>
                      )}
                      {perf.map(p => (
                        <tr key={p.id} className={p.percentage < 50 ? 'low-row' : ''}>
                          <td><strong>{p.studentName}</strong><br /><span className="text-sm text-muted">{p.rollNumber}</span></td>
                          <td>{p.subject}<br /><span className="text-sm text-muted">{p.subjectCode}</span></td>
                          <td><span className="badge badge-gray">{(p.examType||'').replace('_',' ')}</span></td>
                          <td className="text-mono">{p.marksObtained}/{p.maxMarks}</td>
                          <td><span className={`score ${scoreClass(p.percentage)}`}>{p.percentage}%</span></td>
                          <td><strong>{p.grade}</strong></td>
                          <td className="text-sm">{fmtDate(p.examDate)}</td>
                          <td style={{ display:'flex', gap:4 }}>
                            <button className="btn btn-sm btn-outline" onClick={() => openEditPerf(p)}>✏️</button>
                            <button className="btn btn-sm btn-danger" onClick={() => deletePerf(p.id)}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── ASSIGNMENTS ──────────────────────────────────── */}
          {tab === 'assignments' && (
            <>
              <div className="page-header">
                <div><h1>Faculty–Student Assignments</h1><p>{assigns.length} assignments</p></div>
                <button className="btn btn-primary" onClick={openAddAssign}>+ Assign</button>
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Faculty</th><th>Emp. Code</th><th>Student</th><th>Roll No.</th><th>Action</th></tr></thead>
                    <tbody>
                      {assigns.length === 0 && (
                        <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">🔗</div>No assignments yet</div></td></tr>
                      )}
                      {assigns.map(a => (
                        <tr key={a.id}>
                          <td>{a.facultyName}</td>
                          <td className="text-mono">{a.employeeCode}</td>
                          <td>{a.studentName}</td>
                          <td className="text-mono">{a.rollNumber}</td>
                          <td><button className="btn btn-sm btn-danger" onClick={() => deleteAssign(a.id)}>Remove</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── ANALYTICS ────────────────────────────────────── */}
          {tab === 'analytics' && (
            <>
              <button className="btn btn-outline" style={{ marginBottom:16 }}
                onClick={() => setTab('students')}>← Back to Students</button>
              {!analytics && <div className="spinner-wrap"><div className="spinner" /></div>}
              {analytics && (
                <>
                  <div className="stats-row">
                    <StatCard label="Overall Score" value={`${analytics.overallPct}%`} color="blue"  />
                    <StatCard label="Grade"         value={analytics.overallGrade}      color="green" />
                    <StatCard label="Rank"          value={`#${analytics.rank} / ${analytics.totalStudents}`} />
                    <StatCard label="Category"      value={analytics.category} />
                  </div>
                  <div className="grid-6040" style={{ marginBottom:18 }}>
                    <div className="card">
                      <div className="card-title">{analytics.studentName} — Scores vs Class</div>
                      <div style={{ height:240 }}>
                        <SubjectBar myScores={analytics.subjectPct||{}} classAvg={analytics.classAvg||{}} />
                      </div>
                    </div>
                    <div className="card">
                      <p style={{ fontSize:12, fontWeight:600, color:'var(--success)', marginBottom:6 }}>💪 Strengths (≥75%)</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                        {(analytics.strengths||[]).map(s=><span key={s} className="badge badge-green">{s}</span>)}
                        {!analytics.strengths?.length && <span className="text-muted text-sm">None yet</span>}
                      </div>
                      <p style={{ fontSize:12, fontWeight:600, color:'var(--danger)', marginBottom:6 }}>📉 Weak Areas (&lt;55%)</p>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                        {(analytics.weaknesses||[]).map(s=><span key={s} className="badge badge-red">{s}</span>)}
                        {!analytics.weaknesses?.length && <span className="badge badge-green">All strong!</span>}
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-title">All Records</div>
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>Subject</th><th>Type</th><th>Marks</th><th>%</th><th>Grade</th><th>Remarks</th></tr></thead>
                        <tbody>
                          {(analytics.records||[]).map(r => (
                            <tr key={r.id}>
                              <td>{r.subject}</td>
                              <td><span className="badge badge-gray">{(r.examType||'').replace('_',' ')}</span></td>
                              <td className="text-mono">{r.marksObtained}/{r.maxMarks}</td>
                              <td><span className={`score ${scoreClass(r.percentage)}`}>{r.percentage}%</span></td>
                              <td><strong>{r.grade}</strong></td>
                              <td className="text-muted">{r.remarks}</td>
                            </tr>
                          ))}
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

      {/* ════ MODAL: Add/Edit User ════════════════════════════════ */}
      <Modal open={showUser} onClose={() => { setShowUser(false); setFormErr('') }}
        title={editUser
          ? `Edit ${editUser.role === 'STUDENT' ? 'Student' : 'Faculty'}: ${editUser.fullName}`
          : `Add New ${userForm.role === 'STUDENT' ? 'Student' : 'Faculty'}`}
        footer={<>
          <button className="btn btn-outline" onClick={() => { setShowUser(false); setFormErr('') }}>Cancel</button>
          <button className="btn btn-primary" onClick={saveUser}>{editUser ? 'Update' : 'Create'}</button>
        </>}>
        {formErr && <div className="login-err" style={{ marginBottom:12 }}>⚠ {formErr}</div>}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="e.g. Jane Doe" value={userForm.fullName} onChange={e=>uf('fullName',e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Username * {editUser && <span className="text-muted text-sm">(cannot change)</span>}</label>
            <input className="form-input" placeholder="e.g. jdoe" value={userForm.username} onChange={e=>uf('username',e.target.value)} disabled={!!editUser} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="e.g. jane@school.edu" value={userForm.email} onChange={e=>uf('email',e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Password * {editUser && <span className="text-muted text-sm">(blank = keep current)</span>}</label>
            <input className="form-input" type="password" placeholder={editUser ? 'Leave blank to keep' : 'Min 6 chars'} value={userForm.password} onChange={e=>uf('password',e.target.value)} />
          </div>
        </div>
        {!editUser && (
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-select" value={userForm.role} onChange={e=>uf('role',e.target.value)}>
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        )}
        {userForm.role === 'STUDENT' && (
          <div className="form-row">
            <div className="form-group"><label className="form-label">Roll Number</label><input className="form-input" placeholder="e.g. CS2024010" value={userForm.rollNumber} onChange={e=>uf('rollNumber',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={userForm.department} onChange={e=>uf('department',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Semester</label><input className="form-input" type="number" min={1} max={8} value={userForm.semester} onChange={e=>uf('semester',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Section</label><input className="form-input" placeholder="A or B" value={userForm.section} onChange={e=>uf('section',e.target.value)} /></div>
          </div>
        )}
        {userForm.role === 'FACULTY' && (
          <div className="form-row">
            <div className="form-group"><label className="form-label">Employee Code</label><input className="form-input" placeholder="e.g. EMP010" value={userForm.employeeCode} onChange={e=>uf('employeeCode',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Department</label><input className="form-input" value={userForm.department} onChange={e=>uf('department',e.target.value)} /></div>
            <div className="form-group" style={{ gridColumn:'1 / -1' }}><label className="form-label">Specialization</label><input className="form-input" placeholder="e.g. Machine Learning" value={userForm.specialization} onChange={e=>uf('specialization',e.target.value)} /></div>
          </div>
        )}
      </Modal>

      {/* ════ MODAL: Add/Edit Performance Record ═════════════════ */}
      <Modal open={showPerf} onClose={() => { setShowPerf(false); setFormErr('') }}
        title={editPerf ? 'Edit Performance Record' : 'Add Performance Record'}
        footer={<>
          <button className="btn btn-outline" onClick={() => { setShowPerf(false); setFormErr('') }}>Cancel</button>
          <button className="btn btn-primary" onClick={savePerf}>{editPerf ? 'Update' : 'Add Record'}</button>
        </>}>
        {formErr && <div className="login-err" style={{ marginBottom:12 }}>⚠ {formErr}</div>}
        <div className="form-group">
          <label className="form-label">Student *</label>
          <select className="form-select" value={perfForm.studentProfileId} onChange={e=>pf('studentProfileId',e.target.value)}>
            <option value="">— Select a student —</option>
            {students.filter(s=>s.profileId).map(s => (
              <option key={s.profileId} value={s.profileId}>
                {s.fullName}{s.rollNumber ? ` (${s.rollNumber})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group"><label className="form-label">Subject *</label><input className="form-input" placeholder="e.g. Data Structures" value={perfForm.subject} onChange={e=>pf('subject',e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Subject Code</label><input className="form-input" placeholder="e.g. CS301" value={perfForm.subjectCode} onChange={e=>pf('subjectCode',e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Marks Obtained *</label><input className="form-input" type="number" min={0} placeholder="e.g. 85" value={perfForm.marksObtained} onChange={e=>pf('marksObtained',e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Max Marks *</label><input className="form-input" type="number" min={1} value={perfForm.maxMarks} onChange={e=>pf('maxMarks',e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Exam Type</label>
            <select className="form-select" value={perfForm.examType} onChange={e=>pf('examType',e.target.value)}>
              {['MID_TERM','FINAL','QUIZ','ASSIGNMENT','PRACTICAL'].map(t=>(
                <option key={t} value={t}>{t.replace('_',' ')}</option>
              ))}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Grade</label><input className="form-input" placeholder="A+, A, B+ …" value={perfForm.grade} onChange={e=>pf('grade',e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Exam Date</label><input className="form-input" type="date" value={perfForm.examDate} onChange={e=>pf('examDate',e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Semester</label><input className="form-input" type="number" min={1} max={8} value={perfForm.semester} onChange={e=>pf('semester',e.target.value)} /></div>
        </div>
        <div className="form-group"><label className="form-label">Remarks</label><input className="form-input" placeholder="e.g. Excellent work" value={perfForm.remarks} onChange={e=>pf('remarks',e.target.value)} /></div>
      </Modal>

      {/* ════ MODAL: Assign Faculty to Student ════════════════════ */}
      <Modal open={showAssign} onClose={() => { setShowAssign(false); setFormErr('') }}
        title="Assign Faculty to Student"
        footer={<>
          <button className="btn btn-outline" onClick={() => { setShowAssign(false); setFormErr('') }}>Cancel</button>
          <button className="btn btn-primary" onClick={saveAssign}>Assign</button>
        </>}>
        {formErr && <div className="login-err" style={{ marginBottom:12 }}>⚠ {formErr}</div>}
        <div className="form-group">
          <label className="form-label">Faculty Member *</label>
          <select className="form-select" value={assignForm.facultyProfileId}
            onChange={e=>setAssignForm(f=>({...f,facultyProfileId:e.target.value}))}>
            <option value="">— Select a faculty member —</option>
            {faculty.filter(f=>f.profileId).map(f=>(
              <option key={f.profileId} value={f.profileId}>
                {f.fullName}{f.employeeCode ? ` (${f.employeeCode})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Student *</label>
          <select className="form-select" value={assignForm.studentProfileId}
            onChange={e=>setAssignForm(f=>({...f,studentProfileId:e.target.value}))}>
            <option value="">— Select a student —</option>
            {students.filter(s=>s.profileId).map(s=>(
              <option key={s.profileId} value={s.profileId}>
                {s.fullName}{s.rollNumber ? ` (${s.rollNumber})` : ''}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-muted" style={{ marginTop:8 }}>
          A faculty–student pair can only be assigned once.
        </p>
      </Modal>
    </div>
  )
}
