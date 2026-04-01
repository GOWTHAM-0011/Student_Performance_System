export const scoreClass = pct =>
  pct >= 75 ? 'score-hi' : pct >= 50 ? 'score-mid' : 'score-lo'

export const progressClass = pct =>
  pct >= 75 ? 'prog-green' : pct >= 50 ? 'prog-amber' : 'prog-red'

export const categoryBadge = cat => ({
  'Outstanding':      'badge-green',
  'Excellent':        'badge-blue',
  'Good':             'badge-blue',
  'Average':          'badge-amber',
  'Needs Improvement':'badge-red'
}[cat] || 'badge-gray')

export const fmtDate = d => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
