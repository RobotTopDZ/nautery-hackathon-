'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, BarChart3, PieChart, Activity } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-gray-700/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-primary">📊 Advanced Analytics</h1>
              <p className="text-sm text-neutral/70">
                Deep dive into environmental data patterns
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Correlation Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral/70 mb-4">
                Analyze relationships between environmental factors and pollution levels.
              </p>
              <Button className="w-full">Run Analysis</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Source Attribution</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral/70 mb-4">
                Identify primary pollution sources using ML algorithms.
              </p>
              <Button className="w-full">Generate Report</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Trend Forecasting</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral/70 mb-4">
                Long-term environmental trend predictions and scenarios.
              </p>
              <Button className="w-full">View Forecasts</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center text-neutral/50">
          <p>Advanced analytics features coming soon...</p>
        </div>
      </div>
    </div>
  )
}
