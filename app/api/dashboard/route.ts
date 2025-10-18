import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')
    const molecule = searchParams.get('molecule')
    const timeRange = searchParams.get('timeRange') || '30' // days

    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000)

    // Build where clauses
    const measurementWhere: any = {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    }

    if (region) {
      measurementWhere.location = {
        regionName: {
          contains: region,
          mode: 'insensitive'
        }
      }
    }

    if (molecule) {
      measurementWhere.molecule = {
        name: {
          contains: molecule,
          mode: 'insensitive'
        }
      }
    }

    // Get recent measurements for heatmap
    const measurements = await prisma.fieldMeasurement.findMany({
      where: measurementWhere,
      include: {
        location: true,
        molecule: true
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    })

    // Get risk indices
    const riskIndices = await prisma.riskIndex.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        location: true,
        molecule: true
      },
      orderBy: { riskLevel: 'desc' }
    })

    // Get trend data (last 30 days)
    const trendData = await prisma.fieldMeasurement.findMany({
      where: {
        ...measurementWhere,
        timestamp: {
          gte: new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          lte: endDate
        }
      },
      include: { molecule: true },
      orderBy: { timestamp: 'asc' }
    })

    // Get predicted concentrations
    const predictions = await prisma.predictedConcentration.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        sourceMeasurement: {
          include: {
            molecule: true,
            location: true
          }
        }
      },
      take: 50
    })

    // Transform data for frontend
    const heatmapData = measurements.map(m => ({
      lat: m.location.latitude,
      lng: m.location.longitude,
      intensity: Math.min(m.concentrationUgL / (m.molecule.toxicThresholdUgL || 10), 1),
      concentration: m.concentrationUgL,
      molecule: m.molecule.name,
      location: m.location.regionName,
      timestamp: m.timestamp
    }))

    const riskData = riskIndices.map(r => ({
      id: r.id,
      location: r.location.regionName,
      molecule: r.molecule.name,
      riskLevel: r.riskLevel,
      riskCategory: this.getRiskCategory(r.riskLevel),
      concentration: r.averageConcentrationUgL,
      threshold: r.molecule.toxicThresholdUgL || 10,
      trend: r.riskTrend.toLowerCase() as 'increasing' | 'stable' | 'decreasing',
      recommendedAction: r.recommendedAction,
      lastUpdate: r.timestamp.toISOString()
    }))

    // Group trend data by molecule and date
    const trendByMolecule = trendData.reduce((acc, measurement) => {
      const key = measurement.molecule.name
      if (!acc[key]) acc[key] = []
      
      acc[key].push({
        date: measurement.timestamp.toISOString().split('T')[0],
        concentration: measurement.concentrationUgL,
        threshold: measurement.molecule.toxicThresholdUgL
      })
      
      return acc
    }, {} as Record<string, any[]>)

    // Get dashboard metadata
    const dashboardMetadata = await prisma.dashboardMetadata.findMany({
      where: {
        lastUpdate: {
          gte: startDate
        }
      },
      include: { molecule: true }
    })

    return NextResponse.json({
      heatmapData,
      riskData,
      trendData: trendByMolecule,
      predictions: predictions.map(p => ({
        distance: p.distanceKm,
        concentration: p.predictedConcentrationUgL,
        confidence: p.confidenceScore,
        modelType: p.modelType,
        sourceMolecule: p.sourceMeasurement.molecule.name,
        sourceLocation: p.sourceMeasurement.location.regionName,
        lat: p.latitudePred,
        lng: p.longitudePred
      })),
      metadata: dashboardMetadata.map(m => ({
        region: m.regionName,
        timePeriod: m.timePeriod,
        molecule: m.molecule?.name,
        avgConcentration: m.avgConcentrationUgL,
        maxConcentration: m.maxConcentrationUgL,
        numHotspots: m.numHotspots,
        avgRiskLevel: m.avgRiskLevel,
        trendIndicator: m.trendIndicator
      })),
      summary: {
        totalMeasurements: measurements.length,
        totalRisks: riskIndices.length,
        criticalRisks: riskIndices.filter(r => r.riskLevel >= 4).length,
        averageRiskLevel: riskIndices.length > 0 ? 
          riskIndices.reduce((sum, r) => sum + r.riskLevel, 0) / riskIndices.length : 0
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
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
