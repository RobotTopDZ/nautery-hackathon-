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
    
    // Vérifier que toutes les valeurs existent et sont des nombres
    const lead = averageContaminants?.lead || 0;
    const cadmium = averageContaminants?.cadmium || 0;
    const mercury = averageContaminants?.mercury || 0;
    const copper = averageContaminants?.copper || 0;
    const zinc = averageContaminants?.zinc || 0;
    const pcb = averageContaminants?.pcb || 0;
    const hydrocarbures = averageContaminants?.hydrocarbures || 0;
    
    // Calculer la concentration moyenne pondérée
    const avgConcentration = (
      lead * 0.2 +
      cadmium * 0.15 +
      mercury * 0.15 +
      copper * 0.1 +
      zinc * 0.1 +
      pcb * 0.15 +
      hydrocarbures * 0.15
    );

    // Calculer les KPIs principaux avec variation réaliste
    const baseMultiplier = 0.97 + (Math.random() * 0.06); // 0.97 à 1.03
    const pollutionLevel = Math.min(100, avgConcentration * 5 * baseMultiplier);
    const waterQualityIndex = Math.max(0, 100 - pollutionLevel);
    const biodiversityIndex = Math.max(20, 95 - (pollutionLevel * 0.8));
    
    // Efficacité avec variation plus naturelle
    const efficiencyBase = {
      'LOW': 87,
      'MODERATE': 76,
      'HIGH': 67,
      'CRITICAL': 58
    }[riskLevel] || 75;
    const treatmentEfficiency = efficiencyBase + (Math.random() * 8) - 2; // +/- variation

    // Calculer les concentrations avec valeurs réalistes
    const peakConcentration = Math.max(
      lead * 1.3,
      mercury * 28,
      cadmium * 19,
      copper * 0.8
    );

    return {
      pollutionLevel: Math.round(pollutionLevel * 100) / 100,
      waterQualityIndex: Math.round(waterQualityIndex * 100) / 100,
      biodiversityIndex: Math.round(biodiversityIndex * 100) / 100,
      treatmentEfficiency: Math.round(treatmentEfficiency * 100) / 100,
      
      pollution: {
        averageConcentration: Math.round((avgConcentration * 2.5 + 15) * 100) / 100, // Valeurs raisonnables 15-25 ng/L
        peakConcentration: Math.round((peakConcentration * 3.2 + 28) * 100) / 100, // Valeurs raisonnables 28-45 ng/L
        pollutionIndex: Math.round(pollutionLevel * 100) / 100,
        contaminationFrequency: Math.round((pollutionLevel / 5) * 100) / 100
      },
      
      waterQuality: {
        pHStability: Math.round((8.5 - (pollutionLevel / 50) + (Math.random() * 0.3 - 0.15)) * 100) / 100,
        temperatureVariation: Math.round((pollutionLevel / 25 + (Math.random() * 0.8 - 0.4)) * 100) / 100,
        dissolvedOxygenLevel: Math.round((9 - (pollutionLevel / 20) + (Math.random() * 0.6 - 0.3)) * 100) / 100,
        turbidityScore: Math.round(waterQualityIndex * (0.88 + Math.random() * 0.07) * 100) / 100,
        conductivity: Math.round((350 + (pollutionLevel * 3) + (Math.random() * 40 - 20)) * 100) / 100
      },
      
      spatial: {
        hotspotDensity: Math.round((pollutionLevel / (3.3 + Math.random() * 0.5)) * 100) / 100,
        riskZoneArea: Math.round(((pollutionLevel / 10) * (1.1 + Math.random() * 0.4)) * 100) / 100
      },
      
      temporal: {
        pollutionTrend: Math.round(((Math.random() - 0.5) * 12) * 100) / 100,
        predictionConfidence: Math.round((81 + Math.random() * 16) * 100) / 100,
        forecastAccuracy: Math.round((77 + Math.random() * 19) * 100) / 100
      },
      
      governance: {
        regulatoryCompliance: Math.round(waterQualityIndex * (0.83 + Math.random() * 0.06) * 100) / 100,
        timeAboveThreshold: Math.max(0, Math.round((pollutionLevel / (14 + Math.random() * 3)) * 100) / 100),
        remediationImpact: Math.round(treatmentEfficiency * (0.88 + Math.random() * 0.07) * 100) / 100,
        alertLevelCount: riskLevel === 'CRITICAL' ? Math.floor(2 + Math.random() * 3) : riskLevel === 'HIGH' ? Math.floor(Math.random() * 2) : 0
      }
    };
  } catch (error) {
    console.error(`Erreur lors de la génération des KPIs pour ${region.id}:`, error);
    
    // Fallback avec valeurs par défaut (avec décimales)
    return {
      pollutionLevel: 49.87,
      waterQualityIndex: 69.53,
      biodiversityIndex: 64.29,
      treatmentEfficiency: 74.61,
      pollution: {
        averageConcentration: 5.24,
        peakConcentration: 8.73,
        pollutionIndex: 49.87,
        contaminationFrequency: 11.68
      },
      waterQuality: {
        pHStability: 7.84,
        temperatureVariation: 2.13,
        dissolvedOxygenLevel: 7.56,
        turbidityScore: 67.42,
        conductivity: 447.83
      },
      spatial: {
        hotspotDensity: 14.73,
        riskZoneArea: 5.18
      },
      temporal: {
        pollutionTrend: -0.34,
        predictionConfidence: 84.57,
        forecastAccuracy: 81.92
      },
      governance: {
        regulatoryCompliance: 79.34,
        timeAboveThreshold: 3.27,
        remediationImpact: 69.81,
        alertLevelCount: 0
      }
    };
  }
}

export interface RegionKPIs {
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

export function generateRegionKPIs(region: Region): RegionKPIs {
  const regionMultipliers: Record<string, { pollution: number; waterQuality: number; industrial: number; compliance: number }> = {
    toulon: {
      pollution: 1.0,
      waterQuality: 1.0,
      industrial: 0.8,
      compliance: 0.9
    },
    marseille: {
      pollution: 1.2,
      waterQuality: 0.9,
      industrial: 1.1,
      compliance: 0.85
    },
    nice: {
      pollution: 0.8,
      waterQuality: 1.1,
      industrial: 0.7,
      compliance: 0.92
    },
    barcelona: {
      pollution: 1.1,
      waterQuality: 0.95,
      industrial: 1.2,
      compliance: 0.88
    },
    rome: {
      pollution: 1.0,
      waterQuality: 1.0,
      industrial: 1.0,
      compliance: 0.9
    },
    vancouver: {
      pollution: 0.8,
      waterQuality: 1.2,
      industrial: 0.9,
      compliance: 0.95
    },
    montreal: {
      pollution: 0.9,
      waterQuality: 1.1,
      industrial: 0.8,
      compliance: 0.92
    },
    copenhagen: {
      pollution: 0.6,
      waterQuality: 1.3,
      industrial: 0.5,
      compliance: 0.98
    }
  }

  const multiplier = regionMultipliers[region.id] || regionMultipliers.rome
  
  // Generate realistic KPI values based on region
  return {
    pollution: {
      averageConcentration: Math.round((0.8 * multiplier.pollution) * 100) / 100,
      peakConcentration: Math.round((1.9 * multiplier.pollution) * 100) / 100,
      pollutionIndex: Math.round(42 * multiplier.pollution),
      contaminationFrequency: Math.round(18 * multiplier.pollution * 10) / 10
    },
    waterQuality: {
      pHStability: Math.round((8.1 * multiplier.waterQuality) * 10) / 10,
      temperatureVariation: Math.round((2.3 / multiplier.waterQuality) * 10) / 10,
      dissolvedOxygenLevel: Math.round((8.4 * multiplier.waterQuality) * 10) / 10,
      turbidityScore: Math.round(78 * multiplier.waterQuality),
      conductivity: Math.round(52400 * (0.8 + multiplier.pollution * 0.4))
    },
    spatial: {
      hotspotDensity: Math.round(28 * multiplier.industrial),
      riskZoneArea: Math.round(145 * multiplier.pollution)
    },
    temporal: {
      pollutionTrend: Math.round((-3.2 + (multiplier.pollution - 1) * 5) * 10) / 10,
      predictionConfidence: Math.round(87 * multiplier.compliance),
      forecastAccuracy: Math.round(92 * multiplier.compliance)
    },
    governance: {
      regulatoryCompliance: Math.round(81 * multiplier.compliance),
      timeAboveThreshold: Math.round(2 * multiplier.pollution),
      remediationImpact: Math.round(73 * multiplier.compliance),
      alertLevelCount: Math.round(2 * multiplier.pollution)
    }
  }
}

// Get region display info
export function getRegionDisplayInfo(region: Region) {
  const regionInfo: Record<string, any> = {
    toulon: {
      type: 'Port Militaire',
      riskLevel: 'Modéré',
      mainPollutants: ['Hydrocarbures', 'Métaux lourds'],
      waterType: 'Méditerranée'
    },
    marseille: {
      type: 'Port Commercial',
      riskLevel: 'Élevé',
      mainPollutants: ['Hydrocarbures', 'Produits chimiques'],
      waterType: 'Méditerranée'
    },
    nice: {
      type: 'Zone Touristique',
      riskLevel: 'Faible',
      mainPollutants: ['Eaux usées', 'Déchets plastiques'],
      waterType: 'Méditerranée'
    },
    barcelona: {
      type: 'Port Industriel',
      riskLevel: 'Modéré-Élevé',
      mainPollutants: ['Métaux lourds', 'Hydrocarbures'],
      waterType: 'Méditerranée'
    },
    rome: {
      type: 'Zone Côtière',
      riskLevel: 'Modéré',
      mainPollutants: ['Eaux usées', 'Métaux lourds'],
      waterType: 'Mer Tyrrhénienne'
    },
    vancouver: {
      type: 'Port Pacifique',
      riskLevel: 'Faible-Modéré',
      mainPollutants: ['Hydrocarbures', 'Sédiments'],
      waterType: 'Océan Pacifique'
    },
    montreal: {
      type: 'Port Fluvial',
      riskLevel: 'Faible',
      mainPollutants: ['Eaux usées', 'Produits chimiques'],
      waterType: 'Fleuve Saint-Laurent'
    },
    copenhagen: {
      type: 'Port Baltique',
      riskLevel: 'Très Faible',
      mainPollutants: ['Nutriments', 'Microplastiques'],
      waterType: 'Mer Baltique'
    }
  }

  return regionInfo[region.id] || regionInfo.rome
}
