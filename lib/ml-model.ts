import { Matrix } from 'ml-matrix'
// import { RandomForestRegression } from 'ml-regression'

export interface PredictionInput {
  sourceConcentration: number
  distance: number
  temperature: number
  pH: number
  salinity: number
  currentSpeed: number
  windSpeed: number
  depth: number
}

export interface PredictionResult {
  predictedConcentration: number
  confidence: number
  factors: {
    distance: number
    temperature: number
    hydrodynamics: number
    chemical: number
  }
}

export class ContaminantDiffusionModel {
  private model: any = null
  private isTrained = false

  constructor() {
    // Use physics-based model only
    this.isTrained = true
  }

  private generateTrainingData() {
    const features: number[][] = []
    const targets: number[] = []

    // Generate synthetic training data based on physical principles
    for (let i = 0; i < 1000; i++) {
      const sourceConc = Math.random() * 20 + 0.1 // 0.1-20 µg/L
      const distance = Math.random() * 25 + 1 // 1-25 km
      const temperature = Math.random() * 20 + 10 // 10-30°C
      const pH = Math.random() * 2 + 6.5 // 6.5-8.5
      const salinity = Math.random() * 10 + 30 // 30-40 PSU
      const currentSpeed = Math.random() * 2 // 0-2 m/s
      const windSpeed = Math.random() * 15 + 2 // 2-17 m/s
      const depth = Math.random() * 20 + 1 // 1-20 m

      // Physics-based concentration decay model
      const distanceDecay = Math.exp(-distance / 15) // Exponential decay with distance
      const temperatureEffect = 1 + (temperature - 20) * 0.02 // Higher temp = faster degradation
      const pHEffect = Math.abs(pH - 7) < 1 ? 1 : 0.8 // Optimal pH around 7
      const currentEffect = 1 + currentSpeed * 0.3 // Higher current = more dispersion
      const depthEffect = Math.exp(-depth / 10) // Surface concentrations higher
      
      const predictedConc = sourceConc * distanceDecay * temperatureEffect * pHEffect * currentEffect * depthEffect
      
      features.push([sourceConc, distance, temperature, pH, salinity, currentSpeed, windSpeed, depth])
      targets.push(Math.max(0.001, predictedConc)) // Ensure positive values
    }

    return { features, targets }
  }

  private trainModel(features: number[][], targets: number[]) {
    // Use physics-based model only
    this.isTrained = true
  }

  predict(input: PredictionInput): PredictionResult {
    // Always use physics-based prediction
    return this.physicsBasedPrediction(input)
  }

  private physicsBasedPrediction(input: PredictionInput): PredictionResult {
    // Fallback physics-based model
    const distanceDecay = Math.exp(-input.distance / 15)
    const temperatureEffect = 1 + (input.temperature - 20) * 0.02
    const pHEffect = Math.abs(input.pH - 7) < 1 ? 1 : 0.8
    const currentEffect = 1 + input.currentSpeed * 0.3
    const depthEffect = Math.exp(-input.depth / 10)
    
    const predictedConcentration = input.sourceConcentration * 
      distanceDecay * temperatureEffect * pHEffect * currentEffect * depthEffect

    return {
      predictedConcentration: Math.max(0.001, predictedConcentration),
      confidence: 0.7, // Lower confidence for physics-based fallback
      factors: this.analyzeFactors(input)
    }
  }

  private calculateConfidence(input: PredictionInput): number {
    // Confidence based on input parameter ranges and model certainty
    let confidence = 0.9

    // Reduce confidence for extreme values
    if (input.distance > 20) confidence -= 0.1
    if (input.temperature < 5 || input.temperature > 35) confidence -= 0.1
    if (input.pH < 6 || input.pH > 9) confidence -= 0.1
    if (input.currentSpeed > 1.5) confidence -= 0.05

    return Math.max(0.5, confidence)
  }

  private analyzeFactors(input: PredictionInput) {
    // Analyze the relative importance of different factors
    const distanceFactor = Math.exp(-input.distance / 15) // 0-1, higher = closer
    const temperatureFactor = 1 - Math.abs(input.temperature - 20) / 20 // 0-1, optimal around 20°C
    const hydrodynamicsFactor = (input.currentSpeed + input.windSpeed / 10) / 3 // 0-1, higher = more mixing
    const chemicalFactor = Math.abs(input.pH - 7) < 1 ? 1 : 0.5 // 0-1, optimal around neutral pH

    return {
      distance: distanceFactor,
      temperature: temperatureFactor,
      hydrodynamics: hydrodynamicsFactor,
      chemical: chemicalFactor
    }
  }

  // Method to predict concentrations at multiple distances
  predictMultipleDistances(
    baseInput: Omit<PredictionInput, 'distance'>, 
    distances: number[]
  ): Array<PredictionResult & { distance: number }> {
    return distances.map(distance => ({
      distance,
      ...this.predict({ ...baseInput, distance })
    }))
  }

  // Method to generate risk assessment
  assessRisk(
    prediction: PredictionResult, 
    toxicThreshold: number
  ): {
    riskLevel: number // 1-5
    riskCategory: string
    exceedsThreshold: boolean
    safetyMargin: number
  } {
    const ratio = prediction.predictedConcentration / toxicThreshold
    let riskLevel = 1
    let riskCategory = 'Low'

    if (ratio > 1) {
      riskLevel = 5
      riskCategory = 'Critical'
    } else if (ratio > 0.8) {
      riskLevel = 4
      riskCategory = 'High'
    } else if (ratio > 0.6) {
      riskLevel = 3
      riskCategory = 'Medium'
    } else if (ratio > 0.3) {
      riskLevel = 2
      riskCategory = 'Low-Medium'
    }

    return {
      riskLevel,
      riskCategory,
      exceedsThreshold: ratio > 1,
      safetyMargin: Math.max(0, 1 - ratio)
    }
  }
}

// Singleton instance
export const diffusionModel = new ContaminantDiffusionModel()
