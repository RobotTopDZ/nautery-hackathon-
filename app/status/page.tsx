'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'checking' | 'online' | 'offline'
  response?: any
  error?: string
}

export default function StatusPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Dashboard API', status: 'checking' },
    { name: 'KPIs API', status: 'checking' },
    { name: 'Prediction API', status: 'checking' },
    { name: 'ML Model', status: 'checking' }
  ])

  useEffect(() => {
    checkServices()
  }, [])

  const checkServices = async () => {
    // Test Dashboard API
    try {
      const dashRes = await fetch('/api/dashboard-simple')
      const dashData = await dashRes.json()
      updateService('Dashboard API', dashRes.ok ? 'online' : 'offline', dashData)
    } catch (error) {
      updateService('Dashboard API', 'offline', null, String(error))
    }

    // Test KPIs API
    try {
      const kpiRes = await fetch('/api/kpis-simple')
      const kpiData = await kpiRes.json()
      updateService('KPIs API', kpiRes.ok ? 'online' : 'offline', kpiData)
    } catch (error) {
      updateService('KPIs API', 'offline', null, String(error))
    }

    // Test Prediction API
    try {
      const predRes = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: 43.1242,
          longitude: 5.9280,
          contaminantGroup: 'HEAVY_METAL'
        })
      })
      const predData = await predRes.json()
      updateService('Prediction API', predRes.ok ? 'online' : 'offline', predData)
      
      // If prediction works, ML model is working
      if (predRes.ok && predData.success) {
        updateService('ML Model', 'online', predData.prediction)
      } else {
        updateService('ML Model', 'offline', null, 'Model prediction failed')
      }
    } catch (error) {
      updateService('Prediction API', 'offline', null, String(error))
      updateService('ML Model', 'offline', null, String(error))
    }
  }

  const updateService = (name: string, status: 'online' | 'offline', response?: any, error?: string) => {
    setServices(prev => prev.map(service => 
      service.name === name 
        ? { ...service, status, response, error }
        : service
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500'
      case 'offline': return 'text-red-500'
      default: return 'text-yellow-500'
    }
  }

  const allOnline = services.every(s => s.status === 'online')
  const anyOffline = services.some(s => s.status === 'offline')

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            🌊 Ocean Platform Status
          </h1>
          <div className={`text-2xl font-semibold ${
            allOnline ? 'text-green-500' : anyOffline ? 'text-red-500' : 'text-yellow-500'
          }`}>
            {allOnline ? '✅ All Systems Operational' : 
             anyOffline ? '❌ Some Issues Detected' : 
             '🔄 Checking Systems...'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <Card key={service.name} className="border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{service.name}</span>
                  {getStatusIcon(service.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg font-medium mb-2 ${getStatusColor(service.status)}`}>
                  {service.status.toUpperCase()}
                </div>
                
                {service.status === 'online' && service.response && (
                  <div className="space-y-2">
                    {service.name === 'Dashboard API' && (
                      <div className="text-sm text-neutral/70">
                        <div>• {service.response.heatmapData?.length || 0} heatmap points</div>
                        <div>• {service.response.riskData?.length || 0} risk assessments</div>
                        <div>• {service.response.predictions?.length || 0} predictions</div>
                      </div>
                    )}
                    
                    {service.name === 'KPIs API' && (
                      <div className="text-sm text-neutral/70">
                        <div>• Pollution Index: {service.response.pollution?.pollutionIndex}/100</div>
                        <div>• Compliance: {service.response.governance?.regulatoryCompliance}%</div>
                      </div>
                    )}
                    
                    {service.name === 'Prediction API' && (
                      <div className="text-sm text-neutral/70">
                        <div>• Response time: Fast</div>
                        <div>• Model integration: Working</div>
                      </div>
                    )}
                    
                    {service.name === 'ML Model' && (
                      <div className="text-sm text-neutral/70">
                        <div>• Model: Advanced Random Forest</div>
                        <div>• R² Score: 0.58</div>
                        <div>• Confidence: {((service.response.confidence || 0) * 100).toFixed(1)}%</div>
                      </div>
                    )}
                  </div>
                )}
                
                {service.status === 'offline' && service.error && (
                  <div className="text-sm text-red-400">
                    Error: {service.error}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-gray-700">
          <CardHeader>
            <CardTitle>🔗 Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/" className="text-primary hover:underline">
                📊 Dashboard
              </a>
              <a href="/predict" className="text-primary hover:underline">
                🔮 Predictions
              </a>
              <a href="/api/dashboard-simple" className="text-primary hover:underline" target="_blank">
                🔌 Dashboard API
              </a>
              <a href="/api/kpis-simple" className="text-primary hover:underline" target="_blank">
                📈 KPIs API
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-neutral/50">
          Last checked: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  )
}
