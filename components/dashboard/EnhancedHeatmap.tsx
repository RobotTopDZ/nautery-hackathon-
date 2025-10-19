'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Waves, AlertTriangle } from 'lucide-react'
import { Region } from '@/components/RegionSelector'

interface HeatmapData {
  lat: number
  lng: number
  concentration: number
  molecule: string
  location: string
  region: string
}

interface EnhancedHeatmapProps {
  data: HeatmapData[]
  selectedRegion?: Region | null
  className?: string
}

// Generate regional pollution data with more realistic spread
function generateRegionalData(region: Region): HeatmapData[] {
  const baseData: HeatmapData[] = []
  const [baseLat, baseLng] = region.coordinates
  
  // More realistic pollution distribution around coastal areas
  const pollutionSources = [
    // Port area - highest pollution
    { offset: [0, 0], intensity: 0.9, name: 'Port Principal', molecule: 'Hydrocarbures' },
    { offset: [0.005, 0.005], intensity: 0.85, name: 'Terminal Pétrolier', molecule: 'Hydrocarbures' },
    
    // Industrial zones
    { offset: [0.015, 0.008], intensity: 0.75, name: 'Zone Industrielle', molecule: 'Métaux lourds' },
    { offset: [0.012, -0.010], intensity: 0.70, name: 'Raffinerie', molecule: 'Produits chimiques' },
    
    // Urban runoff
    { offset: [-0.008, 0.015], intensity: 0.45, name: 'Centre Ville', molecule: 'Eaux usées' },
    { offset: [-0.015, -0.008], intensity: 0.40, name: 'Zone Résidentielle', molecule: 'Nutriments' },
    
    // Coastal areas - lower pollution
    { offset: [-0.020, 0.005], intensity: 0.25, name: 'Plage Nord', molecule: 'Microplastiques' },
    { offset: [0.008, -0.025], intensity: 0.30, name: 'Baie Sud', molecule: 'Sédiments' },
    
    // Offshore - cleanest areas
    { offset: [0.030, 0.020], intensity: 0.15, name: 'Zone Offshore', molecule: 'Traces' },
    { offset: [-0.025, 0.030], intensity: 0.12, name: 'Haute Mer', molecule: 'Traces' },
    
    // Additional hotspots for variety
    { offset: [0.020, -0.015], intensity: 0.60, name: 'Décharge Marine', molecule: 'Déchets toxiques' },
    { offset: [-0.012, -0.020], intensity: 0.35, name: 'Marina', molecule: 'Carburants' }
  ]

  pollutionSources.forEach((source) => {
    const lat = baseLat + source.offset[0]
    const lng = baseLng + source.offset[1]
    const concentration = source.intensity * 3.0 // Scale to realistic ng/L values
    
    baseData.push({
      lat,
      lng,
      concentration,
      molecule: source.molecule,
      location: source.name,
      region: region.name
    })
  })

  return baseData
}

export function EnhancedHeatmap({ data, selectedRegion, className }: EnhancedHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [selectedPoint, setSelectedPoint] = useState<HeatmapData | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    const mapData = selectedRegion ? generateRegionalData(selectedRegion) : data

    import('leaflet').then((L) => {
      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }

      // Map center and zoom
      const center: [number, number] = selectedRegion ? selectedRegion.coordinates : [43.1242, 5.9280]
      const zoom = selectedRegion ? Math.max(selectedRegion.zoom, 11) : (isMobile ? 4 : 5)

      // Create map with better ocean visualization
      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true
      }).setView(center, zoom)
      
      mapInstanceRef.current = map

      // Use satellite/ocean tiles for better water visualization
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri &copy; Maxar',
        maxZoom: 19
      }).addTo(map)

      // Add ocean overlay for better water distinction
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png', {
        opacity: 0.3,
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map)

      // Create heatmap effect with graduated circles
      mapData.forEach((point, index) => {
        const intensity = Math.min(point.concentration / 3.0, 1)
        
        // Color based on pollution level
        let color = '#22c55e' // Green for low
        if (intensity > 0.7) color = '#ef4444' // Red for high
        else if (intensity > 0.5) color = '#f97316' // Orange for medium-high
        else if (intensity > 0.3) color = '#eab308' // Yellow for medium
        else if (intensity > 0.1) color = '#84cc16' // Light green for low-medium

        const radius = Math.max(8, intensity * 40)
        
        // Create multiple circles for heatmap effect
        const circles = [
          { radius: radius * 1.5, opacity: 0.1 },
          { radius: radius * 1.2, opacity: 0.2 },
          { radius: radius, opacity: 0.6 }
        ]

        circles.forEach((circle, i) => {
          L.circleMarker([point.lat, point.lng], {
            radius: circle.radius,
            fillColor: color,
            color: i === circles.length - 1 ? '#ffffff' : color,
            weight: i === circles.length - 1 ? 2 : 0,
            opacity: circle.opacity,
            fillOpacity: circle.opacity
          }).addTo(map)
        })

        // Main interactive marker
        const mainMarker = L.circleMarker([point.lat, point.lng], {
          radius: 6,
          fillColor: '#ffffff',
          color: color,
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9
        }).bindPopup(`
          <div class="text-sm p-3 bg-gray-900 text-white rounded-lg shadow-lg min-w-[200px]">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-4 h-4 rounded-full border-2 border-white" style="background-color: ${color}"></div>
              <div class="font-bold text-blue-400">${point.molecule}</div>
            </div>
            <div class="space-y-1 text-xs">
              <div><strong>Localisation:</strong> ${point.location}</div>
              <div><strong>Région:</strong> ${point.region}</div>
              <div><strong>Concentration:</strong> ${point.concentration.toFixed(2)} ng/L</div>
              <div><strong>Niveau:</strong> 
                <span style="color: ${color}; font-weight: bold;">
                  ${intensity > 0.7 ? 'CRITIQUE' : intensity > 0.5 ? 'ÉLEVÉ' : intensity > 0.3 ? 'MODÉRÉ' : 'FAIBLE'}
                </span>
              </div>
            </div>
          </div>
        `, {
          className: 'custom-popup',
          maxWidth: 250
        })

        mainMarker.on('click', () => {
          setSelectedPoint(point)
        })

        mainMarker.addTo(map)
      })

      // Add zoom controls
      L.control.zoom({ position: isMobile ? 'bottomleft' : 'topright' }).addTo(map)

      // Add scale
      L.control.scale({ position: 'bottomright', metric: true, imperial: false }).addTo(map)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [selectedRegion, data, isMobile])

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Waves className="h-5 w-5 text-blue-400" />
            <span>Analyse Spatiale de Pollution</span>
          </div>
          <div className="text-sm text-neutral/70">
            {selectedRegion ? `${selectedRegion.name} - ${selectedRegion.country}` : `${data.length} points`}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={mapRef} 
          className={`w-full rounded-lg overflow-hidden border border-gray-600/50 ${
            isMobile ? 'h-80' : 'h-[500px]'
          }`}
          style={{ background: '#1e3a8a' }}
        />
        
        {/* Enhanced Legend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neutral">Niveaux de Pollution Marine</h4>
            {selectedPoint && (
              <button 
                onClick={() => setSelectedPoint(null)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Effacer sélection
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center space-x-2 p-2 rounded bg-green-500/20 border border-green-500/30">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Faible (&lt;0.9 ng/L)</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded bg-yellow-500/20 border border-yellow-500/30">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Modéré (0.9-1.5 ng/L)</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded bg-orange-500/20 border border-orange-500/30">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Élevé (1.5-2.1 ng/L)</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded bg-red-500/20 border border-red-500/30">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Critique (&gt;2.1 ng/L)</span>
            </div>
          </div>
        </div>

        {/* Selected Point Details */}
        {selectedPoint && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-blue-400">{selectedPoint.molecule}</h4>
                <p className="text-sm text-neutral/70 mt-1">{selectedPoint.location}</p>
                <p className="text-xs text-neutral/60">{selectedPoint.region}</p>
                <div className="mt-2 flex items-center space-x-4">
                  <div>
                    <span className="text-xs text-neutral/70">Concentration</span>
                    <p className="text-lg font-bold text-primary">{selectedPoint.concentration.toFixed(2)} ng/L</p>
                  </div>
                  <div>
                    <span className="text-xs text-neutral/70">Niveau</span>
                    <p className="text-sm font-medium">
                      {selectedPoint.concentration > 2.1 ? 'CRITIQUE' : 
                       selectedPoint.concentration > 1.5 ? 'ÉLEVÉ' : 
                       selectedPoint.concentration > 0.9 ? 'MODÉRÉ' : 'FAIBLE'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {selectedPoint.concentration > 2.1 ? (
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                ) : (
                  <MapPin className="h-6 w-6 text-blue-400" />
                )}
              </div>
            </div>
          </div>
        )}

        {selectedRegion && (
          <div className="text-center text-xs text-neutral/60">
            Vue satellite avec superposition des données de pollution pour {selectedRegion.name}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
