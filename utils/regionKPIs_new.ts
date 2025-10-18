import { Region } from '@/components/RegionSelector'
import { generateRegionData } from './dataParser'

export interface RegionalKPIs {
  pollutionLevel: number
  waterQualityIndex: number
  biodiversityIndex: number
  treatmentEfficiency: number
  pollution: {
    averageConcentration: number
    peakConcentration: number
    pollutionIndex: number
    contaminationFrequency: number
  }
  waterQuality: {
    pHStability: number
    temperatureVariation: number
    dissolvedOxygenLevel: number
    turbidityScore: number
    conductivity: number
  }
  spatial: {
    hotspotDensity: number
    riskZoneArea: number
  }
  temporal: {
    pollutionTrend: number
    predictionConfidence: number
    forecastAccuracy: number
  }
  governance: {
    regulatoryCompliance: number
    timeAboveThreshold: number
    remediationImpact: number
    alertLevelCount: number
  }
}

export function generateRegionalKPIs(region: Region): RegionalKPIs {
  // Générer les données régionales complètes
  try {
    const regionData = generateRegionData(region.id);
    const { averageContaminants, riskLevel } = regionData;
    
    // Calculer la concentration moyenne pondérée
    const avgConcentration = (
      averageContaminants.lead * 0.2 +
      averageContaminants.cadmium * 0.15 +
      averageContaminants.mercury * 0.15 +
      averageContaminants.copper * 0.1 +
      averageContaminants.zinc * 0.1 +
      averageContaminants.pcb * 0.15 +
      averageContaminants.hydrocarbures * 0.15
    );

    // Calculer les KPIs principaux
    const pollutionLevel = Math.min(100, avgConcentration * 5);
    const waterQualityIndex = Math.max(0, 100 - pollutionLevel);
    const biodiversityIndex = Math.max(20, 95 - (pollutionLevel * 0.8));
    const treatmentEfficiency = {
      'LOW': 88 + Math.random() * 7,
      'MODERATE': 75 + Math.random() * 10,
      'HIGH': 65 + Math.random() * 12,
      'CRITICAL': 55 + Math.random() * 15
    }[riskLevel];

    // Calculer les concentrations
    const peakConcentration = Math.max(
      averageContaminants.lead,
      averageContaminants.mercury * 30,
      averageContaminants.cadmium * 20
    );

    return {
      pollutionLevel: Math.round(pollutionLevel),
      waterQualityIndex: Math.round(waterQualityIndex),
      biodiversityIndex: Math.round(biodiversityIndex),
      treatmentEfficiency: Math.round(treatmentEfficiency),
      
      pollution: {
        averageConcentration: Math.round(avgConcentration * 10) / 10,
        peakConcentration: Math.round(peakConcentration * 10) / 10,
        pollutionIndex: Math.round(pollutionLevel),
        contaminationFrequency: Math.round(pollutionLevel / 5)
      },
      
      waterQuality: {
        pHStability: Math.round((8.5 - (pollutionLevel / 50)) * 10) / 10,
        temperatureVariation: Math.round((pollutionLevel / 25) * 10) / 10,
        dissolvedOxygenLevel: Math.round((9 - (pollutionLevel / 20)) * 10) / 10,
        turbidityScore: Math.round(waterQualityIndex * 0.9),
        conductivity: Math.round(350 + (pollutionLevel * 3))
      },
      
      spatial: {
        hotspotDensity: Math.round(pollutionLevel / 3.5),
        riskZoneArea: Math.round((pollutionLevel / 10) * (1 + Math.random() * 0.5))
      },
      
      temporal: {
        pollutionTrend: Math.round(((Math.random() - 0.5) * 10) * 10) / 10,
        predictionConfidence: Math.round(82 + Math.random() * 15),
        forecastAccuracy: Math.round(78 + Math.random() * 18)
      },
      
      governance: {
        regulatoryCompliance: Math.round(waterQualityIndex * 0.85),
        timeAboveThreshold: Math.round(pollutionLevel / 15),
        remediationImpact: Math.round(treatmentEfficiency * 0.9),
        alertLevelCount: riskLevel === 'CRITICAL' ? Math.floor(2 + Math.random() * 3) : riskLevel === 'HIGH' ? Math.floor(Math.random() * 2) : 0
      }
    };
  } catch (error) {
    console.error(`Erreur lors de la génération des KPIs pour ${region.id}:`, error);
    
    // Fallback avec valeurs par défaut
    return {
      pollutionLevel: 50,
      waterQualityIndex: 70,
      biodiversityIndex: 65,
      treatmentEfficiency: 75,
      pollution: {
        averageConcentration: 5.0,
        peakConcentration: 8.5,
        pollutionIndex: 50,
        contaminationFrequency: 12
      },
      waterQuality: {
        pHStability: 7.8,
        temperatureVariation: 2.1,
        dissolvedOxygenLevel: 7.5,
        turbidityScore: 68,
        conductivity: 450
      },
      spatial: {
        hotspotDensity: 15,
        riskZoneArea: 5
      },
      temporal: {
        pollutionTrend: 0,
        predictionConfidence: 85,
        forecastAccuracy: 82
      },
      governance: {
        regulatoryCompliance: 80,
        timeAboveThreshold: 3,
        remediationImpact: 70,
        alertLevelCount: 0
      }
    };
  }
}

export function getRegionDisplayInfo(region: Region) {
  return {
    name: region.name,
    country: region.country,
    coordinates: region.coordinates,
    description: region.description,
    flag: region.flag
  }
}
