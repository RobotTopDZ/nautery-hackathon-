import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Get basic stats
    const [
      measurementCount,
      locationCount,
      moleculeCount,
      riskCount
    ] = await Promise.all([
      prisma.fieldMeasurement.count(),
      prisma.location.count(),
      prisma.molecule.count(),
      prisma.riskIndex.count()
    ])

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats: {
        measurements: measurementCount,
        locations: locationCount,
        molecules: moleculeCount,
        risks: riskCount
      },
      version: '1.0.0'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed'
      },
      { status: 503 }
    )
  }
}
