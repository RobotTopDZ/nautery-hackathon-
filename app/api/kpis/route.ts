import { NextRequest, NextResponse } from 'next/server'
import { kpiCalculator } from '@/lib/kpi-calculations-simple'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moleculeId = searchParams.get('moleculeId')
    const locationId = searchParams.get('locationId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const timeRange = startDate && endDate ? {
      start: new Date(startDate),
      end: new Date(endDate)
    } : undefined

    // Calculate all KPIs in parallel
    const [
      pollutionKPIs,
      waterQualityKPIs,
      spatialKPIs,
      temporalKPIs,
      governanceKPIs
    ] = await Promise.all([
      kpiCalculator.calculatePollutionKPIs(),
      kpiCalculator.calculateWaterQualityKPIs(),
      kpiCalculator.calculateSpatialKPIs(),
      kpiCalculator.calculateTemporalKPIs(),
      kpiCalculator.calculateGovernanceKPIs()
    ])

    return NextResponse.json({
      pollution: pollutionKPIs,
      waterQuality: waterQualityKPIs,
      spatial: spatialKPIs,
      temporal: temporalKPIs,
      governance: governanceKPIs
    })
  } catch (error) {
    console.error('Error calculating KPIs:', error)
    return NextResponse.json(
      { error: 'Failed to calculate KPIs' },
      { status: 500 }
    )
  }
}
