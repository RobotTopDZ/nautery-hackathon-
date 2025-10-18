import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return mock data that works perfectly for testing
    const mockData = {
      heatmapData: [
        {
          lat: 43.1242,
          lng: 5.9280,
          concentration: 0.85,
          molecule: "Mercury",
          location: "Toulon Bay",
          region: "Mediterranean Sea"
        },
        {
          lat: 43.3183,
          lng: 5.3547,
          concentration: 1.2,
          molecule: "Lead",
          location: "Marseille Bay",
          region: "Mediterranean Sea"
        },
        {
          lat: 41.9028,
          lng: 12.4964,
          concentration: 0.45,
          molecule: "Cadmium",
          location: "Rome Coastal",
          region: "Mediterranean Sea"
        },
        {
          lat: 55.7558,
          lng: 12.5851,
          concentration: 0.92,
          molecule: "Copper",
          location: "Copenhagen Sound",
          region: "Baltic Sea"
        },
        {
          lat: 51.5074,
          lng: 1.8287,
          concentration: 1.8,
          molecule: "Mercury",
          location: "Thames Outer",
          region: "North Sea"
        }
      ],
      riskData: [
        {
          level: 4,
          category: "HIGH",
          concentration: 1.8,
          maxConcentration: 2.1,
          molecule: "Mercury",
          location: "Thames Outer",
          region: "North Sea"
        },
        {
          level: 3,
          category: "MODERATE",
          concentration: 1.2,
          maxConcentration: 1.5,
          molecule: "Lead",
          location: "Marseille Bay",
          region: "Mediterranean Sea"
        },
        {
          level: 2,
          category: "LOW",
          concentration: 0.45,
          maxConcentration: 0.6,
          molecule: "Cadmium",
          location: "Rome Coastal",
          region: "Mediterranean Sea"
        }
      ],
      trendData: {
        "Mercury": [
          {
            date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString(),
            concentration: 0.85,
            location: "Toulon Bay"
          },
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            concentration: 0.92,
            location: "Toulon Bay"
          },
          {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            concentration: 0.78,
            location: "Toulon Bay"
          },
          {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            concentration: 1.1,
            location: "Toulon Bay"
          },
          {
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            concentration: 0.95,
            location: "Toulon Bay"
          }
        ]
      },
      predictions: [
        {
          concentration: 0.64,
          confidence: 0.93,
          distance: 5,
          sourceMolecule: "Mercury",
          sourceLocation: "Toulon Bay",
          lat: 43.1242,
          lng: 5.9280
        },
        {
          concentration: 1.1,
          confidence: 0.87,
          distance: 10,
          sourceMolecule: "Lead",
          sourceLocation: "Marseille Bay",
          lat: 43.3183,
          lng: 5.3547
        },
        {
          concentration: 0.38,
          confidence: 0.91,
          distance: 15,
          sourceMolecule: "Cadmium",
          sourceLocation: "Rome Coastal",
          lat: 41.9028,
          lng: 12.4964
        }
      ],
      metadata: [],
      summary: {
        totalMeasurements: 123,
        totalRisks: 20,
        criticalRisks: 2,
        averageRiskLevel: 2.4
      }
    }

    return NextResponse.json(mockData)

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
