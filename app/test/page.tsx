'use client'

import { useEffect, useState } from 'react'

export default function TestPage() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [kpiData, setKPIData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardRes, kpiRes] = await Promise.all([
          fetch('/api/dashboard-simple'),
          fetch('/api/kpis-simple')
        ])

        if (dashboardRes.ok && kpiRes.ok) {
          const dashboard = await dashboardRes.json()
          const kpis = await kpiRes.json()
          
          setDashboardData(dashboard)
          setKPIData(kpis)
        } else {
          setError('Failed to fetch data')
        }
      } catch (err) {
        setError('Network error: ' + err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">API Test Results</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl">Dashboard Data:</h2>
        <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(dashboardData, null, 2)}
        </pre>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl">KPI Data:</h2>
        <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(kpiData, null, 2)}
        </pre>
      </div>
    </div>
  )
}
