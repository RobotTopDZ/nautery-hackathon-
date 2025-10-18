'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, Waves, Factory, Droplets, Navigation, Target, Zap, AlertTriangle
} from 'lucide-react'

interface WaterStation {
  id: string
  name: string
  x: number
  y: number
  capacity: number // m³/jour
  treatment: string
  rejectionPoint: { x: number, y: number }
  waterPath: { x: number, y: number }[]
  pollutionLevel: 'high' | 'medium' | 'low'
  rejectedPollutants: string[]
  treatmentEfficiency: number // %
  description: string
}

interface PollutionZone {
  id: string
  name: string
  centerX: number
  centerY: number
  concentration: number
  radius: number
  source: string
  dispersionLevels: { radius: number, concentration: number, opacity: number }[]
}

const waterStations: WaterStation[] = [
  {
    id: 'egoutier',
    name: 'Station de l\'Égoutier',
    x: 35, y: 25,
    capacity: 120000,
    treatment: 'Traitement biologique avancé + déphosphatation',
    rejectionPoint: { x: 45, y: 55 },
    waterPath: [{ x: 35, y: 25 }, { x: 38, y: 35 }, { x: 42, y: 45 }, { x: 45, y: 55 }],
    pollutionLevel: 'medium',
    rejectedPollutants: ['Azote résiduel: 15 mg/L', 'Phosphore: 2 mg/L', 'Matières organiques: 25 mg/L', 'Micropolluants traces'],
    treatmentEfficiency: 85,
    description: 'Plus grande station de Toulon. Traite 120,000 m³/jour d\'eaux urbaines avec rejet en rade après traitement biologique.'
  },
  {
    id: 'seyne',
    name: 'Station La Seyne-sur-Mer',
    x: 15, y: 35,
    capacity: 28000,
    treatment: 'Traitement secondaire + décantation',
    rejectionPoint: { x: 25, y: 65 },
    waterPath: [{ x: 15, y: 35 }, { x: 18, y: 45 }, { x: 22, y: 55 }, { x: 25, y: 65 }],
    pollutionLevel: 'high',
    rejectedPollutants: ['Métaux lourds: 0.5 mg/L', 'Hydrocarbures: 2 mg/L', 'Détergents: 8 mg/L', 'Matières en suspension: 35 mg/L'],
    treatmentEfficiency: 70,
    description: 'Station traitant les eaux industrielles et domestiques de La Seyne. Efficacité limitée sur les polluants industriels.'
  },
  {
    id: 'cap-sicie',
    name: 'CAP SICIÉ - AMPHITRIA',
    x: 10, y: 70,
    capacity: 35000,
    treatment: 'Traitement tertiaire + UV + microfiltration',
    rejectionPoint: { x: 15, y: 85 },
    waterPath: [{ x: 10, y: 70 }, { x: 12, y: 75 }, { x: 13, y: 80 }, { x: 15, y: 85 }],
    pollutionLevel: 'low',
    rejectedPollutants: ['Résidus pharmaceutiques: traces', 'Microplastiques: <0.1 mg/L', 'Nutriments: très faible', 'Bactéries: 0 (UV)'],
    treatmentEfficiency: 95,
    description: 'Station la plus moderne avec traitement tertiaire UV. Rejet en eau profonde avec qualité proche de l\'eau naturelle.'
  },
  {
    id: 'gapeau',
    name: 'Station du Gapeau',
    x: 75, y: 40,
    capacity: 45000,
    treatment: 'Traitement biologique + lagunage',
    rejectionPoint: { x: 80, y: 70 },
    waterPath: [{ x: 75, y: 40 }, { x: 76, y: 50 }, { x: 78, y: 60 }, { x: 80, y: 70 }],
    pollutionLevel: 'medium',
    rejectedPollutants: ['Nitrates: 25 mg/L', 'Phosphates: 3 mg/L', 'Matières en suspension: 20 mg/L', 'Pesticides traces'],
    treatmentEfficiency: 80,
    description: 'Station desservant Hyères et environs. Traitement par lagunage naturel avec rejet vers la rade de Toulon.'
  }
]

const pollutionZones: PollutionZone[] = [
  {
    id: 'port-militaire',
    name: 'Port Militaire Arsenal',
    centerX: 50, centerY: 35,
    concentration: 4.5,
    radius: 25,
    source: 'Arsenal militaire - Activités navales',
    dispersionLevels: [
      { radius: 25, concentration: 4.5, opacity: 0.8 },
      { radius: 20, concentration: 3.2, opacity: 0.6 },
      { radius: 15, concentration: 2.1, opacity: 0.4 },
      { radius: 10, concentration: 1.3, opacity: 0.2 },
      { radius: 5, concentration: 0.8, opacity: 0.1 }
    ]
  },
  {
    id: 'zone-industrielle',
    name: 'Zone Industrielle',
    centerX: 60, centerY: 25,
    concentration: 3.8,
    radius: 30,
    source: 'Industries chimiques et métallurgiques',
    dispersionLevels: [
      { radius: 30, concentration: 3.8, opacity: 0.7 },
      { radius: 25, concentration: 2.8, opacity: 0.5 },
      { radius: 20, concentration: 1.9, opacity: 0.3 },
      { radius: 15, concentration: 1.2, opacity: 0.2 },
      { radius: 10, concentration: 0.7, opacity: 0.1 }
    ]
  }
]

export function ToulonWaterSystemMap({ className }: { className?: string }) {
  const [selectedStation, setSelectedStation] = useState<WaterStation | null>(null)
  const [selectedZone, setSelectedZone] = useState<PollutionZone | null>(null)
  const [showStations, setShowStations] = useState(true)
  const [showPaths, setShowPaths] = useState(true)
  const [showDispersion, setShowDispersion] = useState(true)

  const getStationColor = (level: string) => {
    switch (level) {
      case 'high': return '#dc2626'
      case 'medium': return '#ea580c'
      case 'low': return '#16a34a'
      default: return '#6b7280'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Waves className="h-5 w-5 text-blue-400" />
          <span>Système d'Épuration Marine - Toulon</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contrôles */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showStations ? "default" : "outline"}
            size="sm"
            onClick={() => setShowStations(!showStations)}
          >
            <Factory className="h-4 w-4 mr-1" />
            Stations ({waterStations.length})
          </Button>
          <Button
            variant={showPaths ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPaths(!showPaths)}
          >
            <Navigation className="h-4 w-4 mr-1" />
            Canalisations
          </Button>
          <Button
            variant={showDispersion ? "default" : "outline"}
            size="sm"
            onClick={() => setShowDispersion(!showDispersion)}
          >
            <Zap className="h-4 w-4 mr-1" />
            Dispersion
          </Button>
        </div>

        {/* Carte du système d'eau */}
        <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 rounded-lg overflow-hidden border-2 border-blue-600/50">
          {/* Fond côtier */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 to-blue-800/50"></div>
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-green-800/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-green-800/40 to-transparent"></div>

          {/* Zones de dispersion de pollution */}
          {showDispersion && pollutionZones.map((zone) => (
            <div key={zone.id}>
              {zone.dispersionLevels.map((level, index) => (
                <div
                  key={index}
                  className="absolute rounded-full pointer-events-none animate-pulse"
                  style={{
                    left: `${zone.centerX - level.radius/2}%`,
                    top: `${zone.centerY - level.radius/2}%`,
                    width: `${level.radius}%`,
                    height: `${level.radius}%`,
                    backgroundColor: '#dc2626',
                    opacity: level.opacity,
                    animationDelay: `${index * 0.5}s`,
                    animationDuration: '4s'
                  }}
                />
              ))}
              <button
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${zone.centerX}%`, top: `${zone.centerY}%` }}
                onClick={() => setSelectedZone(zone)}
              >
                <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white flex items-center justify-center">
                  <AlertTriangle className="h-3 w-3 text-white" />
                </div>
              </button>
            </div>
          ))}

          {/* Canalisations et chemins d'eau */}
          {showPaths && waterStations.map((station) => (
            <div key={`path-${station.id}`}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                  </marker>
                </defs>
                <polyline
                  points={station.waterPath.map(point => `${point.x}%,${point.y}%`).join(' ')}
                  stroke="#3b82f6"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="10,5"
                  markerEnd="url(#arrowhead)"
                  opacity="0.8"
                />
              </svg>
              
              {/* Flux d'eau animé */}
              {station.waterPath.map((point, index) => (
                <div
                  key={index}
                  className="absolute w-2 h-2 bg-blue-400 rounded-full animate-ping"
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    animationDelay: `${index * 0.3}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          ))}

          {/* Stations d'épuration */}
          {showStations && waterStations.map((station) => (
            <div key={station.id}>
              {/* Station */}
              <button
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform"
                style={{ left: `${station.x}%`, top: `${station.y}%` }}
                onClick={() => setSelectedStation(station)}
              >
                <div 
                  className="w-10 h-10 rounded-lg border-3 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: getStationColor(station.pollutionLevel) }}
                >
                  <Factory className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/70 px-2 py-1 rounded whitespace-nowrap">
                  {station.capacity.toLocaleString()} m³/j
                </div>
              </button>

              {/* Point de rejet */}
              <button
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform"
                style={{ left: `${station.rejectionPoint.x}%`, top: `${station.rejectionPoint.y}%` }}
                onClick={() => setSelectedStation(station)}
              >
                <div 
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse"
                  style={{ backgroundColor: getStationColor(station.pollutionLevel) }}
                >
                  <Droplets className="h-3 w-3 text-white" />
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Légende */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800/20 rounded-lg">
          <div>
            <h4 className="text-sm font-medium mb-2">Stations d'Épuration</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <Factory className="h-3 w-3 text-green-500" />
                <span>Efficacité élevée (&gt;90%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Factory className="h-3 w-3 text-orange-500" />
                <span>Efficacité moyenne (70-90%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Factory className="h-3 w-3 text-red-500" />
                <span>Efficacité faible (&lt;70%)</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Système de Rejet</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-blue-400"></div>
                <span>Canalisation vers mer</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="h-3 w-3 text-blue-400" />
                <span>Point de rejet marine</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-ping"></div>
                <span>Flux d'eau traité</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Dispersion Pollution</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600 opacity-80"></div>
                <span>Centre: concentration max</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600 opacity-40"></div>
                <span>Périphérie: dispersion</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600 opacity-10"></div>
                <span>Limite: traces</span>
              </div>
            </div>
          </div>
        </div>

        {/* Détails station sélectionnée */}
        {selectedStation && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Factory className="h-5 w-5 text-blue-400" />
                <h4 className="font-medium text-blue-400">{selectedStation.name}</h4>
                <Badge className={`${
                  selectedStation.pollutionLevel === 'high' ? 'bg-red-500' :
                  selectedStation.pollutionLevel === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                }`}>
                  {selectedStation.treatmentEfficiency}% efficacité
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedStation(null)}>×</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div><strong>Capacité:</strong> {selectedStation.capacity.toLocaleString()} m³/jour</div>
                <div><strong>Traitement:</strong> {selectedStation.treatment}</div>
                <div><strong>Efficacité:</strong> {selectedStation.treatmentEfficiency}%</div>
              </div>
              <div className="space-y-2">
                <div><strong>Polluants rejetés:</strong></div>
                <div className="text-xs space-y-1">
                  {selectedStation.rejectedPollutants.map((pollutant, index) => (
                    <div key={index} className="bg-gray-800/30 p-1 rounded">• {pollutant}</div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-gray-800/50 rounded text-xs">
              <strong>Description:</strong><br />
              {selectedStation.description}
            </div>
          </div>
        )}

        {/* Détails zone sélectionnée */}
        {selectedZone && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h4 className="font-medium text-red-400">{selectedZone.name}</h4>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedZone(null)}>×</Button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div><strong>Concentration max:</strong> {selectedZone.concentration} µg/L</div>
              <div><strong>Rayon d'impact:</strong> {selectedZone.radius}% de la carte</div>
              <div><strong>Source:</strong> {selectedZone.source}</div>
              <div><strong>Dispersion:</strong></div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedZone.dispersionLevels.map((level, index) => (
                  <div key={index} className="bg-gray-800/30 p-2 rounded">
                    <div>Rayon {level.radius}%: {level.concentration} µg/L</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
