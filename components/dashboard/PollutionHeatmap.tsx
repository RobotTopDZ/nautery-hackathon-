'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Waves, AlertTriangle, CheckCircle } from 'lucide-react'
import { Region } from '@/components/RegionSelector'

interface HeatmapData {
  lat: number
  lng: number
  concentration: number
  molecule: string
  location: string
  region: string
}

interface PollutionHeatmapProps {
  data: HeatmapData[]
  selectedRegion?: Region | null
  className?: string
}

// Helper function to determine heatmap color based on intensity
function getHeatmapColor(intensity: number): string {
  if (intensity < 0.2) return '#22c55e' // Green - Low pollution
  if (intensity < 0.4) return '#84cc16' // Light green
  if (intensity < 0.6) return '#eab308' // Yellow - Medium pollution
  if (intensity < 0.8) return '#f97316' // Orange - High pollution
  return '#ef4444' // Red - Very high pollution
}

// Generate regional pollution data based on selected region
function generateRegionalData(region: Region): HeatmapData[] {
  const baseData: HeatmapData[] = []
  const [baseLat, baseLng] = region.coordinates
  
  // Generate realistic pollution hotspots around the region
  const hotspots = [
    { offset: [0, 0], intensity: 0.8, name: 'Port Principal' },
    { offset: [0.02, 0.01], intensity: 0.6, name: 'Zone Industrielle' },
    { offset: [-0.01, 0.02], intensity: 0.4, name: 'Centre Ville' },
    { offset: [0.03, -0.01], intensity: 0.7, name: 'Raffinerie' },
    { offset: [-0.02, -0.02], intensity: 0.3, name: 'Zone Résidentielle' },
    { offset: [0.01, -0.03], intensity: 0.5, name: 'Terminal Pétrolier' },
    { offset: [-0.03, 0.01], intensity: 0.2, name: 'Plage Nord' },
    { offset: [0.02, 0.03], intensity: 0.9, name: 'Décharge Marine' }
  ]

  const molecules = ['Mercure', 'Plomb', 'Cadmium', 'Cuivre', 'Zinc', 'Hydrocarbures']

  hotspots.forEach((hotspot, index) => {
    const lat = baseLat + hotspot.offset[0]
    const lng = baseLng + hotspot.offset[1]
    const concentration = hotspot.intensity * 2.5 // Convert to ng/L
    
    baseData.push({
      lat,
      lng,
      concentration,
      molecule: molecules[index % molecules.length],
      location: hotspot.name,
      region: region.name
    })
  })

  return baseData
}

export function PollutionHeatmap({ data, selectedRegion, className }: PollutionHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [selectedPoint, setSelectedPoint] = useState<HeatmapData | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [mapData, setMapData] = useState<HeatmapData[]>(data)

  // Update map data when region changes
  useEffect(() => {
    if (selectedRegion) {
      const regionalData = generateRegionalData(selectedRegion)
      setMapData(regionalData)
    } else {
      setMapData(data)
    }
  }, [selectedRegion, data])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // This effect recreates the map whenever the region changes
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Get the data to display
    const mapData = selectedRegion ? generateRegionalData(selectedRegion) : data

    // Dynamic import for client-side only
    import('leaflet').then((L) => {
      // Clean up existing map completely
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      // Clear container
      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }

      // Determine map center and zoom based on selected region
      const center: [number, number] = selectedRegion ? selectedRegion.coordinates : [43.1242, 5.9280]
      const zoom = selectedRegion ? selectedRegion.zoom : (isMobile ? 4 : 5)

      // Create new map
      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false
      }).setView(center, zoom)
      
      mapInstanceRef.current = map

      // Add dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map)

      // Add interactive heatmap markers
      mapData.forEach((point, index) => {
        const intensity = Math.min(point.concentration / 2.5, 1) // Normalize to 0-1
        const color = getHeatmapColor(intensity)
        const radius = Math.max(6, intensity * 30)

        // Create pulsing effect for high pollution areas
        const isPulse = intensity > 0.7
        
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: radius,
          fillColor: color,
          color: intensity > 0.6 ? '#ffffff' : color,
          weight: isPulse ? 3 : 2,
          opacity: 0.9,
          fillOpacity: intensity > 0.5 ? 0.8 : 0.6,
          className: isPulse ? 'pulse-marker' : ''
        }).bindPopup(`
          <div class="text-sm p-3 bg-gray-900 text-white rounded-lg shadow-lg">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-3 h-3 rounded-full" style="background-color: ${color}"></div>
              <div class="font-bold text-blue-400">${point.molecule}</div>
            </div>
            <div class="space-y-1">
              <div><strong>Localisation:</strong> ${point.location}</div>
              <div><strong>Région:</strong> ${point.region}</div>
              <div><strong>Concentration:</strong> ${point.concentration.toFixed(3)} ng/L</div>
              <div><strong>Niveau:</strong> <span style="color: ${color}">${intensity > 0.8 ? 'Critique' : intensity > 0.6 ? 'Élevé' : intensity > 0.4 ? 'Modéré' : 'Faible'}</span></div>
            </div>
          </div>
        `, {
          className: 'custom-popup',
          maxWidth: 300
        })

        marker.on('click', () => {
          setSelectedPoint(point)
        })

        // Add hover effects
        marker.on('mouseover', function(this: any) {
          this.setStyle({
            weight: 4,
            opacity: 1
          })
        })

        marker.on('mouseout', function(this: any) {
          this.setStyle({
            weight: 2,
            opacity: 0.7
          })
        })

        marker.addTo(map)
      })

      // Add custom zoom controls
      const zoomControl = new L.Control({ position: isMobile ? 'bottomright' : 'topright' })
      zoomControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'custom-zoom-control')
        div.innerHTML = `
          <div class="flex flex-col space-y-1 bg-gray-800/90 backdrop-blur-sm rounded-lg p-1">
            <button class="zoom-in-btn p-2 text-white hover:bg-blue-500 rounded transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
                <line x1="11" y1="8" x2="11" y2="14"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button class="zoom-out-btn p-2 text-white hover:bg-blue-500 rounded transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
            </button>
            <button class="reset-btn p-2 text-white hover:bg-green-500 rounded transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
            </button>
          </div>
        `
        
        // Add event listeners
        div.querySelector('.zoom-in-btn')?.addEventListener('click', () => map.zoomIn())
        div.querySelector('.zoom-out-btn')?.addEventListener('click', () => map.zoomOut())
        div.querySelector('.reset-btn')?.addEventListener('click', () => map.setView(center, zoom))
        
        return div
      }
      zoomControl.addTo(map)
    })

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [mapData, selectedRegion, isMobile])

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Waves className="h-5 w-5 text-blue-400" />
            <span>Carte de Pollution Marine</span>
          </div>
          <div className="text-sm text-neutral/70">
            {data.length} points de mesure
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          ref={mapRef} 
          className={`w-full rounded-lg overflow-hidden border border-gray-600/50 ${
            isMobile ? 'h-64' : 'h-96'
          }`}
          style={{ background: '#0A2342' }}
        />
        
        {/* Interactive Legend */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neutral">Légende des Niveaux</h4>
            {selectedPoint && (
              <button 
                onClick={() => setSelectedPoint(null)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Effacer sélection
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center space-x-2 p-2 rounded bg-green-500/20">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Faible (&lt;0.6 ng/L)</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded bg-yellow-500/20">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Modéré (0.6-1.2 ng/L)</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded bg-red-500/20">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Élevé (&gt;1.2 ng/L)</span>
            </div>
          </div>
        </div>

        {/* Selected Point Details */}
        {selectedPoint && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-blue-400">{selectedPoint.molecule}</h4>
                <p className="text-sm text-neutral/70 mt-1">{selectedPoint.location}, {selectedPoint.region}</p>
                <p className="text-lg font-bold mt-2">{selectedPoint.concentration.toFixed(3)} ng/L</p>
              </div>
              <div className="flex items-center space-x-1">
                {selectedPoint.concentration > 1.2 ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : selectedPoint.concentration > 0.6 ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {data.length === 0 && (
          <div className="text-center py-8 text-neutral/50">
            <Waves className="h-12 w-12 mx-auto mb-2 text-blue-400" />
            <p>Aucune donnée de pollution disponible</p>
            <p className="text-xs">Les mesures apparaîtront ici une fois collectées</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
