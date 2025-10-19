import { NextResponse } from 'next/server'
import { diffusionModel } from '@/lib/ml-model'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      sourceConcentration,
      distance,
      temperature,
      pH,
      salinity,
      currentSpeed,
      windSpeed,
      depth,
      toxicThreshold
    } = body

    // Validate required fields
    if (!sourceConcentration || !distance || !temperature || !pH) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Make prediction
    const prediction = diffusionModel.predict({
      sourceConcentration,
      distance,
      temperature,
      pH,
      salinity: salinity || 35,
      currentSpeed: currentSpeed || 0.5,
      windSpeed: windSpeed || 10,
      depth: depth || 5
    })

    // Assess risk if threshold provided
    let riskAssessment = null
    if (toxicThreshold) {
      riskAssessment = diffusionModel.assessRisk(prediction, toxicThreshold)
    }

    return NextResponse.json({
      prediction,
      riskAssessment
    })
  } catch (error) {
    console.error('Error making prediction:', error)
    return NextResponse.json(
      { error: 'Failed to make prediction' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const measurementId = searchParams.get('measurementId')
    const distances = searchParams.get('distances')?.split(',').map(Number) || [5, 10, 25]

    if (!measurementId) {
      return NextResponse.json(
        { error: 'measurementId is required' },
        { status: 400 }
      )
    }

    // Mock source measurement
    const measurement = {
      id: parseInt(measurementId),
      concentration: 2.5,
      concentrationUgL: 2.5,
      temperatureC: 18.5,
      pH: 7.8,
      salinityPsu: 35.2,
      currentSpeedMs: 0.15,
      windSpeedMs: 3.2,
      timestamp: new Date(),
      molecule: { 
        name: 'Diclofenac',
        toxicThresholdUgL: 0.1
      },
      location: { 
        latitude: 43.1, 
        longitude: 5.9, 
        name: 'Toulon Bay',
        regionName: 'Var',
        depthM: 15.5
      }
    }

    if (!measurement) {
      return NextResponse.json(
        { error: 'Measurement not found' },
        { status: 404 }
      )
    }

    // Make predictions for multiple distances
    const predictions = diffusionModel.predictMultipleDistances({
      sourceConcentration: measurement.concentrationUgL,
      temperature: measurement.temperatureC || 20,
      pH: measurement.pH || 7.5,
      salinity: measurement.salinityPsu || 35,
      currentSpeed: measurement.currentSpeedMs || 0.5,
      windSpeed: measurement.windSpeedMs || 10,
      depth: measurement.location.depthM || 5
    }, distances)

    // Add risk assessments
    const predictionsWithRisk = predictions.map(pred => ({
      ...pred,
      riskAssessment: diffusionModel.assessRisk(pred, measurement.molecule.toxicThresholdUgL || 10)
    }))

    return NextResponse.json({
      sourceMeasurement: {
        id: measurement.id,
        concentration: measurement.concentrationUgL,
        molecule: measurement.molecule.name,
        location: measurement.location.regionName,
        timestamp: measurement.timestamp
      },
      predictions: predictionsWithRisk
    })
  } catch (error) {
    console.error('Error getting predictions:', error)
    return NextResponse.json(
      { error: 'Failed to get predictions' },
      { status: 500 }
    )
  }
}
