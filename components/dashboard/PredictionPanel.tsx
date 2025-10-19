'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Target, TrendingUp, AlertTriangle } from "lucide-react"

interface PredictionRequest {
  sourceConcentration: number
  distance: number
  temperature: number
  pH: number
  salinity?: number
  currentSpeed?: number
  windSpeed?: number
  depth?: number
  toxicThreshold?: number
}

interface PredictionResult {
  predictedConcentration: number
  confidence: number
  factors: {
    distance: number
    temperature: number
    hydrodynamics: number
    chemical: number
  }
}

interface RiskAssessment {
  riskLevel: number
  riskCategory: string
  exceedsThreshold: boolean
  safetyMargin: number
}

export function PredictionPanel() {
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)
  const [formData, setFormData] = useState<PredictionRequest>({
    sourceConcentration: 5.0,
    distance: 10,
    temperature: 20,
    pH: 7.5,
    salinity: 35,
    currentSpeed: 0.5,
    windSpeed: 10,
    depth: 5,
    toxicThreshold: 10
  })

  const handlePredict = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        setPrediction(result.prediction)
        setRiskAssessment(result.riskAssessment)
      }
    } catch (error) {
      console.error('Prediction error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 2: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 3: return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 4: return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 5: return 'bg-red-700/20 text-red-300 border-red-700/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>ML Prediction Tool</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-neutral/70 mb-1 block">Source Concentration (µg/L)</label>
            <input
              type="number"
              value={formData.sourceConcentration}
              onChange={(e) => setFormData({...formData, sourceConcentration: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 bg-card border border-gray-600 rounded text-sm"
              step="0.1"
            />
          </div>
          <div>
            <label className="text-xs text-neutral/70 mb-1 block">Distance (km)</label>
            <input
              type="number"
              value={formData.distance}
              onChange={(e) => setFormData({...formData, distance: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 bg-card border border-gray-600 rounded text-sm"
              step="1"
            />
          </div>
          <div>
            <label className="text-xs text-neutral/70 mb-1 block">Temperature (°C)</label>
            <input
              type="number"
              value={formData.temperature}
              onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 bg-card border border-gray-600 rounded text-sm"
              step="0.1"
            />
          </div>
          <div>
            <label className="text-xs text-neutral/70 mb-1 block">pH</label>
            <input
              type="number"
              value={formData.pH}
              onChange={(e) => setFormData({...formData, pH: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 bg-card border border-gray-600 rounded text-sm"
              step="0.1"
              min="0"
              max="14"
            />
          </div>
          <div>
            <label className="text-xs text-neutral/70 mb-1 block">Current Speed (m/s)</label>
            <input
              type="number"
              value={formData.currentSpeed}
              onChange={(e) => setFormData({...formData, currentSpeed: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 bg-card border border-gray-600 rounded text-sm"
              step="0.1"
            />
          </div>
          <div>
            <label className="text-xs text-neutral/70 mb-1 block">Toxic Threshold (µg/L)</label>
            <input
              type="number"
              value={formData.toxicThreshold}
              onChange={(e) => setFormData({...formData, toxicThreshold: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 bg-card border border-gray-600 rounded text-sm"
              step="0.1"
            />
          </div>
        </div>

        <Button 
          onClick={handlePredict} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Predicting...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              Generate Prediction
            </>
          )}
        </Button>

        {/* Results */}
        {prediction && (
          <div className="space-y-4 pt-4 border-t border-gray-600/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {prediction.predictedConcentration.toFixed(3)} µg/L
              </div>
              <div className="text-sm text-neutral/70">
                Predicted Concentration
              </div>
              <div className="text-xs text-neutral/50 mt-1">
                Confidence: {(prediction.confidence * 100).toFixed(1)}%
              </div>
            </div>

            {/* Factor Analysis */}
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-card/50 rounded">
                <div className="text-sm font-medium">Distance</div>
                <div className="text-xs text-primary">{(prediction.factors.distance * 100).toFixed(0)}%</div>
              </div>
              <div className="text-center p-2 bg-card/50 rounded">
                <div className="text-sm font-medium">Temperature</div>
                <div className="text-xs text-primary">{(prediction.factors.temperature * 100).toFixed(0)}%</div>
              </div>
              <div className="text-center p-2 bg-card/50 rounded">
                <div className="text-sm font-medium">Hydrodynamics</div>
                <div className="text-xs text-primary">{(prediction.factors.hydrodynamics * 100).toFixed(0)}%</div>
              </div>
              <div className="text-center p-2 bg-card/50 rounded">
                <div className="text-sm font-medium">Chemical</div>
                <div className="text-xs text-primary">{(prediction.factors.chemical * 100).toFixed(0)}%</div>
              </div>
            </div>

            {/* Risk Assessment */}
            {riskAssessment && (
              <div className="p-4 rounded-lg border border-gray-600/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Risk Assessment</span>
                  <Badge className={getRiskColor(riskAssessment.riskLevel)}>
                    {riskAssessment.riskCategory}
                  </Badge>
                </div>
                <div className="text-xs text-neutral/70 space-y-1">
                  <div>Risk Level: {riskAssessment.riskLevel}/5</div>
                  <div>Safety Margin: {(riskAssessment.safetyMargin * 100).toFixed(1)}%</div>
                  {riskAssessment.exceedsThreshold && (
                    <div className="flex items-center text-alert">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Exceeds toxic threshold
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
