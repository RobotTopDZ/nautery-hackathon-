'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Waves, 
  AlertTriangle, 
  Factory, 
  Shield,
  Droplets,
  Zap,
  Target,
  Navigation
} from 'lucide-react'

interface PollutionPoint {
  id: string
  name: string
  x: number // Position CSS en %
  y: number // Position CSS en %
  level: 'critical' | 'high' | 'medium' | 'low'
  concentration: number
  pollutants: string[]
  source: string
  type: 'port' | 'industry' | 'station' | 'urban' | 'tourism'
  description: string
}

// Données mock pour Toulon avec positions CSS
const mockPollutionData: PollutionPoint[] = [
  {
    id: 'port-militaire',
    name: 'Port Militaire Arsenal',
    x: 45, y: 35,
    level: 'critical',
    concentration: 4.2,
    pollutants: ['Hydrocarbures', 'Métaux lourds', 'TBT', 'Antifouling'],
    source: 'Arsenal militaire - Navires de guerre',
    type: 'port',
    description: 'Zone de pollution critique due aux activités navales militaires intensives avec rejets d\'hydrocarbures et métaux lourds'
  },
  {
    id: 'zone-industrielle',
    name: 'Zone Industrielle Nord',
    x: 55, y: 25,
    level: 'high',
    concentration: 3.7,
    pollutants: ['Métaux lourds', 'Solvants', 'Acides', 'Produits chimiques'],
    source: 'Complexe industriel - Chimie et métallurgie',
    type: 'industry',
    description: 'Concentration d\'industries chimiques et métallurgiques avec rejets de produits toxiques'
  },
  {
    id: 'port-commerce',
    name: 'Port de Commerce',
    x: 42, y: 45,
    level: 'high',
    concentration: 3.1,
    pollutants: ['Hydrocarbures', 'Particules fines', 'Métaux'],
    source: 'Trafic maritime commercial - Manutention',
    type: 'port',
    description: 'Pollution liée au trafic maritime commercial intense et aux opérations de manutention'
  },
  {
    id: 'darse-vieille',
    name: 'Darse Vieille',
    x: 48, y: 32,
    level: 'high',
    concentration: 2.8,
    pollutants: ['Antifouling', 'Hydrocarbures', 'Détergents'],
    source: 'Port de plaisance - Carénage',
    type: 'port',
    description: 'Pollution chronique due aux activités de plaisance et de carénage des bateaux'
  },
  {
    id: 'station-egoutier',
    name: 'Rejet Station Égoutier',
    x: 40, y: 50,
    level: 'medium',
    concentration: 2.2,
    pollutants: ['Azote', 'Phosphore', 'Matières organiques', 'Micropolluants'],
    source: 'Station épuration principale - 120,000 m³/jour',
    type: 'station',
    description: 'Point de rejet de la plus grande station d\'épuration de Toulon traitant les eaux urbaines'
  },
  {
    id: 'station-seyne',
    name: 'Rejet La Seyne',
    x: 25, y: 55,
    level: 'medium',
    concentration: 2.0,
    pollutants: ['Métaux lourds', 'Hydrocarbures', 'Détergents'],
    source: 'Station La Seyne - 28,000 m³/jour',
    type: 'station',
    description: 'Rejet d\'eaux industrielles et domestiques de La Seyne-sur-Mer'
  },
  {
    id: 'baie-lazaret',
    name: 'Baie du Lazaret',
    x: 35, y: 60,
    level: 'medium',
    concentration: 1.8,
    pollutants: ['Nutriments', 'Bactéries', 'Déchets plastiques'],
    source: 'Ruissellement urbain - Égouts pluviaux',
    type: 'urban',
    description: 'Pollution diffuse d\'origine urbaine avec ruissellement des eaux de pluie'
  },
  {
    id: 'anse-mejean',
    name: 'Anse Méjean',
    x: 20, y: 65,
    level: 'medium',
    concentration: 1.5,
    pollutants: ['Crèmes solaires', 'Eaux usées', 'Microplastiques'],
    source: 'Activités balnéaires - Tourisme',
    type: 'tourism',
    description: 'Impact du tourisme balnéaire sur la qualité de l\'eau avec pollution saisonnière'
  },
  {
    id: 'station-gapeau',
    name: 'Rejet Gapeau',
    x: 75, y: 70,
    level: 'medium',
    concentration: 1.6,
    pollutants: ['Nitrates', 'Phosphates', 'Matières en suspension'],
    source: 'Station Gapeau - 45,000 m³/jour',
    type: 'station',
    description: 'Rejet vers la rade depuis la région d\'Hyères avec traitement secondaire'
  },
  {
    id: 'cap-sicie',
    name: 'CAP SICIÉ',
    x: 15, y: 75,
    level: 'low',
    concentration: 0.9,
    pollutants: ['Résidus pharmaceutiques', 'Microplastiques'],
    source: 'Station CAP SICIÉ - Traitement UV - 35,000 m³/jour',
    type: 'station',
    description: 'Station moderne avec traitement tertiaire UV, rejet en eau profonde'
  }
]

interface ToulonMapProps {
  className?: string
}

export function ToulonMapSimple({ className }: ToulonMapProps) {
  const [selectedPoint, setSelectedPoint] = useState<PollutionPoint | null>(null)
  const [showCritical, setShowCritical] = useState(true)
  const [showHigh, setShowHigh] = useState(true)
  const [showMedium, setShowMedium] = useState(true)
  const [showLow, setShowLow] = useState(true)

  // Filtrer les données selon les niveaux sélectionnés
  const getFilteredData = () => {
    return mockPollutionData.filter(point => {
      if (point.level === 'critical' && !showCritical) return false
      if (point.level === 'high' && !showHigh) return false
      if (point.level === 'medium' && !showMedium) return false
      if (point.level === 'low' && !showLow) return false
      return true
    })
  }

  // Obtenir la couleur selon le niveau
  const getColor = (level: string) => {
    switch (level) {
      case 'critical': return '#dc2626'
      case 'high': return '#ea580c'
      case 'medium': return '#ca8a04'
      case 'low': return '#16a34a'
      default: return '#6b7280'
    }
  }

  // Obtenir l'icône selon le type
  const getIcon = (type: string) => {
    switch (type) {
      case 'port': return Factory
      case 'industry': return AlertTriangle
      case 'station': return Droplets
      case 'urban': return MapPin
      case 'tourism': return Waves
      default: return Target
    }
  }

  const filteredData = getFilteredData()
  const stats = {
    critical: filteredData.filter(p => p.level === 'critical').length,
    high: filteredData.filter(p => p.level === 'high').length,
    medium: filteredData.filter(p => p.level === 'medium').length,
    low: filteredData.filter(p => p.level === 'low').length,
    avgConcentration: filteredData.length > 0 ? 
      (filteredData.reduce((sum, p) => sum + p.concentration, 0) / filteredData.length).toFixed(2) : '0'
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Waves className="h-5 w-5 text-blue-400" />
            <span>Carte Pollution Marine - Rade de Toulon</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {filteredData.length} points actifs
            </Badge>
            <Badge className="bg-blue-600 text-xs">
              Données 2024
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contrôles de filtrage */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            variant={showCritical ? "destructive" : "outline"}
            size="sm"
            onClick={() => setShowCritical(!showCritical)}
            className="flex items-center space-x-1"
          >
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Critique ({stats.critical})</span>
          </Button>
          <Button
            variant={showHigh ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHigh(!showHigh)}
            className="flex items-center space-x-1 bg-orange-600 hover:bg-orange-700"
          >
            <div className="w-3 h-3 rounded-full bg-orange-600"></div>
            <span>Élevé ({stats.high})</span>
          </Button>
          <Button
            variant={showMedium ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMedium(!showMedium)}
            className="flex items-center space-x-1 bg-yellow-600 hover:bg-yellow-700"
          >
            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
            <span>Modéré ({stats.medium})</span>
          </Button>
          <Button
            variant={showLow ? "default" : "outline"}
            size="sm"
            onClick={() => setShowLow(!showLow)}
            className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
          >
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>Faible ({stats.low})</span>
          </Button>
        </div>

        {/* Carte CSS avec fond de Toulon */}
        <div className="relative w-full h-[500px] bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 rounded-lg overflow-hidden border-2 border-blue-600/50">
          {/* Fond de la rade */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/30 to-blue-800/50"></div>
          
          {/* Côtes et terres */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-green-800/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/4 bg-gradient-to-t from-green-800/40 to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-green-800/40 to-transparent"></div>
          <div className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-green-800/40 to-transparent"></div>

          {/* Points de pollution */}
          {filteredData.map((point) => {
            const color = getColor(point.level)
            const Icon = getIcon(point.type)
            const size = point.level === 'critical' ? 'large' : 
                        point.level === 'high' ? 'medium' : 'small'
            
            return (
              <div key={point.id}>
                {/* Cercles de pollution */}
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ 
                    left: `${point.x}%`, 
                    top: `${point.y}%`,
                    width: size === 'large' ? '120px' : size === 'medium' ? '80px' : '60px',
                    height: size === 'large' ? '120px' : size === 'medium' ? '80px' : '60px'
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{ 
                      backgroundColor: color,
                      opacity: 0.1,
                      animation: 'pulse 3s infinite'
                    }}
                  ></div>
                  <div 
                    className="absolute inset-2 rounded-full"
                    style={{ 
                      backgroundColor: color,
                      opacity: 0.2
                    }}
                  ></div>
                  <div 
                    className="absolute inset-4 rounded-full"
                    style={{ 
                      backgroundColor: color,
                      opacity: 0.3
                    }}
                  ></div>
                </div>

                {/* Marqueur central */}
                <button
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 hover:scale-110 transition-transform"
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                  onClick={() => setSelectedPoint(point)}
                >
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div 
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/70 px-1 rounded"
                  >
                    {point.concentration}
                  </div>
                </button>
              </div>
            )
          })}

          {/* Légende de navigation */}
          <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-xs">
            <div className="flex items-center space-x-1 mb-1">
              <Navigation className="h-3 w-3" />
              <span>Rade de Toulon</span>
            </div>
            <div>Cliquez sur les points</div>
          </div>
        </div>

        {/* Légende détaillée */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-800/20 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-neutral mb-3 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Types de Sources
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <Factory className="h-3 w-3 text-red-400" />
                <span>Ports et Arsenal</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-3 w-3 text-orange-400" />
                <span>Zones Industrielles</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="h-3 w-3 text-blue-400" />
                <span>Stations d'Épuration</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-3 w-3 text-yellow-400" />
                <span>Zones Urbaines</span>
              </div>
              <div className="flex items-center space-x-2">
                <Waves className="h-3 w-3 text-green-400" />
                <span>Zones Touristiques</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral mb-3 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Niveaux de Pollution
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Critique: &gt;3.5 µg/L</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                <span>Élevé: 2.5-3.5 µg/L</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <span>Modéré: 1.0-2.5 µg/L</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span>Faible: &lt;1.0 µg/L</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-neutral mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Symboles de la Carte
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
                <span>Cercles: Zone d'impact</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-white border border-gray-400"></div>
                <span>Point central: Source</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-gradient-to-r from-blue-800 to-blue-400"></div>
                <span>Bleu: Eau de mer</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-gradient-to-r from-green-800 to-green-600"></div>
                <span>Vert: Côtes et terres</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques en temps réel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
            <div className="text-xs text-neutral/70">Zones Critiques</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.high}</div>
            <div className="text-xs text-neutral/70">Zones Élevées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.medium}</div>
            <div className="text-xs text-neutral/70">Zones Modérées</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.avgConcentration}</div>
            <div className="text-xs text-neutral/70">Moyenne µg/L</div>
          </div>
        </div>

        {/* Détails du point sélectionné */}
        {selectedPoint && (
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: getColor(selectedPoint.level) }}
                ></div>
                <h4 className="font-medium text-blue-400">{selectedPoint.name}</h4>
                <Badge className={`${
                  selectedPoint.level === 'critical' ? 'bg-red-500' :
                  selectedPoint.level === 'high' ? 'bg-orange-500' :
                  selectedPoint.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {selectedPoint.level.toUpperCase()}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPoint(null)}
                className="text-neutral/70 hover:text-neutral"
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div><strong>Concentration:</strong> {selectedPoint.concentration} µg/L</div>
                <div><strong>Type:</strong> {selectedPoint.type}</div>
                <div><strong>Source:</strong> {selectedPoint.source}</div>
              </div>
              <div className="space-y-2">
                <div><strong>Polluants principaux:</strong></div>
                <div className="flex flex-wrap gap-1">
                  {selectedPoint.pollutants.map((pollutant, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {pollutant}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-gray-800/50 rounded text-xs">
              <strong>Description:</strong><br />
              {selectedPoint.description}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
