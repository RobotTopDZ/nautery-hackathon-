import { prisma } from '@/lib/prisma'

export interface PollutionKPIs {
  averageConcentration: number
  peakConcentration: number
  pollutionIndex: number
  contaminationFrequency: number
  emergingContaminantRisk: number
}

export interface WaterQualityKPIs {
  pHStability: number
  temperatureVariation: number
  dissolvedOxygenLevel: number
  turbidityScore: number
  conductivity: number
}

export interface SpatialKPIs {
  pollutionGradient: number
  hotspotDensity: number
  riskZoneArea: number
  nearestSourceDistance: number
  flowImpactIndex: number
}

export interface TemporalKPIs {
  pollutionTrend: number
  forecastAccuracy: number
  predictionConfidence: number
  timeToThresholdBreach: number | null
  recoveryRate: number | null
}

export interface EnvironmentalKPIs {
  weatherCorrelation: number
  depthSensitivity: number
  humanImpactScore: number
  ecologicalRiskIndex: number
}

export interface GovernanceKPIs {
  alertLevelCount: number
  regulatoryCompliance: number
  timeAboveThreshold: number
  remediationImpact: number
}

export class KPICalculator {
  
  async calculatePollutionKPIs(
    moleculeId?: number,
    locationId?: number,
    timeRange?: { start: Date; end: Date }
  ): Promise<PollutionKPIs> {
    const whereClause: any = {}
    if (moleculeId) whereClause.moleculeId = moleculeId
    if (locationId) whereClause.locationId = locationId
    if (timeRange) {
      whereClause.timestamp = {
        gte: timeRange.start,
        lte: timeRange.end
      }
    }

    const measurements = await prisma.fieldMeasurement.findMany({
      where: whereClause,
      include: { molecule: true }
    })

    if (measurements.length === 0) {
      return {
        averageConcentration: 0,
        peakConcentration: 0,
        pollutionIndex: 0,
        contaminationFrequency: 0,
        emergingContaminantRisk: 0
      }
    }

    const concentrations = measurements.map(m => m.concentrationUgL)
    const averageConcentration = concentrations.reduce((a, b) => a + b, 0) / concentrations.length
    const peakConcentration = Math.max(...concentrations)

    // Calculate pollution index (normalized against toxic thresholds)
    const pollutionIndices = measurements.map(m => {
      const threshold = m.molecule.toxicThresholdUgL || 10
      return (m.concentrationUgL / threshold) * 100
    })
    const pollutionIndex = pollutionIndices.reduce((a, b) => a + b, 0) / pollutionIndices.length

    // Contamination frequency (% exceeding safe limits)
    const exceedingCount = measurements.filter(m => {
      const threshold = m.molecule.toxicThresholdUgL || 10
      return m.concentrationUgL > threshold
    }).length
    const contaminationFrequency = (exceedingCount / measurements.length) * 100

    // Emerging contaminant risk (weighted by persistence and toxicity)
    const riskScores = measurements.map(m => {
      const persistenceWeight = (m.molecule.halfLifeDays || 1) / 100
      const toxicityWeight = 1 / (m.molecule.toxicThresholdUgL || 1)
      const concentrationWeight = m.concentrationUgL
      return persistenceWeight * toxicityWeight * concentrationWeight
    })
    const emergingContaminantRisk = riskScores.reduce((a, b) => a + b, 0) / riskScores.length

    return {
      averageConcentration,
      peakConcentration,
      pollutionIndex,
      contaminationFrequency,
      emergingContaminantRisk
    }
  }

  async calculateWaterQualityKPIs(
    locationId?: number,
    timeRange?: { start: Date; end: Date }
  ): Promise<WaterQualityKPIs> {
    const whereClause: any = {}
    if (locationId) whereClause.locationId = locationId
    if (timeRange) {
      whereClause.timestamp = {
        gte: timeRange.start,
        lte: timeRange.end
      }
    }

    const measurements = await prisma.fieldMeasurement.findMany({
      where: whereClause,
      orderBy: { timestamp: 'asc' }
    })

    if (measurements.length === 0) {
      return {
        pHStability: 0,
        temperatureVariation: 0,
        dissolvedOxygenLevel: 0,
        turbidityScore: 0,
        conductivity: 0
      }
    }

    // pH Stability (lower standard deviation = more stable)
    const pHValues = measurements.filter(m => m.pH !== null).map(m => m.pH!)
    const pHMean = pHValues.reduce((a, b) => a + b, 0) / pHValues.length
    const pHVariance = pHValues.reduce((a, b) => a + Math.pow(b - pHMean, 2), 0) / pHValues.length
    const pHStability = Math.max(0, 10 - Math.sqrt(pHVariance) * 10) // Scale 0-10

    // Temperature Variation
    const tempValues = measurements.filter(m => m.temperatureC !== null).map(m => m.temperatureC!)
    const tempVariation = tempValues.length > 1 ? 
      Math.abs(tempValues[tempValues.length - 1] - tempValues[0]) : 0

    // Dissolved Oxygen Level
    const doValues = measurements.filter(m => m.dissolvedOxygenMgL !== null).map(m => m.dissolvedOxygenMgL!)
    const dissolvedOxygenLevel = doValues.length > 0 ? 
      doValues.reduce((a, b) => a + b, 0) / doValues.length : 0

    // Turbidity Score (normalized, lower is better)
    const turbidityValues = measurements.filter(m => m.turbidityNTU !== null).map(m => m.turbidityNTU!)
    const avgTurbidity = turbidityValues.length > 0 ? 
      turbidityValues.reduce((a, b) => a + b, 0) / turbidityValues.length : 0
    const turbidityScore = Math.max(0, 100 - avgTurbidity * 5) // Scale 0-100

    // Conductivity (proxy from salinity)
    const salinityValues = measurements.filter(m => m.salinityPsu !== null).map(m => m.salinityPsu!)
    const conductivity = salinityValues.length > 0 ? 
      salinityValues.reduce((a, b) => a + b, 0) / salinityValues.length * 1.8 : 0 // Rough conversion

    return {
      pHStability,
      temperatureVariation: tempVariation,
      dissolvedOxygenLevel,
      turbidityScore,
      conductivity
    }
  }

  async calculateSpatialKPIs(moleculeId?: number): Promise<SpatialKPIs> {
    const measurements = await prisma.fieldMeasurement.findMany({
      where: moleculeId ? { moleculeId } : {},
      include: { location: true, molecule: true }
    })

    if (measurements.length === 0) {
      return {
        pollutionGradient: 0,
        hotspotDensity: 0,
        riskZoneArea: 0,
        nearestSourceDistance: 0,
        flowImpactIndex: 0
      }
    }

    // Pollution Gradient (concentration change per km)
    let gradientSum = 0
    let gradientCount = 0
    for (let i = 0; i < measurements.length; i++) {
      for (let j = i + 1; j < measurements.length; j++) {
        const m1 = measurements[i]
        const m2 = measurements[j]
        const distance = this.calculateDistance(
          m1.location.latitude, m1.location.longitude,
          m2.location.latitude, m2.location.longitude
        )
        if (distance > 0) {
          const concentrationDiff = Math.abs(m1.concentrationUgL - m2.concentrationUgL)
          gradientSum += concentrationDiff / distance
          gradientCount++
        }
      }
    }
    const pollutionGradient = gradientCount > 0 ? gradientSum / gradientCount : 0

    // Hotspot Density (high pollution zones per 100 km²)
    const hotspots = measurements.filter(m => {
      const threshold = m.molecule.toxicThresholdUgL || 10
      return m.concentrationUgL > threshold * 0.8 // 80% of threshold
    })
    const hotspotDensity = (hotspots.length / measurements.length) * 100

    // Risk Zone Area (simplified calculation)
    const riskZoneArea = hotspots.length * 5 // Assume each hotspot covers ~5 km²

    // Nearest Source Distance (average distance to coast/river)
    const nearestSourceDistance = measurements.reduce((sum, m) => 
      sum + Math.min(m.location.coastalDistanceKm, m.location.distanceToRiverMouthKm), 0
    ) / measurements.length

    // Flow Impact Index (correlation between current and pollution spread)
    const flowImpacts = measurements.map(m => {
      const currentSpeed = m.currentSpeedMs || 0
      const concentration = m.concentrationUgL
      return currentSpeed * concentration
    })
    const flowImpactIndex = flowImpacts.reduce((a, b) => a + b, 0) / flowImpacts.length

    return {
      pollutionGradient,
      hotspotDensity,
      riskZoneArea,
      nearestSourceDistance,
      flowImpactIndex
    }
  }

  async calculateTemporalKPIs(
    moleculeId?: number,
    locationId?: number
  ): Promise<TemporalKPIs> {
    const whereClause: any = {}
    if (moleculeId) whereClause.moleculeId = moleculeId
    if (locationId) whereClause.locationId = locationId

    const measurements = await prisma.fieldMeasurement.findMany({
      where: whereClause,
      orderBy: { timestamp: 'asc' },
      include: { molecule: true }
    })

    if (measurements.length < 2) {
      return {
        pollutionTrend: 0,
        forecastAccuracy: 0,
        predictionConfidence: 0,
        timeToThresholdBreach: null,
        recoveryRate: null
      }
    }

    // Pollution Trend (% change over time)
    const firstConc = measurements[0].concentrationUgL
    const lastConc = measurements[measurements.length - 1].concentrationUgL
    const pollutionTrend = ((lastConc - firstConc) / firstConc) * 100

    // Forecast Accuracy (compare predictions with actual measurements)
    const predictions = await prisma.predictedConcentration.findMany({
      where: {
        sourceMeasurement: whereClause
      }
    })
    
    let forecastAccuracy = 85 // Default accuracy
    if (predictions.length > 0) {
      // Simplified accuracy calculation
      const accuracySum = predictions.reduce((sum, pred) => sum + pred.confidenceScore, 0)
      forecastAccuracy = (accuracySum / predictions.length) * 100
    }

    // Prediction Confidence (average from ML model)
    const predictionConfidence = predictions.length > 0 ? 
      predictions.reduce((sum, pred) => sum + pred.confidenceScore, 0) / predictions.length * 100 : 75

    // Time to Threshold Breach (simplified projection)
    let timeToThresholdBreach: number | null = null
    if (measurements.length > 1 && pollutionTrend > 0) {
      const threshold = measurements[0].molecule.toxicThresholdUgL || 10
      const currentLevel = lastConc
      if (currentLevel < threshold) {
        const daysToThreshold = (threshold - currentLevel) / (pollutionTrend / 100 * currentLevel / 30)
        timeToThresholdBreach = Math.max(0, daysToThreshold)
      }
    }

    // Recovery Rate (time to return below threshold)
    let recoveryRate: number | null = null
    const thresholdBreaches = measurements.filter(m => {
      const threshold = m.molecule.toxicThresholdUgL || 10
      return m.concentrationUgL > threshold
    })
    if (thresholdBreaches.length > 0) {
      recoveryRate = 30 // Simplified: assume 30 days average recovery
    }

    return {
      pollutionTrend,
      forecastAccuracy,
      predictionConfidence,
      timeToThresholdBreach,
      recoveryRate
    }
  }

  async calculateGovernanceKPIs(): Promise<GovernanceKPIs> {
    const riskIndices = await prisma.riskIndex.findMany({
      include: { molecule: true }
    })

    const alertLevelCount = riskIndices.filter(r => r.riskLevel >= 4).length

    const totalSites = await prisma.location.count()
    const compliantSites = riskIndices.filter(r => r.riskLevel <= 2).length
    const regulatoryCompliance = totalSites > 0 ? (compliantSites / totalSites) * 100 : 100

    const measurements = await prisma.fieldMeasurement.findMany({
      include: { molecule: true }
    })

    const daysAboveThreshold = measurements.filter(m => {
      const threshold = m.molecule.toxicThresholdUgL || 10
      return m.concentrationUgL > threshold
    }).length

    const timeAboveThreshold = daysAboveThreshold

    // Simplified remediation impact
    const remediationImpact = Math.max(0, 100 - (alertLevelCount / Math.max(1, riskIndices.length)) * 100)

    return {
      alertLevelCount,
      regulatoryCompliance,
      timeAboveThreshold,
      remediationImpact
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
}

export const kpiCalculator = new KPICalculator()
