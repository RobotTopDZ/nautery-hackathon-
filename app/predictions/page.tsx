'use client'

import { PredictionPanel } from '@/components/dashboard/PredictionPanel'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Brain, Target } from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { Logo } from '@/components/Logo'
import { Header } from '@/components/Header'
import { MobileNavigation } from '@/components/MobileNavigation'

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
    <div className="min-h-screen bg-background flex">
      {/* Navigation */}
      <Navigation />
      
      <div className="flex-1 lg:ml-0">
        <Header 
          title="Prédictions IA"
        />

        <div className="pt-20 container mx-auto px-6 py-6 mobile-content-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prediction Tool */}
          <div className="lg:col-span-1">
            <PredictionPanel />
          </div>

          {/* Results and Analysis */}
          <div className="lg:col-span-2 space-y-6">


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
                      <div className="font-medium">0.23 ng/L</div>
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
        
        <MobileNavigation />
      </div>
    </div>
  )
}
