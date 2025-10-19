import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return mock health data
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        measurements: 1250,
        locations: 8,
        molecules: 5,
        riskAssessments: 45
      },
      version: '1.0.0'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      },
      { status: 500 }
    )
  }
}
