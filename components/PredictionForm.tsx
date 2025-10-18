'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, MapPin, Beaker, AlertTriangle, CheckCircle } from 'lucide-react'

interface PredictionResult {
  concentration: number
  confidence: number
  riskLevel: number
  riskCategory: string
  modelUsed: string
  predictionDate: string
}

export default function PredictionForm() {
  const [formData, setFormData] = useState({
    latitude: '43.1242', // Toulon default
    longitude: '5.9280',
    depth: '15',
    temperature: '20',
    salinity: '35',
    pH: '8.1',
    dissolvedOxygen: '8',
    turbidity: '2',
    contaminantGroup: '',
    analyticalMethod: 'ICP-MS',
    safeLimitUgL: '1.0',
    detectionLimitUgL: '0.01',
    bioaccumulationFactor: '100',
    uncertaintyPercent: '10'
  })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePredict = async () => {
    if (!formData.contaminantGroup) {
      setError('Please select a contaminant group')
      return
    }

    setLoading(true)
    setError('')
    setPrediction(null)

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setPrediction(result.prediction)
      } else {
        setError(result.error || 'Prediction failed')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (riskCategory: string) => {
    switch (riskCategory) {
      case 'LOW': return 'text-green-500'
      case 'MODERATE': return 'text-yellow-500'
      case 'HIGH': return 'text-orange-500'
      case 'CRITICAL': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getRiskIcon = (riskCategory: string) => {
    switch (riskCategory) {
      case 'LOW': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'MODERATE': case 'HIGH': case 'CRITICAL': 
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default: return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-6 w-6" />
            Contamination Prediction
          </CardTitle>
          <CardDescription>
            Predict contaminant concentrations using our Advanced Random Forest model
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={formData.latitude}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('latitude', e.target.value)}
                placeholder="43.1242"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={formData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="5.9280"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth">Depth (m)</Label>
              <Input
                id="depth"
                value={formData.depth}
                onChange={(e) => handleInputChange('depth', e.target.value)}
                placeholder="15"
              />
            </div>
          </div>

          {/* Environmental Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                value={formData.temperature}
                onChange={(e) => handleInputChange('temperature', e.target.value)}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salinity">Salinity (PSU)</Label>
              <Input
                id="salinity"
                value={formData.salinity}
                onChange={(e) => handleInputChange('salinity', e.target.value)}
                placeholder="35"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pH">pH</Label>
              <Input
                id="pH"
                value={formData.pH}
                onChange={(e) => handleInputChange('pH', e.target.value)}
                placeholder="8.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turbidity">Turbidity (NTU)</Label>
              <Input
                id="turbidity"
                value={formData.turbidity}
                onChange={(e) => handleInputChange('turbidity', e.target.value)}
                placeholder="2"
              />
            </div>
          </div>

          {/* Contaminant Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contaminantGroup">Contaminant Group *</Label>
              <select 
                value={formData.contaminantGroup} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('contaminantGroup', e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-600 bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="">Select contaminant group</option>
                <option value="HEAVY_METAL">Heavy Metal</option>
                <option value="HYDROCARBON">Hydrocarbon</option>
                <option value="ORGANOHALOGEN">Organohalogen</option>
                <option value="PESTICIDE">Pesticide</option>
                <option value="PHARMACEUTICAL">Pharmaceutical</option>
                <option value="MICROPLASTIC">Microplastic</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="analyticalMethod">Analytical Method</Label>
              <select 
                value={formData.analyticalMethod} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('analyticalMethod', e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-600 bg-card px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <option value="ICP-MS">ICP-MS</option>
                <option value="GC-MS">GC-MS</option>
                <option value="LC-MS">LC-MS</option>
                <option value="AAS">AAS</option>
              </select>
            </div>
          </div>

          {/* Prediction Button */}
          <Button 
            onClick={handlePredict} 
            disabled={loading || !formData.contaminantGroup}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Prediction...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Predict Concentration
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Prediction Results */}
          {prediction && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getRiskIcon(prediction.riskCategory)}
                  Prediction Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Predicted Concentration</Label>
                    <div className="text-2xl font-bold text-primary">
                      {prediction.concentration.toFixed(4)} µg/L
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confidence Score</Label>
                    <div className="text-2xl font-bold text-primary">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Risk Category</Label>
                    <div className={`text-xl font-bold ${getRiskColor(prediction.riskCategory)}`}>
                      {prediction.riskCategory}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Model Used</Label>
                    <div className="text-lg font-medium">
                      {prediction.modelUsed}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  Prediction generated on {new Date(prediction.predictionDate).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-primary mb-4">
          🌊 Prédicteur de Contamination Marine
        </h1>
        <p className="text-sm md:text-lg text-neutral/80 max-w-2xl mx-auto">
          Utilisez notre modèle d'intelligence artificielle avancé pour prédire les concentrations 
          de contaminants dans les eaux marines autour de Toulon, France et la Méditerranée.
        </p>
      </div>
    </div>
  )
}
