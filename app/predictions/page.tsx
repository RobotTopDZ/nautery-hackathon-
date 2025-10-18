'use client'

import { PredictionPanel } from '@/components/dashboard/PredictionPanel'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Brain, Target } from 'lucide-react'
import Link from 'next/link'

export default function PredictionsPage() {
  // Sample prediction scenarios
  const scenarios = [
    {
      name: "Industrial Discharge",
      description: "High concentration near industrial area",
      params: {
        sourceConcentration: 15.0,
        distance: 5,
        temperature: 22,
        pH: 6.8,
        currentSpeed: 1.2,
        toxicThreshold: 10
      }
    },
    {
      name: "Agricultural Runoff",
      description: "Moderate pesticide contamination",
      params: {
        sourceConcentration: 8.5,
        distance: 15,
        temperature: 18,
        pH: 7.2,
        currentSpeed: 0.3,
        toxicThreshold: 3
      }
    },
    {
      name: "Urban Wastewater",
      description: "Pharmaceutical compounds in coastal waters",
      params: {
        sourceConcentration: 2.1,
        distance: 25,
        temperature: 25,
        pH: 8.1,
        currentSpeed: 0.8,
        toxicThreshold: 1
      }
    }
  ]

  const sampleTrendData = [
    { date: '2024-01-01', concentration: 5.2, predicted: 4.8, threshold: 10 },
    { date: '2024-01-02', concentration: 4.9, predicted: 5.1, threshold: 10 },
    { date: '2024-01-03', concentration: 5.8, predicted: 5.4, threshold: 10 },
    { date: '2024-01-04', concentration: 6.2, predicted: 6.0, threshold: 10 },
    { date: '2024-01-05', concentration: 5.5, predicted: 5.8, threshold: 10 },
    { date: '2024-01-06', concentration: 7.1, predicted: 6.9, threshold: 10 },
    { date: '2024-01-07', concentration: 8.3, predicted: 8.1, threshold: 10 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-gray-700/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-primary">🔮 ML Predictions</h1>
                <p className="text-sm text-neutral/70">
                  Advanced contaminant diffusion modeling & risk assessment
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prediction Tool */}
          <div className="lg:col-span-1">
            <PredictionPanel />
          </div>

          {/* Results and Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Model Performance */}
            <TrendChart
              data={sampleTrendData}
              title="Model Performance: Predicted vs Observed"
              molecule="Sample Contaminant"
              type="line"
            />

            {/* Prediction Scenarios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Prediction Scenarios</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scenarios.map((scenario, index) => (
                    <div key={index} className="p-4 bg-card/50 rounded-lg border border-gray-600/50">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-sm">{scenario.name}</h3>
                          <p className="text-xs text-neutral/70">{scenario.description}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Load Scenario
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-neutral/70">Source:</span>
                          <div className="font-medium">{scenario.params.sourceConcentration} µg/L</div>
                        </div>
                        <div>
                          <span className="text-neutral/70">Distance:</span>
                          <div className="font-medium">{scenario.params.distance} km</div>
                        </div>
                        <div>
                          <span className="text-neutral/70">Threshold:</span>
                          <div className="font-medium">{scenario.params.toxicThreshold} µg/L</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Model Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Model Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-sm mb-2">Algorithm Details</h3>
                    <ul className="text-xs text-neutral/70 space-y-1">
                      <li>• Random Forest Regression (50 estimators)</li>
                      <li>• Physics-based fallback model</li>
                      <li>• 8 input features</li>
                      <li>• Trained on 1000+ synthetic data points</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-2">Input Features</h3>
                    <ul className="text-xs text-neutral/70 space-y-1">
                      <li>• Source concentration</li>
                      <li>• Distance from source</li>
                      <li>• Water temperature</li>
                      <li>• pH level</li>
                      <li>• Salinity</li>
                      <li>• Current speed</li>
                      <li>• Wind speed</li>
                      <li>• Water depth</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <h3 className="font-medium text-sm mb-2 text-primary">Model Accuracy</h3>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-neutral/70">Training RMSE:</div>
                      <div className="font-medium">0.23 µg/L</div>
                    </div>
                    <div>
                      <div className="text-neutral/70">Validation R²:</div>
                      <div className="font-medium">0.89</div>
                    </div>
                    <div>
                      <div className="text-neutral/70">Confidence:</div>
                      <div className="font-medium">85-95%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
