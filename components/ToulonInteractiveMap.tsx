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
  Droplets, 
  Shield,
  Eye,
  Zap,
  Info
} from 'lucide-react'
import { 
  toulonStations, 
  toulonPollutionZones, 
  toulonEnvironmentalSites,
  WastewaterStation,
  PollutionZone,
  EnvironmentalSite
} from '@/data/toulonStations'

interface ToulonInteractiveMapProps {
  className?: string
}

interface SelectedFeature {
  type: 'station' | 'zone' | 'site'
  data: WastewaterStation | PollutionZone | EnvironmentalSite
}

export function ToulonInteractiveMap({ className }: ToulonInteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null)
  const [showStations, setShowStations] = useState(true)
  const [showZones, setShowZones] = useState(true)
  const [showSites, setShowSites] = useState(true)
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

    import('leaflet').then((L) => {
      // Clean up existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      if (mapRef.current) {
        mapRef.current.innerHTML = ''
      }

      // Create map centered on Toulon
      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true
      }).setView([43.1242, 5.9280], 12)
      
      mapInstanceRef.current = map

      // High resolution satellite tiles
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri',
        maxZoom: 18
      }).addTo(map)

      // Add labels overlay
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', {
        opacity: 0.7,
        subdomains: 'abcd',
        maxZoom: 18
      }).addTo(map)

      // Function to get pollution zone color
      const getZoneColor = (level: string) => {
        switch (level) {
          case 'critical': return '#dc2626' // Red
          case 'high': return '#ea580c' // Orange
          case 'medium': return '#ca8a04' // Yellow
          case 'low': return '#16a34a' // Green
          default: return '#6b7280' // Gray
        }
      }

      // Function to get station color
      const getStationColor = (level: string) => {
        switch (level) {
          case 'high': return '#dc2626'
          case 'medium': return '#ea580c'
          case 'low': return '#16a34a'
          default: return '#6b7280'
        }
      }

      // Add pollution zones with gradient effect
      if (showZones) {
        toulonPollutionZones.forEach((zone) => {
          const color = getZoneColor(zone.pollutionLevel)
          
          // Create multiple circles for gradient effect
          const radiusSteps = [
            { radius: zone.radius * 1000 * 1.5, opacity: 0.1 },
            { radius: zone.radius * 1000 * 1.2, opacity: 0.15 },
            { radius: zone.radius * 1000, opacity: 0.25 },
            { radius: zone.radius * 1000 * 0.7, opacity: 0.35 },
            { radius: zone.radius * 1000 * 0.4, opacity: 0.45 }
          ]

          radiusSteps.forEach((step, index) => {
            L.circle(zone.center, {
              radius: step.radius,
              fillColor: color,
              color: index === radiusSteps.length - 1 ? color : 'transparent',
              weight: index === radiusSteps.length - 1 ? 2 : 0,
              opacity: step.opacity,
              fillOpacity: step.opacity
            }).addTo(map)
          })

          // Add zone marker
          const zoneIcon = L.divIcon({
            html: `<div class="zone-marker" style="background-color: ${color};">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                       <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                     </svg>
                   </div>`,
            className: 'custom-zone-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })

          const zoneMarker = L.marker(zone.center, { icon: zoneIcon })
            .bindPopup(`
              <div class="text-sm p-3 bg-gray-900 text-white rounded-lg shadow-lg min-w-[250px]">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-4 h-4 rounded-full" style="background-color: ${color}"></div>
                  <div class="font-bold text-red-400">${zone.name}</div>
                </div>
                <div class="space-y-2 text-xs">
                  <div><strong>Niveau:</strong> 
                    <span style="color: ${color}; font-weight: bold;">
                      ${zone.pollutionLevel.toUpperCase()}
                    </span>
                  </div>
                  <div><strong>Rayon d'impact:</strong> ${zone.radius} km</div>
                  <div><strong>Sources:</strong> ${zone.sources.join(', ')}</div>
                  <div><strong>Polluants:</strong> ${zone.contaminants.join(', ')}</div>
                  <div class="mt-2 p-2 bg-gray-800 rounded">
                    <strong>Description:</strong><br>
                    ${zone.description}
                  </div>
                </div>
              </div>
            `)
            .on('click', () => {
              setSelectedFeature({ type: 'zone', data: zone })
            })
            .addTo(map)
        })
      }

      // Add wastewater stations with impact zones
      if (showStations) {
        toulonStations.forEach((station) => {
          const stationColor = getStationColor(station.pollutionLevel)
          
          // Station location
          const stationIcon = L.divIcon({
            html: `<div class="station-marker" style="background-color: ${stationColor};">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                       <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                     </svg>
                   </div>`,
            className: 'custom-station-icon',
            iconSize: [36, 36],
            iconAnchor: [18, 36]
          })

          // Rejection point
          const rejectionIcon = L.divIcon({
            html: `<div class="rejection-marker" style="background-color: ${stationColor};">
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                       <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                     </svg>
                   </div>`,
            className: 'custom-rejection-icon',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })

          // Impact zone around rejection point
          L.circle(station.rejectionPoint, {
            radius: station.impactRadius * 1000,
            fillColor: stationColor,
            color: stationColor,
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.2
          }).addTo(map)

          // Connection line between station and rejection point
          L.polyline([station.coordinates, station.rejectionPoint], {
            color: stationColor,
            weight: 3,
            opacity: 0.7,
            dashArray: '10, 10'
          }).addTo(map)

          // Station marker
          L.marker(station.coordinates, { icon: stationIcon })
            .bindPopup(`
              <div class="text-sm p-3 bg-gray-900 text-white rounded-lg shadow-lg min-w-[280px]">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-4 h-4 rounded-full" style="background-color: ${stationColor}"></div>
                  <div class="font-bold text-blue-400">${station.name}</div>
                </div>
                <div class="space-y-2 text-xs">
                  <div><strong>Localisation:</strong> ${station.location}</div>
                  <div><strong>Capacité:</strong> ${station.capacity.toLocaleString()} m³/jour</div>
                  <div><strong>Traitement:</strong> ${station.treatment}</div>
                  <div><strong>Impact:</strong> ${station.impactRadius} km de rayon</div>
                  <div><strong>Polluants:</strong> ${station.contaminants.join(', ')}</div>
                  <div class="mt-2 p-2 bg-gray-800 rounded">
                    <strong>Description:</strong><br>
                    ${station.description}
                  </div>
                </div>
              </div>
            `)
            .on('click', () => {
              setSelectedFeature({ type: 'station', data: station })
            })
            .addTo(map)

          // Rejection point marker
          L.marker(station.rejectionPoint, { icon: rejectionIcon })
            .bindPopup(`
              <div class="text-sm p-3 bg-gray-900 text-white rounded-lg shadow-lg">
                <div class="font-bold text-orange-400 mb-2">Point de Rejet</div>
                <div class="text-xs">
                  <div><strong>Station:</strong> ${station.name}</div>
                  <div><strong>Débit:</strong> ${station.capacity.toLocaleString()} m³/jour</div>
                  <div><strong>Zone d'impact:</strong> ${station.impactRadius} km</div>
                </div>
              </div>
            `)
            .addTo(map)
        })
      }

      // Add environmental sites
      if (showSites) {
        toulonEnvironmentalSites.forEach((site) => {
          let siteColor = '#16a34a' // Green
          if (site.status === 'moderate') siteColor = '#ca8a04' // Yellow
          if (site.status === 'poor') siteColor = '#dc2626' // Red

          let iconSvg = ''
          if (site.type === 'protected') {
            iconSvg = '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>'
          } else if (site.type === 'monitoring') {
            iconSvg = '<circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>'
          } else {
            iconSvg = '<path d="M12 2L2 7l10 5 10-5-10-5z"/>'
          }

          const siteIcon = L.divIcon({
            html: `<div class="site-marker" style="background-color: ${siteColor};">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                       ${iconSvg}
                     </svg>
                   </div>`,
            className: 'custom-site-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          })

          L.marker(site.coordinates, { icon: siteIcon })
            .bindPopup(`
              <div class="text-sm p-3 bg-gray-900 text-white rounded-lg shadow-lg min-w-[200px]">
                <div class="flex items-center space-x-2 mb-2">
                  <div class="w-4 h-4 rounded-full" style="background-color: ${siteColor}"></div>
                  <div class="font-bold text-green-400">${site.name}</div>
                </div>
                <div class="space-y-1 text-xs">
                  <div><strong>Type:</strong> ${site.type}</div>
                  <div><strong>État:</strong> 
                    <span style="color: ${siteColor}; font-weight: bold;">
                      ${site.status.toUpperCase()}
                    </span>
                  </div>
                  <div class="mt-2 p-2 bg-gray-800 rounded">
                    ${site.description}
                  </div>
                </div>
              </div>
            `)
            .on('click', () => {
              setSelectedFeature({ type: 'site', data: site })
            })
            .addTo(map)
        })
      }

      // Add controls
      L.control.zoom({ position: 'topright' }).addTo(map)
      L.control.scale({ position: 'bottomright', metric: true, imperial: false }).addTo(map)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [showStations, showZones, showSites])

  const getPollutionLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Waves className="h-5 w-5 text-blue-400" />
            <span>Carte Interactive - Pollution Marine Toulon</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Données réelles 2024
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Layer Controls */}
        <div className="flex flex-wrap gap-2 p-3 bg-gray-800/50 rounded-lg">
          <Button
            variant={showStations ? "default" : "outline"}
            size="sm"
            onClick={() => setShowStations(!showStations)}
            className="flex items-center space-x-1"
          >
            <Factory className="h-4 w-4" />
            <span>Stations d'épuration</span>
          </Button>
          <Button
            variant={showZones ? "default" : "outline"}
            size="sm"
            onClick={() => setShowZones(!showZones)}
            className="flex items-center space-x-1"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Zones polluées</span>
          </Button>
          <Button
            variant={showSites ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSites(!showSites)}
            className="flex items-center space-x-1"
          >
            <Shield className="h-4 w-4" />
            <span>Sites environnementaux</span>
          </Button>
        </div>

        {/* Interactive Map */}
        <div 
          ref={mapRef} 
          className={`w-full rounded-lg overflow-hidden border border-gray-600/50 ${
            isMobile ? 'h-96' : 'h-[600px]'
          }`}
          style={{ background: '#1e3a8a' }}
        />
        
        {/* Legend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-lg">
          <div>
            <h4 className="text-sm font-medium text-neutral mb-2 flex items-center">
              <Factory className="h-4 w-4 mr-1" />
              Stations d'épuration
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Pollution élevée</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Pollution modérée</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Pollution faible</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-neutral mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Zones de pollution
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span>Critique</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                <span>Élevée</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <span>Modérée</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-neutral mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              Sites environnementaux
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <Shield className="h-3 w-3 text-green-500" />
                <span>Zone protégée</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-3 w-3 text-blue-500" />
                <span>Station de surveillance</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span>Zone sensible</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Feature Details */}
        {selectedFeature && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {selectedFeature.type === 'station' && <Factory className="h-5 w-5 text-blue-400" />}
                {selectedFeature.type === 'zone' && <AlertTriangle className="h-5 w-5 text-red-400" />}
                {selectedFeature.type === 'site' && <Shield className="h-5 w-5 text-green-400" />}
                <h4 className="font-medium text-blue-400">{selectedFeature.data.name}</h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFeature(null)}
                className="text-neutral/70 hover:text-neutral"
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-2 text-sm">
              {selectedFeature.type === 'station' && (
                <div className="space-y-2">
                  <div><strong>Capacité:</strong> {(selectedFeature.data as WastewaterStation).capacity.toLocaleString()} m³/jour</div>
                  <div><strong>Traitement:</strong> {(selectedFeature.data as WastewaterStation).treatment}</div>
                  <div><strong>Impact:</strong> {(selectedFeature.data as WastewaterStation).impactRadius} km de rayon</div>
                  <div><strong>Polluants:</strong> {(selectedFeature.data as WastewaterStation).contaminants.join(', ')}</div>
                </div>
              )}
              
              {selectedFeature.type === 'zone' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <strong>Niveau:</strong>
                    <Badge className={getPollutionLevelColor((selectedFeature.data as PollutionZone).pollutionLevel)}>
                      {(selectedFeature.data as PollutionZone).pollutionLevel.toUpperCase()}
                    </Badge>
                  </div>
                  <div><strong>Sources:</strong> {(selectedFeature.data as PollutionZone).sources.join(', ')}</div>
                  <div><strong>Polluants:</strong> {(selectedFeature.data as PollutionZone).contaminants.join(', ')}</div>
                </div>
              )}
              
              {selectedFeature.type === 'site' && (
                <div className="space-y-2">
                  <div><strong>Type:</strong> {(selectedFeature.data as EnvironmentalSite).type}</div>
                  <div className="flex items-center space-x-2">
                    <strong>État:</strong>
                    <Badge variant="outline">
                      {(selectedFeature.data as EnvironmentalSite).status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              )}
              
              <div className="mt-3 p-3 bg-gray-800/50 rounded text-xs">
                <strong>Description:</strong><br />
                {selectedFeature.data.description}
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{toulonStations.length}</div>
            <div className="text-xs text-neutral/70">Stations d'épuration</div>
          </div>
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{toulonPollutionZones.length}</div>
            <div className="text-xs text-neutral/70">Zones polluées</div>
          </div>
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{toulonEnvironmentalSites.length}</div>
            <div className="text-xs text-neutral/70">Sites surveillés</div>
          </div>
          <div className="p-3 bg-gray-800/30 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {toulonStations.reduce((sum, station) => sum + station.capacity, 0).toLocaleString()}
            </div>
            <div className="text-xs text-neutral/70">m³/jour traités</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
