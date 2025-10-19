import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region') || 'all'
    const molecule = searchParams.get('molecule')
    const timeRange = searchParams.get('timeRange') || '7d'

    // Generate mock data for dashboard
    const mockHeatmapData = [
      { lat: 43.1, lng: 5.9, intensity: 0.8 },
      { lat: 43.12, lng: 5.95, intensity: 0.6 },
      { lat: 43.08, lng: 5.88, intensity: 0.4 },
      { lat: 43.15, lng: 6.0, intensity: 0.7 }
    ]

    const mockRiskData = [
      { location: 'Toulon Bay', riskLevel: 'MODERATE', riskScore: 65, coordinates: [43.1, 5.9] },
      { location: 'Hyères', riskLevel: 'LOW', riskScore: 35, coordinates: [43.12, 6.13] }
    ]

    const mockTrends = [
      { date: '2024-10-12', concentration: 2.3 },
      { date: '2024-10-13', concentration: 2.1 },
      { date: '2024-10-14', concentration: 2.5 },
      { date: '2024-10-15', concentration: 2.8 },
      { date: '2024-10-16', concentration: 2.4 },
      { date: '2024-10-17', concentration: 2.6 },
      { date: '2024-10-18', concentration: 2.2 }
    ]

    const mockPredictions = [
      {
        id: 1,
        distance: 5.2,
        concentration: 1.8,
        confidence: 0.85,
        source: { lat: 43.1, lng: 5.9 },
        target: { lat: 43.12, lng: 5.95 }
      }
    ]

    return NextResponse.json({
      success: true,
      data: {
        heatmapData: mockHeatmapData,
        riskData: mockRiskData,
        trends: mockTrends,
        predictions: mockPredictions,
        summary: {
          totalMeasurements: 156,
          avgConcentration: 2.4,
          maxConcentration: 4.2,
          totalSites: 8,
          avgRiskScore: 45,
          timeRange,
          lastUpdated: new Date()
        }
      }
    })

  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

function getRiskCategory(level: number): string {
  switch (level) {
    case 1: return 'Low'
    case 2: return 'Low-Medium'
    case 3: return 'Medium'
    case 4: return 'High'
    case 5: return 'Critical'
    default: return 'Unknown'
  }
}
