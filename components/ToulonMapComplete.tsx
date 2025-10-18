'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Waves, 
  AlertTriangle, 
  Factory, 
  Shield,
  Eye,
  ZoomIn,
  RotateCcw
} from 'lucide-react'

interface PollutionData {
  id: string
  name: string
  coordinates: [number, number]
  level: 'critical' | 'high' | 'medium' | 'low'
  concentration: number // µg/L
  pollutants: string[]
  source: string
  radius: number
  description: string
}

interface ToulonMapProps {
  className?: string
}

// Données de pollution réalistes pour Toulon
const toulonPollutionData: PollutionData[] = [
  {
    id: 'port-militaire',
    name: 'Port Militaire Arsenal',
    coordinates: [43.1167, 5.9289],
    level: 'critical',
    concentration: 3.8,
    pollutants: ['Hydrocarbures', 'Métaux lourds', 'Antifouling', 'TBT'],
    source: 'Arsenal militaire et navires de guerre',
    radius: 2.5,
    description: 'Zone de pollution critique due aux activités navales militaires intensives'
  },
  {
    id: 'port-commerce',
    name: 'Port de Commerce',
    coordinates: [43.1089, 5.9345],
    level: 'high',
    concentration: 2.9,
    pollutants: ['Hydrocarbures', 'Particules fines', 'Métaux'],
    source: 'Trafic commercial et manutention portuaire',
    radius: 2.0,
    description: 'Pollution élevée liée au trafic maritime commercial intense'
  },
  {
    id: 'zone-industrielle',
    name: 'Zone Industrielle Toulon Nord',
    coordinates: [43.1345, 5.9456],
    level: 'high',
    concentration: 3.2,
    pollutants: ['Métaux lourds', 'Solvants', 'Acides', 'Produits chimiques'],
    source: 'Industries chimiques et métallurgiques',
    radius: 3.0,
    description: 'Concentration d\'industries polluantes avec rejets chimiques'
  },
  {
    id: 'darse-vieille',
    name: 'Darse Vieille - Port de Plaisance',
    coordinates: [43.1234, 5.9278],
    level: 'high',
    concentration: 2.4,
    pollutants: ['Antifouling', 'Hydrocarbures', 'Détergents'],
    source: 'Plaisance et activités de carénage',
    radius: 1.2,
    description: 'Pollution chronique due aux activités de plaisance'
  },
  {
    id: 'egoutier-rejet',
    name: 'Rejet Station Égoutier',
    coordinates: [43.1089, 5.9234],
    level: 'medium',
    concentration: 1.8,
    pollutants: ['Azote', 'Phosphore', 'Matières organiques', 'Micropolluants'],
    source: 'Station d\'épuration principale (120,000 m³/jour)',
    radius: 1.8,
    description: 'Point de rejet de la plus grande station d\'épuration'
  },
  {
    id: 'baie-lazaret',
    name: 'Baie du Lazaret',
    coordinates: [43.0934, 5.9123],
    level: 'medium',
    concentration: 1.5,
    pollutants: ['Nutriments', 'Bactéries', 'Déchets plastiques'],
    source: 'Ruissellement urbain et égouts pluviaux',
    radius: 1.5,
    description: 'Pollution diffuse d\'origine urbaine'
  },
  {
    id: 'seyne-rejet',
    name: 'Rejet La Seyne-sur-Mer',
    coordinates: [43.0834, 5.8656],
    level: 'medium',
    concentration: 2.1,
    pollutants: ['Métaux lourds', 'Hydrocarbures', 'Détergents'],
    source: 'Station épuration La Seyne (28,000 m³/jour)',
    radius: 1.4,
    description: 'Rejet d\'eaux industrielles et domestiques'
  },
  {
    id: 'cap-sicie-rejet',
    name: 'Rejet CAP SICIÉ',
    coordinates: [43.0645, 5.8123],
    level: 'low',
    concentration: 0.9,
    pollutants: ['Résidus pharmaceutiques', 'Microplastiques'],
    source: 'Station CAP SICIÉ traitement avancé (35,000 m³/jour)',
    radius: 1.0,
    description: 'Station moderne avec traitement tertiaire UV'
  },
  {
    id: 'anse-mejean',
    name: 'Anse Méjean',
    coordinates: [43.0789, 5.8934],
    level: 'medium',
    concentration: 1.3,
    pollutants: ['Crèmes solaires', 'Eaux usées', 'Microplastiques'],
    source: 'Activités balnéaires et tourisme',
    radius: 1.1,
    description: 'Impact du tourisme balnéaire sur la qualité de l\'eau'
  },
  {
    id: 'gapeau-rejet',
    name: 'Rejet Gapeau-Hyères',
    coordinates: [43.0956, 6.1456],
    level: 'medium',
    concentration: 1.6,
    pollutants: ['Nitrates', 'Phosphates', 'Matières en suspension'],
    source: 'Station épuration Gapeau (45,000 m³/jour)',
    radius: 1.3,
    description: 'Rejet vers la rade depuis la région d\'Hyères'
  }
]

export function ToulonMapComplete({ className }: ToulonMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [selectedPoint, setSelectedPoint] = useState<PollutionData | null>(null)
  const [showCritical, setShowCritical] = useState(true)
  const [showHigh, setShowHigh] = useState(true)
  const [showMedium, setShowMedium] = useState(true)
  const [showLow, setShowLow] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(11)

  // Filtrer les données selon les niveaux sélectionnés
  const getFilteredData = () => {
    return toulonPollutionData.filter(point => {
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
      case 'critical': return '#dc2626' // Rouge intense
      case 'high': return '#ea580c' // Orange
      case 'medium': return '#ca8a04' // Jaune
      case 'low': return '#16a34a' // Vert
      default: return '#6b7280'
    }
  }

  // Zoom sur les zones polluées
  const zoomToPollutedAreas = () => {
    if (!mapInstanceRef.current) return
    
    const filteredData = getFilteredData()
    if (filteredData.length === 0) return

    import('leaflet').then((L) => {
      const group = L.featureGroup(
        filteredData.map(point => L.marker(point.coordinates))
      )
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1))
    })
  }

  // Reset vue
  const resetView = () => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.setView([43.1242, 5.9280], 11)
    setCurrentZoom(11)
  }

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    import('leaflet').then((L) => {
      // Nettoyer la carte existante
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }

      // Créer la carte centrée sur Toulon
      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true
      }).setView([43.1242, 5.9280], 11)
      
      mapInstanceRef.current = map

      // Tuiles OpenStreetMap (plus fiables que satellite)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map)

      // Contrôles de zoom
      L.control.zoom({ position: 'topright' }).addTo(map)

      // Événement de zoom
      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom())
      })

      setMapReady(true)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Mettre à jour les marqueurs quand les filtres changent
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current
      
      // Effacer tous les marqueurs existants
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.Circle) {
          map.removeLayer(layer)
        }
      })

      const filteredData = getFilteredData()

      filteredData.forEach((point) => {
        const color = getColor(point.level)
        const intensity = point.concentration / 4.0 // Normaliser sur 4 µg/L max
        
        // Créer des cercles concentriques pour l'effet de pollution
        const circles = [
          { radius: point.radius * 1000 * 1.8, opacity: 0.05 },
          { radius: point.radius * 1000 * 1.5, opacity: 0.1 },
          { radius: point.radius * 1000 * 1.2, opacity: 0.15 },
          { radius: point.radius * 1000, opacity: 0.25 },
          { radius: point.radius * 1000 * 0.7, opacity: 0.4 },
          { radius: point.radius * 1000 * 0.4, opacity: 0.6 }
        ]

        circles.forEach((circle, index) => {
          L.circle(point.coordinates, {
            radius: circle.radius,
            fillColor: color,
            color: index === circles.length - 1 ? color : 'transparent',
            weight: index === circles.length - 1 ? 2 : 0,
            opacity: circle.opacity,
            fillOpacity: circle.opacity
          }).addTo(map).on('click', () => {
            setSelectedPoint(point)
          })
        })

        // Marqueur central
        const markerIcon = L.divIcon({
          html: `<div style="
            width: 24px; 
            height: 24px; 
            background-color: ${color}; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            font-weight: bold;
          ">${point.concentration.toFixed(1)}</div>`,
          className: 'custom-pollution-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        L.marker(point.coordinates, { icon: markerIcon })
          .bindPopup(`
            <div class="text-sm p-3 bg-gray-900 text-white rounded-lg shadow-lg min-w-[280px]">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-4 h-4 rounded-full" style="background-color: ${color}"></div>
                <div class="font-bold text-blue-400">${point.name}</div>
              </div>
              <div class="space-y-2 text-xs">
                <div><strong>Concentration:</strong> ${point.concentration} µg/L</div>
                <div><strong>Niveau:</strong> 
                  <span style="color: ${color}; font-weight: bold;">
                    ${point.level.toUpperCase()}
                  </span>
                </div>
                <div><strong>Source:</strong> ${point.source}</div>
                <div><strong>Rayon d'impact:</strong> ${point.radius} km</div>
                <div><strong>Polluants:</strong> ${point.pollutants.join(', ')}</div>
                <div class="mt-2 p-2 bg-gray-800 rounded">
                  <strong>Description:</strong><br>
                  ${point.description}
                </div>
              </div>
            </div>
          `)
          .on('click', () => {
            setSelectedPoint(point)
          })
          .addTo(map)
      })
    })
  }, [mapReady, showCritical, showHigh, showMedium, showLow])

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
            <span>Pollution Marine - Rade de Toulon</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {filteredData.length} points actifs
            </Badge>
            <Badge className="bg-blue-600 text-xs">
              Zoom: {currentZoom}
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

        {/* Actions rapides */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={zoomToPollutedAreas}
            className="flex items-center space-x-1"
          >
            <ZoomIn className="h-4 w-4" />
            <span>Zones Polluées</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
            className="flex items-center space-x-1"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Vue</span>
          </Button>
        </div>

        {/* Carte interactive */}
        <div 
          ref={mapRef} 
          className="w-full h-[500px] rounded-lg overflow-hidden border border-gray-600/50"
          style={{ background: '#e3f2fd' }}
        />
        
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
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: getColor(selectedPoint.level) }}
                ></div>
                <h4 className="font-medium text-blue-400">{selectedPoint.name}</h4>
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
                <div><strong>Niveau:</strong> 
                  <Badge className={`ml-2 ${
                    selectedPoint.level === 'critical' ? 'bg-red-500' :
                    selectedPoint.level === 'high' ? 'bg-orange-500' :
                    selectedPoint.level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                    {selectedPoint.level.toUpperCase()}
                  </Badge>
                </div>
                <div><strong>Rayon d'impact:</strong> {selectedPoint.radius} km</div>
              </div>
              <div className="space-y-2">
                <div><strong>Source:</strong> {selectedPoint.source}</div>
                <div><strong>Polluants:</strong> {selectedPoint.pollutants.join(', ')}</div>
              </div>
            </div>
            
            <div className="mt-3 p-3 bg-gray-800/50 rounded text-xs">
              <strong>Description:</strong><br />
              {selectedPoint.description}
            </div>
          </div>
        )}

        {/* Légende */}
        <div className="p-3 bg-gray-800/20 rounded-lg">
          <h4 className="text-sm font-medium text-neutral mb-2">Légende</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Critique: &gt;3.0 µg/L (Ports militaires/industriels)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                <span>Élevé: 2.0-3.0 µg/L (Zones portuaires/industrielles)</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <span>Modéré: 1.0-2.0 µg/L (Rejets urbains/stations)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span>Faible: &lt;1.0 µg/L (Zones traitées/offshore)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
