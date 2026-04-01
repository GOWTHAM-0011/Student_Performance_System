import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, Filler
)

const PALETTE = ['#2563eb','#16a34a','#d97706','#dc2626','#7c3aed','#0891b2','#db2777']

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { family: 'Inter', size: 12 }, boxWidth: 10 } }
  }
}

const SCALE_Y = {
  beginAtZero: true, max: 100,
  grid: { color: '#f1f5f9' },
  ticks: { callback: v => v + '%', font: { family: 'Inter', size: 11 } }
}

const SCALE_X = {
  grid: { display: false },
  ticks: { font: { family: 'Inter', size: 11 } }
}

/* ── Subject comparison bar ─────────────────────────────────── */
export function SubjectBar({ myScores = {}, classAvg = {}, title }) {
  const labels = Object.keys(myScores)
  const datasets = [
    {
      label: 'My Score %',
      data: labels.map(l => myScores[l] ?? 0),
      backgroundColor: '#2563eb',
      borderRadius: 4,
      barPercentage: 0.5
    }
  ]
  if (Object.keys(classAvg).length) {
    datasets.push({
      label: 'Class Avg %',
      data: labels.map(l => classAvg[l] ?? 0),
      backgroundColor: '#e2e8f0',
      borderRadius: 4,
      barPercentage: 0.5
    })
  }
  const options = {
    ...BASE_OPTS,
    plugins: { ...BASE_OPTS.plugins, title: { display: !!title, text: title, font: { family: 'Inter', size: 13, weight: '600' } } },
    scales: { y: SCALE_Y, x: SCALE_X }
  }
  return <Bar data={{ labels, datasets }} options={options} />
}

/* ── Grade distribution doughnut ────────────────────────────── */
export function GradeDoughnut({ distribution = {} }) {
  const labels  = Object.keys(distribution)
  const data    = labels.map(l => distribution[l])
  return (
    <Doughnut
      data={{ labels, datasets: [{ data, backgroundColor: PALETTE.slice(0, labels.length), borderWidth: 0, hoverOffset: 4 }] }}
      options={{ ...BASE_OPTS, cutout: '62%', plugins: { legend: { position: 'right', labels: { font: { family: 'Inter', size: 12 }, boxWidth: 10, padding: 12 } } } }}
    />
  )
}

/* ── Student comparison bar ─────────────────────────────────── */
export function ComparisonBar({ students = [] }) {
  const labels = students.map(s => s.studentName?.split(' ')[0] ?? '?')
  const data   = students.map(s => s.overallPct ?? 0)
  return (
    <Bar
      data={{ labels, datasets: [{ label: 'Overall %', data, backgroundColor: students.map((_, i) => PALETTE[i % PALETTE.length]), borderRadius: 4, barPercentage: 0.55 }] }}
      options={{ ...BASE_OPTS, plugins: { legend: { display: false } }, scales: { y: SCALE_Y, x: SCALE_X } }}
    />
  )
}

/* ── Trend line ──────────────────────────────────────────────── */
export function TrendLine({ records = [] }) {
  const sorted = [...records].sort((a, b) => new Date(a.examDate) - new Date(b.examDate))
  const labels  = sorted.map(r => `${r.subject} (${(r.examType || '').replace('_', ' ')})`)
  const data    = sorted.map(r => r.percentage ?? 0)
  return (
    <Line
      data={{ labels, datasets: [{ label: 'Score %', data, borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,.07)', borderWidth: 2, pointBackgroundColor: '#2563eb', pointRadius: 4, tension: 0.35, fill: true }] }}
      options={{ ...BASE_OPTS, plugins: { legend: { display: false } }, scales: { y: SCALE_Y, x: { ...SCALE_X, ticks: { ...SCALE_X.ticks, maxRotation: 40 } } } }}
    />
  )
}
