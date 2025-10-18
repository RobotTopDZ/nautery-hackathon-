// Utilitaire pour parser et analyser les données EMODnet par région
export interface ContaminantData {
  latitude: number;
  longitude: number;
  station: string;
  date: string;
  contaminants: {
    [key: string]: number;
  };
  depth?: number;
  temperature?: number;
  salinity?: number;
}

export interface RegionData {
  regionId: string;
  regionName: string;
  totalSamples: number;
  averageContaminants: {
    [key: string]: number;
  };
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  lastUpdated: string;
  coordinates: [number, number];
  stations: string[];
}

// Définir les zones géographiques pour chaque ville européenne
export const EUROPEAN_REGIONS = {
  toulon: {
    name: 'Toulon',
    bounds: { minLat: 42.9, maxLat: 43.3, minLon: 5.7, maxLon: 6.2 },
    center: [43.1242, 5.9280] as [number, number]
  },
  marseille: {
    name: 'Marseille',
    bounds: { minLat: 43.1, maxLat: 43.5, minLon: 5.1, maxLon: 5.6 },
    center: [43.3183, 5.3547] as [number, number]
  },
  nice: {
    name: 'Nice',
    bounds: { minLat: 43.5, maxLat: 43.9, minLon: 7.0, maxLon: 7.5 },
    center: [43.7102, 7.2620] as [number, number]
  },
  barcelona: {
    name: 'Barcelone',
    bounds: { minLat: 41.2, maxLat: 41.6, minLon: 1.9, maxLon: 2.4 },
    center: [41.3851, 2.1734] as [number, number]
  },
  rome: {
    name: 'Rome (Côtier)',
    bounds: { minLat: 41.7, maxLat: 42.1, minLon: 12.2, maxLon: 13.0 },
    center: [41.9028, 12.4964] as [number, number]
  },
  naples: {
    name: 'Naples',
    bounds: { minLat: 40.6, maxLat: 41.0, minLon: 14.0, maxLon: 14.5 },
    center: [40.8518, 14.2681] as [number, number]
  },
  valencia: {
    name: 'Valence',
    bounds: { minLat: 39.2, maxLat: 39.7, minLon: -0.6, maxLon: -0.1 },
    center: [39.4699, -0.3763] as [number, number]
  },
  lisbon: {
    name: 'Lisbonne',
    bounds: { minLat: 38.5, maxLat: 38.9, minLon: -9.4, maxLon: -8.9 },
    center: [38.7223, -9.1393] as [number, number]
  },
  amsterdam: {
    name: 'Amsterdam',
    bounds: { minLat: 52.2, maxLat: 52.5, minLon: 3.7, maxLon: 5.2 },
    center: [52.3676, 4.9041] as [number, number]
  },
  copenhagen: {
    name: 'Copenhague',
    bounds: { minLat: 55.5, maxLat: 55.9, minLon: 12.3, maxLon: 12.8 },
    center: [55.6761, 12.5683] as [number, number]
  }
};

// Fonction pour déterminer la région d'un point géographique
export function getRegionFromCoordinates(lat: number, lon: number): string | null {
  for (const [regionId, region] of Object.entries(EUROPEAN_REGIONS)) {
    const { bounds } = region;
    if (lat >= bounds.minLat && lat <= bounds.maxLat && 
        lon >= bounds.minLon && lon <= bounds.maxLon) {
      return regionId;
    }
  }
  return null;
}

// Simuler l'analyse des données EMODnet pour chaque région
export function generateRegionData(regionId: string): RegionData {
  const region = EUROPEAN_REGIONS[regionId as keyof typeof EUROPEAN_REGIONS];
  if (!region) {
    throw new Error(`Region ${regionId} not found`);
  }

  // Données simulées basées sur les caractéristiques réelles de chaque région
  const regionDataMap: { [key: string]: Partial<RegionData> } = {
    toulon: {
      totalSamples: 156,
      averageContaminants: {
        lead: 2.8, // µg/L
        cadmium: 0.45,
        mercury: 0.12,
        copper: 8.2,
        zinc: 15.6,
        pcb: 0.08,
        hydrocarbons: 12.4
      },
      riskLevel: 'MODERATE',
      stations: ['TOULON_PORT', 'TOULON_BAY', 'ALMANARRE', 'CAP_SICIE']
    },
    marseille: {
      totalSamples: 203,
      averageContaminants: {
        lead: 3.2,
        cadmium: 0.52,
        mercury: 0.15,
        copper: 9.8,
        zinc: 18.3,
        pcb: 0.12,
        hydrocarbons: 16.7
      },
      riskLevel: 'HIGH',
      stations: ['MARSEILLE_PORT', 'CALANQUES', 'FOS_SUR_MER', 'CARRY_LE_ROUET']
    },
    nice: {
      totalSamples: 89,
      averageContaminants: {
        lead: 1.8,
        cadmium: 0.28,
        mercury: 0.08,
        copper: 5.4,
        zinc: 11.2,
        pcb: 0.05,
        hydrocarbons: 8.9
      },
      riskLevel: 'LOW',
      stations: ['NICE_PORT', 'BAIE_DES_ANGES', 'ANTIBES', 'CANNES']
    },
    barcelona: {
      totalSamples: 178,
      averageContaminants: {
        lead: 3.6,
        cadmium: 0.58,
        mercury: 0.18,
        copper: 11.2,
        zinc: 21.4,
        pcb: 0.15,
        hydrocarbons: 19.8
      },
      riskLevel: 'HIGH',
      stations: ['BARCELONA_PORT', 'BESOS_RIVER', 'LLOBREGAT', 'COSTA_BRAVA']
    },
    rome: {
      totalSamples: 134,
      averageContaminants: {
        lead: 2.4,
        cadmium: 0.38,
        mercury: 0.11,
        copper: 7.1,
        zinc: 14.8,
        pcb: 0.09,
        hydrocarbons: 13.2
      },
      riskLevel: 'MODERATE',
      stations: ['OSTIA', 'FIUMICINO', 'TIBER_MOUTH', 'ANZIO']
    },
    naples: {
      totalSamples: 167,
      averageContaminants: {
        lead: 4.1,
        cadmium: 0.72,
        mercury: 0.22,
        copper: 13.8,
        zinc: 24.6,
        pcb: 0.18,
        hydrocarbons: 22.3
      },
      riskLevel: 'CRITICAL',
      stations: ['NAPLES_PORT', 'VESUVIUS_BAY', 'SORRENTO', 'CAPRI']
    },
    valencia: {
      totalSamples: 112,
      averageContaminants: {
        lead: 2.1,
        cadmium: 0.34,
        mercury: 0.09,
        copper: 6.8,
        zinc: 13.1,
        pcb: 0.07,
        hydrocarbons: 11.5
      },
      riskLevel: 'MODERATE',
      stations: ['VALENCIA_PORT', 'ALBUFERA', 'SAGUNTO', 'GANDIA']
    },
    lisbon: {
      totalSamples: 145,
      averageContaminants: {
        lead: 2.9,
        cadmium: 0.41,
        mercury: 0.13,
        copper: 8.7,
        zinc: 16.9,
        pcb: 0.10,
        hydrocarbons: 14.8
      },
      riskLevel: 'MODERATE',
      stations: ['TAGUS_ESTUARY', 'CASCAIS', 'SETUBAL', 'SINES']
    },
    amsterdam: {
      totalSamples: 198,
      averageContaminants: {
        lead: 1.6,
        cadmium: 0.22,
        mercury: 0.06,
        copper: 4.3,
        zinc: 9.8,
        pcb: 0.04,
        hydrocarbons: 7.2
      },
      riskLevel: 'LOW',
      stations: ['AMSTERDAM_PORT', 'IJSSELMEER', 'WADDEN_SEA', 'NOORDZEE']
    },
    copenhagen: {
      totalSamples: 156,
      averageContaminants: {
        lead: 1.4,
        cadmium: 0.19,
        mercury: 0.05,
        copper: 3.8,
        zinc: 8.6,
        pcb: 0.03,
        hydrocarbons: 6.1
      },
      riskLevel: 'LOW',
      stations: ['COPENHAGEN_PORT', 'ORESUND', 'KATTEGAT', 'BALTIC_SEA']
    }
  };

  const baseData = regionDataMap[regionId] || {
    totalSamples: 50,
    averageContaminants: {
      lead: 2.0,
      cadmium: 0.3,
      mercury: 0.1,
      copper: 6.0,
      zinc: 12.0,
      pcb: 0.06,
      hydrocarbons: 10.0
    },
    riskLevel: 'MODERATE' as const,
    stations: ['STATION_1', 'STATION_2']
  };

  return {
    regionId,
    regionName: region.name,
    coordinates: region.center,
    lastUpdated: new Date().toISOString(),
    ...baseData
  } as RegionData;
}

// Fonction pour calculer le niveau de risque basé sur les contaminants
export function calculateRiskLevel(contaminants: { [key: string]: number }): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
  const thresholds = {
    lead: { moderate: 2.0, high: 4.0, critical: 6.0 },
    cadmium: { moderate: 0.3, high: 0.6, critical: 1.0 },
    mercury: { moderate: 0.1, high: 0.2, critical: 0.3 },
    copper: { moderate: 6.0, high: 12.0, critical: 20.0 },
    zinc: { moderate: 12.0, high: 20.0, critical: 30.0 },
    pcb: { moderate: 0.05, high: 0.1, critical: 0.2 },
    hydrocarbons: { moderate: 10.0, high: 20.0, critical: 30.0 }
  };

  let maxRiskScore = 0;

  for (const [contaminant, value] of Object.entries(contaminants)) {
    const threshold = thresholds[contaminant as keyof typeof thresholds];
    if (!threshold) continue;

    let score = 0;
    if (value >= threshold.critical) score = 4;
    else if (value >= threshold.high) score = 3;
    else if (value >= threshold.moderate) score = 2;
    else score = 1;

    maxRiskScore = Math.max(maxRiskScore, score);
  }

  switch (maxRiskScore) {
    case 4: return 'CRITICAL';
    case 3: return 'HIGH';
    case 2: return 'MODERATE';
    default: return 'LOW';
  }
}

// Fonction pour générer des KPIs basés sur les données réelles
export function generateRegionalKPIs(regionId: string) {
  const regionData = generateRegionData(regionId);
  const { averageContaminants, totalSamples, riskLevel } = regionData;

  // Calculer la pollution moyenne pondérée
  const pollutionIndex = (
    averageContaminants.lead * 0.2 +
    averageContaminants.cadmium * 0.15 +
    averageContaminants.mercury * 0.15 +
    averageContaminants.copper * 0.1 +
    averageContaminants.zinc * 0.1 +
    averageContaminants.pcb * 0.15 +
    averageContaminants.hydrocarbons * 0.15
  );

  // Calculer la qualité de l'eau (inversement proportionnelle à la pollution)
  const waterQuality = Math.max(0, 100 - (pollutionIndex * 2));

  // Calculer le niveau de biodiversité (affecté par la pollution)
  const biodiversityIndex = Math.max(20, 90 - (pollutionIndex * 1.5));

  // Calculer l'efficacité du traitement (basée sur le niveau de risque)
  const treatmentEfficiency = {
    'LOW': 85 + Math.random() * 10,
    'MODERATE': 70 + Math.random() * 15,
    'HIGH': 55 + Math.random() * 20,
    'CRITICAL': 40 + Math.random() * 25
  }[riskLevel];

  return {
    pollutionLevel: Math.round(pollutionIndex * 10) / 10,
    waterQuality: Math.round(waterQuality),
    biodiversityIndex: Math.round(biodiversityIndex),
    treatmentEfficiency: Math.round(treatmentEfficiency),
    totalSamples,
    riskLevel,
    lastUpdated: regionData.lastUpdated
  };
}
