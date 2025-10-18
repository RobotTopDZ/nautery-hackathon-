import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      latitude,
      longitude,
      depth,
      temperature,
      salinity,
      pH,
      dissolvedOxygen,
      turbidity,
      contaminantGroup,
      analyticalMethod,
      safeLimitUgL,
      detectionLimitUgL,
      bioaccumulationFactor,
      uncertaintyPercent
    } = body

    // Validate required fields
    if (!latitude || !longitude || !contaminantGroup) {
      return NextResponse.json(
        { error: 'Missing required fields: latitude, longitude, contaminantGroup' },
        { status: 400 }
      )
    }

    // Create prediction data
    const predictionData = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      depth_m: parseFloat(depth) || 15.0,
      temperature_c: parseFloat(temperature) || 20.0,
      salinity_psu: parseFloat(salinity) || 35.0,
      pH: parseFloat(pH) || 8.1,
      dissolved_oxygen_mgL: parseFloat(dissolvedOxygen) || 8.0,
      turbidity_NTU: parseFloat(turbidity) || 2.0,
      contaminant_group: contaminantGroup,
      analytical_method: analyticalMethod || 'ICP-MS',
      safe_limit_ugL: parseFloat(safeLimitUgL) || 1.0,
      detection_limit_ugL: parseFloat(detectionLimitUgL) || 0.01,
      bioaccumulation_factor: parseFloat(bioaccumulationFactor) || 100,
      uncertainty_percent: parseFloat(uncertaintyPercent) || 10.0
    }

    // Call Python prediction script
    const prediction = await runPrediction(predictionData)

    return NextResponse.json({
      success: true,
      prediction: {
        concentration: prediction.concentration,
        confidence: prediction.confidence,
        riskLevel: prediction.riskLevel,
        riskCategory: prediction.riskCategory,
        modelUsed: 'Advanced Random Forest',
        predictionDate: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Prediction error:', error)
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    )
  }
}

function runPrediction(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'ml_benchmarking', 'predict.py')
    const python = spawn('python', [scriptPath, JSON.stringify(data)])

    let output = ''
    let errorOutput = ''

    python.stdout.on('data', (data) => {
      output += data.toString()
    })

    python.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    python.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim())
          resolve(result)
        } catch (error) {
          reject(new Error('Failed to parse prediction result'))
        }
      } else {
        reject(new Error(`Python script failed: ${errorOutput}`))
      }
    })
  })
}
