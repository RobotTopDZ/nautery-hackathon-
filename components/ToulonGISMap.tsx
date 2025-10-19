'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, Waves, Factory, Droplets, Navigation, Target, Layers, Satellite, Map as MapIcon
} from 'lucide-react'

// Données géographiques avec coordonnées réelles des points de rejet
const toulonStations = [
  {
    id: 'cap-sicie',
    name: 'Station CAP SICIÉ - AMPHITRIA',
    coords: [43.0645, 5.8123], // Station sur terre
    capacity: 35000,
    efficiency: 95,
    rejectionPoint: [43.0488707588, 5.850754425619892], // COORDONNÉES RÉELLES
    pollutants: ['Résidus pharmaceutiques: traces', 'Microplastiques: <0.1 mg/L'],
    level: 'low',
    baseConcentration: 0.8
  },
  {
    id: 'la-garde',
    name: 'Station LA GARDE PONT DE LA CLUE',
    coords: [43.1089, 5.9234], // Station sur terre
    capacity: 120000,
    efficiency: 85,
    rejectionPoint: [43.088933513, 5.986681139241], // COORDONNÉES RÉELLES
    pollutants: ['Azote: 15 mg/L', 'Phosphore: 2 mg/L', 'Matières organiques: 25 mg/L'],
    level: 'medium',
    baseConcentration: 3.2
  },
  {
    id: 'gapeau',
    name: 'Station LA CRAU VALLEE DU GAPEAU',
    coords: [43.1447221801295, 6.09169363975525], // COORDONNÉES RÉELLES CORRIGÉES
    capacity: 45000,
    efficiency: 80,
    rejectionPoint: [43.14518403433659, 6.0921143363889385], // DANS LA RIVIÈRE GAPEAU
    riverPath: [ // Tracé de la rivière Gapeau jusqu'à la mer
      [43.14518403433659, 6.0921143363889385], // Point de rejet dans rivière
      [43.1423, 6.0956],
      [43.1398, 6.0989],
      [43.1367, 6.1023],
      [43.1334, 6.1067],
      [43.1298, 6.1123],
      [43.1256, 6.1189],
      [43.1198, 6.1267],
      [43.1134, 6.1356],
      [43.1067, 6.1445],
      [43.0989, 6.1534] // Embouchure en mer Méditerranée
    ],
    seaRejectionPoint: [43.0989, 6.1534], // Point final en mer
    pollutants: ['Nitrates: 25 mg/L', 'Phosphates: 3 mg/L', 'Pesticides: traces'],
    level: 'medium',
    baseConcentration: 1.9
  },
  {
    id: 'almanarre',
    name: 'Station ALMANARRE',
    coords: [43.0756, 6.0923], // Station sur terre
    capacity: 28000,
    efficiency: 70,
    rejectionPoint: [43.078633267379644, 6.1002445220947275], // COORDONNÉES RÉELLES
    pollutants: ['Métaux lourds: 0.5 mg/L', 'Hydrocarbures: 2 mg/L', 'Détergents: 8 mg/L'],
    level: 'high',
    baseConcentration: 3.1
  }
]

// Données temporelles pour simulation
const timeSlots = [
  { id: '2024-01', label: 'Janvier 2024', multiplier: 0.3, windDirection: 45, windSpeed: 15, concentrationLevel: 'low' as const },
  { id: '2024-04', label: 'Avril 2024', multiplier: 0.9, windDirection: 180, windSpeed: 12, concentrationLevel: 'medium' as const },
  { id: '2024-07', label: 'Juillet 2024', multiplier: 0.7, windDirection: 315, windSpeed: 8, concentrationLevel: 'low' as const },
  { id: '2024-10', label: 'Octobre 2024', multiplier: 1.0, windDirection: 90, windSpeed: 18, concentrationLevel: 'medium' as const },
  { id: '2024-12', label: 'Décembre 2024', multiplier: 1.6, windDirection: 225, windSpeed: 22, concentrationLevel: 'high' as const }
]

const pollutionZones = [
  {
    id: 'port-militaire',
    name: 'Arsenal de Toulon',
    center: [43.1167, 5.9289],
    baseConcentration: 4.5,
    radius: 2000,
    levels: {
      low: { concentration: 2.1, color: '#10b981' },
      medium: { concentration: 3.8, color: '#f59e0b' },
      high: { concentration: 4.5, color: '#dc2626' }
    }
  }
]

interface ToulonGISMapProps {
  className?: string
}

export function ToulonGISMap({ className }: ToulonGISMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const layersRef = useRef<any>({})
  
  const [selectedStation, setSelectedStation] = useState<any>(null)
  const [selectedZone, setSelectedZone] = useState<any>(null)
  const [clickedPoint, setClickedPoint] = useState<any>(null)
  const [showStations, setShowStations] = useState(true)
  const [showPollution, setShowPollution] = useState(true)
  const [showPipelines, setShowPipelines] = useState(true)
  const [showRejectionDispersion, setShowRejectionDispersion] = useState(true)
  const [mapStyle, setMapStyle] = useState('satellite')
  const [currentTimeSlot, setCurrentTimeSlot] = useState(timeSlots[4]) // Décembre 2024 par défaut
  const [concentrationLevel, setConcentrationLevel] = useState<'low' | 'medium' | 'high'>('medium')
  const [showWindEffect, setShowWindEffect] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (!mapRef.current) return

    // Dynamically import Leaflet
    import('leaflet').then((L) => {
      // If a map instance already exists, do not re-initialize
      if (mapInstanceRef.current) return

      // In case of Fast Refresh/HMR, Leaflet may have already attached to the container
      const container: any = mapRef.current
      if (container && container._leaflet_id) {
        try {
          // Reset the container so Leaflet can initialize cleanly
          container._leaflet_id = undefined
          container.innerHTML = ''
        } catch {}
      }

      // Initialize map
      const map = L.map(mapRef.current!, {
        center: [43.1167, 5.9289], // Centré sur Toulon
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true
      })

      mapInstanceRef.current = map

      // Add tile layers
      const tileLayers = {
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }),
        street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }),
        terrain: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
      }

      // Add default layer
      tileLayers[mapStyle as keyof typeof tileLayers].addTo(map)
      layersRef.current.baseLayer = tileLayers[mapStyle as keyof typeof tileLayers]

      // Initialize layer groups
      layersRef.current.stationsGroup = L.layerGroup().addTo(map)
      layersRef.current.pollutionGroup = L.layerGroup().addTo(map)
      layersRef.current.pipelinesGroup = L.layerGroup().addTo(map)

      updateLayers(L)

      // Gestionnaire de clic sur la carte pour prédiction
      map.on('click', (e: any) => {
        const lat = e.latlng.lat
        const lng = e.latlng.lng
        const prediction = predictConcentration(lat, lng)
        
        setClickedPoint({
          coords: [lat, lng],
          prediction: prediction
        })
      })

      return () => {
        try { map.remove() } catch {}
        mapInstanceRef.current = null
      }
    })
  }, [])

  useEffect(() => {
    // Ajouter les styles CSS pour les popups modernes
    const style = document.createElement('style')
    style.textContent = `
      .modern-popup-container .leaflet-popup-content-wrapper {
        background: transparent !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      .modern-popup-container .leaflet-popup-content {
        margin: 0 !important;
        padding: 0 !important;
      }
      .modern-popup-container .leaflet-popup-tip {
        background: white !important;
        border: none !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
      }
      .modern-popup {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `
    document.head.appendChild(style)

    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        if (mapRef.current && !mapInstanceRef.current) {
          updateLayers(L)
        }
      })
    }
  }, [showStations, showPollution, showPipelines, showRejectionDispersion, currentTimeSlot, concentrationLevel, showWindEffect])

  // Fonction pour calculer la distance entre deux points GPS
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000 // Rayon de la Terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Créer dispersion affectée par le vent
  const createWindAffectedDispersion = (L: any, zone: any, currentLevel: any, timeSlot: any) => {
    const windDirection = timeSlot.windDirection * Math.PI / 180 // Convertir en radians
    const windSpeed = timeSlot.windSpeed
    
    // Créer plusieurs ellipses pour simuler la dispersion réaliste
    const dispersionLayers = [
      { distance: 300, opacity: 0.8, stretch: 1.0 },
      { distance: 600, opacity: 0.6, stretch: 1.3 },
      { distance: 1000, opacity: 0.4, stretch: 1.6 },
      { distance: 1500, opacity: 0.25, stretch: 2.0 },
      { distance: 2000, opacity: 0.15, stretch: 2.5 }
    ]
    
    dispersionLayers.forEach((layer, index) => {
      // Calculer le décalage dû au vent
      const windOffset = (windSpeed / 20) * layer.stretch * 200 // Plus le vent est fort, plus le décalage est important
      const offsetLat = Math.cos(windDirection) * windOffset / 111000 // Conversion mètres vers degrés
      const offsetLng = Math.sin(windDirection) * windOffset / (111000 * Math.cos(zone.center[0] * Math.PI / 180))
      
      const ellipseCenter = [
        zone.center[0] + offsetLat,
        zone.center[1] + offsetLng
      ]
      
      // Créer ellipse avec étirement selon le vent
      const radiusA = layer.distance
      const radiusB = layer.distance / layer.stretch
      
      // Créer plusieurs points pour former une ellipse irrégulière
      const ellipsePoints = []
      const numPoints = 32
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI
        
        // Ajouter irrégularité naturelle
        const irregularity = 0.85 + Math.random() * 0.3 // Variation de 0.85 à 1.15
        
        const x = radiusA * Math.cos(angle) * irregularity
        const y = radiusB * Math.sin(angle) * irregularity
        
        // Rotation selon la direction du vent
        const rotatedX = x * Math.cos(windDirection) - y * Math.sin(windDirection)
        const rotatedY = x * Math.sin(windDirection) + y * Math.cos(windDirection)
        
        const pointLat = ellipseCenter[0] + rotatedX / 111000
        const pointLng = ellipseCenter[1] + rotatedY / (111000 * Math.cos(zone.center[0] * Math.PI / 180))
        
        ellipsePoints.push([pointLat, pointLng])
      }
      
      const polygon = L.polygon(ellipsePoints, {
        fillColor: currentLevel.color,
        color: 'transparent',
        fillOpacity: layer.opacity * 0.7,
        weight: 0
      })
      
      polygon.addTo(layersRef.current.pollutionGroup)
    })
  }
  
  // Créer dispersion circulaire classique
  const createCircularDispersion = (L: any, zone: any, currentLevel: any) => {
    const circularLayers = [
      { radius: 300, opacity: 0.8 },
      { radius: 600, opacity: 0.6 },
      { radius: 1000, opacity: 0.4 },
      { radius: 1500, opacity: 0.25 }
    ]
    
    circularLayers.forEach(layer => {
      const circle = L.circle(zone.center, {
        radius: layer.radius,
        fillColor: currentLevel.color,
        color: 'transparent',
        fillOpacity: layer.opacity * 0.7,
        weight: 0
      })
      circle.addTo(layersRef.current.pollutionGroup)
    })
  }

  // Obtenir la taille de dispersion selon le niveau de concentration
  const getDispersionSizeByLevel = (level: string) => {
    switch (level) {
      case 'high': return {
        maxRadius: 3500,
        layers: [
          { distance: 400, opacity: 0.9, stretch: 1.0 },
          { distance: 800, opacity: 0.7, stretch: 1.4 },
          { distance: 1400, opacity: 0.5, stretch: 1.8 },
          { distance: 2200, opacity: 0.35, stretch: 2.3 },
          { distance: 3000, opacity: 0.2, stretch: 2.8 },
          { distance: 3500, opacity: 0.1, stretch: 3.2 }
        ]
      }
      case 'medium': return {
        maxRadius: 2200,
        layers: [
          { distance: 250, opacity: 0.8, stretch: 1.0 },
          { distance: 500, opacity: 0.6, stretch: 1.3 },
          { distance: 900, opacity: 0.4, stretch: 1.7 },
          { distance: 1400, opacity: 0.25, stretch: 2.1 },
          { distance: 2200, opacity: 0.15, stretch: 2.5 }
        ]
      }
      case 'low': return {
        maxRadius: 1200,
        layers: [
          { distance: 150, opacity: 0.7, stretch: 1.0 },
          { distance: 350, opacity: 0.5, stretch: 1.2 },
          { distance: 650, opacity: 0.3, stretch: 1.5 },
          { distance: 1000, opacity: 0.2, stretch: 1.8 },
          { distance: 1200, opacity: 0.1, stretch: 2.0 }
        ]
      }
      default: return {
        maxRadius: 1500,
        layers: [
          { distance: 200, opacity: 0.6, stretch: 1.0 },
          { distance: 500, opacity: 0.4, stretch: 1.3 },
          { distance: 1000, opacity: 0.2, stretch: 1.6 },
          { distance: 1500, opacity: 0.1, stretch: 2.0 }
        ]
      }
    }
  }

  // Créer dispersion avec vent pour les stations
  const createStationWindDispersion = (L: any, station: any, timeSlot: any, dispersionConfig: any) => {
    const windDirection = timeSlot.windDirection * Math.PI / 180
    const windSpeed = timeSlot.windSpeed
    
    if (!dispersionConfig?.layers) return;
    
    dispersionConfig.layers.forEach((layer: any, index: number) => {
      // Calcul du décalage progressif dû au vent (plus fort avec la distance)
      const windStrength = (windSpeed / 15) * (layer.distance / 1000) // Intensité progressive
      const windOffset = windStrength * layer.stretch * 150
      
      // Décalage du centre de l'ellipse selon le vent
      const offsetLat = Math.cos(windDirection) * windOffset / 111000
      const offsetLng = Math.sin(windDirection) * windOffset / (111000 * Math.cos(station.center[0] * Math.PI / 180))
      
      const ellipseCenter = [
        station.center[0] + offsetLat,
        station.center[1] + offsetLng
      ]
      
      // Créer forme organique naturelle comme dispersion dans l'eau
      const ellipsePoints = []
      const numPoints = 48 + Math.floor(Math.random() * 16) // 48-64 points pour plus de fluidité
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * 2 * Math.PI
        
        // Variations naturelles multiples pour simulation aquatique
        const baseIrregularity = 0.85 + Math.random() * 0.3 // 0.85 à 1.15
        
        // Effets de courants marins (multiples fréquences)
        const currentEffect1 = Math.sin(angle * 4 + windDirection * 0.5) * 0.08 // Courant principal
        const currentEffect2 = Math.sin(angle * 8 + windDirection * 1.2) * 0.04 // Turbulences secondaires
        const currentEffect3 = Math.sin(angle * 12 + windDirection * 2.1) * 0.02 // Micro-turbulences
        
        // Effet de diffusion progressive (plus loin = plus irrégulier)
        const diffusionFactor = (layer.distance / 1000) * 0.1
        const diffusionEffect = Math.sin(angle * 6 + index) * diffusionFactor
        
        // Effet de viscosité de l'eau (lissage des variations brutales)
        const viscositySmoothing = Math.sin(angle * 2) * 0.03
        
        // Combinaison de tous les effets pour un rendu aquatique réaliste
        const irregularity = baseIrregularity + currentEffect1 + currentEffect2 + currentEffect3 + diffusionEffect + viscositySmoothing
        
        // Ellipse avec étirement selon le vent et courants
        const radiusA = layer.distance * irregularity
        const radiusB = (layer.distance / layer.stretch) * irregularity
        
        // Ajout d'une déformation asymétrique pour simuler les courants
        const asymmetryFactor = Math.sin(angle + windDirection) * 0.15
        const adjustedRadiusA = radiusA * (1 + asymmetryFactor)
        const adjustedRadiusB = radiusB * (1 - asymmetryFactor * 0.5)
        
        const x = adjustedRadiusA * Math.cos(angle)
        const y = adjustedRadiusB * Math.sin(angle)
        
        // Rotation selon la direction du vent avec effet de spirale
        const spiralEffect = (layer.distance / 2000) * Math.sin(angle * 3) * 0.1
        const effectiveWindDirection = windDirection + spiralEffect
        
        const rotatedX = x * Math.cos(effectiveWindDirection) - y * Math.sin(effectiveWindDirection)
        const rotatedY = x * Math.sin(effectiveWindDirection) + y * Math.cos(effectiveWindDirection)
        
        const pointLat = ellipseCenter[0] + rotatedX / 111000
        const pointLng = ellipseCenter[1] + rotatedY / (111000 * Math.cos(station.center[0] * Math.PI / 180))
        
        ellipsePoints.push([pointLat, pointLng])
      }
      
      // Lissage des points pour éviter les angles nets (simulation de la tension superficielle)
      const smoothedPoints = smoothPolygonPoints(ellipsePoints)
      
      // Couleur selon concentration et distance
      const concentrationFactor = station.baseConcentration * currentTimeSlot.multiplier
      const distanceFactor = 1 - (index / dispersionConfig.layers.length)
      const finalConcentration = concentrationFactor * distanceFactor
      
      // Créer un dégradé naturel avec SVG
      const gradientId = `gradient-${station.stationName?.replace(/\s+/g, '-')}-${index}`
      const svgGradient = createRadialGradient(gradientId, finalConcentration, layer.opacity)
      
      const polygon = L.polygon(smoothedPoints, {
        fillColor: getConcentrationColor(finalConcentration),
        color: getConcentrationColor(finalConcentration, 0.4),
        fillOpacity: layer.opacity * 0.7,
        weight: 0.5,
        className: `pollution-gradient-${index}`,
        smoothFactor: 2.0 // Lissage supplémentaire de Leaflet
      })
      
      // Popup moderne pour zone de dispersion avec prédiction
      const riskLevel = finalConcentration > 2.0 ? 'CRITIQUE' : finalConcentration > 1.0 ? 'ÉLEVÉ' : finalConcentration > 0.5 ? 'MODÉRÉ' : 'FAIBLE'
      const riskColor = finalConcentration > 2.0 ? '#ef4444' : finalConcentration > 1.0 ? '#f97316' : finalConcentration > 0.5 ? '#eab308' : '#22c55e'
      
      polygon.bindPopup(`
        <div class="modern-popup bg-white rounded-xl shadow-2xl border-0 p-4 min-w-[280px]">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-bold text-gray-800">Prédiction Zone</h3>
            <div class="px-3 py-1 rounded-full text-xs font-semibold text-white" style="background-color: ${riskColor}">
              ${riskLevel}
            </div>
          </div>
          
          <div class="space-y-3">
            <div class="bg-blue-50 rounded-lg p-3">
              <div class="text-sm text-gray-600 mb-1">Concentration Prédite</div>
              <div class="text-2xl font-bold text-blue-600">${finalConcentration.toFixed(2)} ng/L</div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="text-center">
                <div class="text-xs text-gray-500">Distance Source</div>
                <div class="font-semibold text-gray-800">${layer.distance}m</div>
              </div>
              <div class="text-center">
                <div class="text-xs text-gray-500">Niveau Dispersion</div>
                <div class="font-semibold text-gray-800">${index + 1}/6</div>
              </div>
            </div>
            
            <div class="border-t pt-3">
              <div class="text-xs text-gray-500 mb-2">Conditions Environnementales</div>
              <div class="flex justify-between text-sm">
                <span>Vent: ${timeSlot.windDirection}° - ${timeSlot.windSpeed} km/h</span>
              </div>
            </div>
          </div>
        </div>
      `, {
        className: 'modern-popup-container',
        maxWidth: 300,
        closeButton: true
      })
      
      polygon.addTo(layersRef.current.pollutionGroup)
    })
  }

  // Créer dispersion circulaire pour les stations
  const createStationCircularDispersion = (L: any, station: any, dispersionConfig: any) => {
    if (!dispersionConfig?.layers) return;
    
    dispersionConfig.layers.forEach((layer: any, index: number) => {
      const concentrationFactor = station.baseConcentration * currentTimeSlot.multiplier
      const distanceFactor = 1 - (index / dispersionConfig.layers.length)
      const finalConcentration = concentrationFactor * distanceFactor
      
      const circle = L.circle(station.center, {
        radius: layer.distance,
        fillColor: getConcentrationColor(finalConcentration),
        color: 'transparent',
        fillOpacity: layer.opacity * 0.7,
        weight: 0
      })
      
      circle.addTo(layersRef.current.pollutionGroup)
    })
  }

  // Obtenir couleur selon concentration réelle avec dégradé naturel
  const getConcentrationColor = (concentration: number, opacity: number = 1) => {
    let color;
    if (concentration > 4.0) color = '#dc2626' // Rouge foncé
    else if (concentration > 3.5) color = '#ef4444' // Rouge
    else if (concentration > 2.8) color = '#f97316' // Orange foncé  
    else if (concentration > 2.2) color = '#fb923c' // Orange
    else if (concentration > 1.8) color = '#fbbf24' // Jaune foncé
    else if (concentration > 1.2) color = '#fde047' // Jaune
    else if (concentration > 0.8) color = '#84cc16' // Vert clair
    else if (concentration > 0.4) color = '#22c55e' // Vert
    else color = '#06b6d4' // Bleu (très faible)
    
    if (opacity !== 1) {
      // Convertir hex en rgba pour l'opacité
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return color
  }

  // Créer un dégradé radial pour un effet plus naturel
  const createRadialGradient = (id: string, concentration: number, opacity: number) => {
    const centerColor = getConcentrationColor(concentration, opacity * 0.8)
    const edgeColor = getConcentrationColor(concentration * 0.3, opacity * 0.2)
    return `radial-gradient(circle, ${centerColor} 0%, ${edgeColor} 70%, transparent 100%)`
  }

  // Fonction de lissage des points pour éviter les angles nets (simulation tension superficielle)
  const smoothPolygonPoints = (points: number[][]) => {
    if (points.length < 3) return points
    
    const smoothedPoints = []
    const smoothingFactor = 0.3 // Intensité du lissage
    
    for (let i = 0; i < points.length; i++) {
      const prevIndex = (i - 1 + points.length) % points.length
      const nextIndex = (i + 1) % points.length
      
      const current = points[i]
      const prev = points[prevIndex]
      const next = points[nextIndex]
      
      // Lissage par moyenne pondérée avec les points adjacents
      const smoothedLat = current[0] * (1 - smoothingFactor) + 
                         (prev[0] + next[0]) * smoothingFactor * 0.5
      const smoothedLng = current[1] * (1 - smoothingFactor) + 
                         (prev[1] + next[1]) * smoothingFactor * 0.5
      
      smoothedPoints.push([smoothedLat, smoothedLng])
    }
    
    return smoothedPoints
  }

  // Fonction pour prédire la concentration en un point avec dégradé continu
  const predictConcentration = (lat: number, lon: number) => {
    let totalConcentration = 0
    let influences: Array<{source: string, distance: number, influence: string, level: string, contribution: number}> = []

    // Influence des points de rejet avec dégradé continu
    toulonStations.forEach(station => {
      let rejectionPoint = station.rejectionPoint
      
      if (station.id === 'gapeau' && station.seaRejectionPoint) {
        rejectionPoint = station.seaRejectionPoint
      }
      
      const distance = calculateDistance(lat, lon, rejectionPoint[0], rejectionPoint[1])
      
      // Dégradé continu avec plusieurs facteurs d'atténuation
      if (distance < 8000) { // Augmenté la portée
        // Atténuation exponentielle avec facteur de distance variable
        const baseAttenuation = Math.exp(-distance / 2000) // Facteur principal
        const windEffect = 1 + (currentTimeSlot.windSpeed / 100) // Effet du vent
        const depthFactor = Math.max(0.3, 1 - (distance / 10000)) // Facteur de profondeur
        
        // Concentration avec dégradé naturel
        const baseInfluence = station.baseConcentration * currentTimeSlot.multiplier
        const distanceInfluence = baseInfluence * baseAttenuation * windEffect * depthFactor
        
        // Ajout de variabilité naturelle
        const naturalVariation = 0.8 + (Math.random() * 0.4) // ±20% de variation
        const finalInfluence = distanceInfluence * naturalVariation
        
        if (finalInfluence > 0.001) { // Seuil minimal
          totalConcentration += finalInfluence
          influences.push({
            source: station.name,
            distance: Math.round(distance),
            influence: finalInfluence.toFixed(4),
            level: station.level,
            contribution: (finalInfluence / baseInfluence) * 100
          })
        }
      }
    })

    // Influence des zones de pollution avec dégradé continu
    pollutionZones.forEach(zone => {
      const distance = calculateDistance(lat, lon, zone.center[0], zone.center[1])
      const effectiveRadius = zone.radius * 1.5 // Étendre l'influence
      
      if (distance < effectiveRadius) {
        // Dégradé continu pour les zones
        const proximityFactor = Math.max(0, 1 - (distance / effectiveRadius))
        const currentLevel = zone.levels[concentrationLevel]
        const baseInfluence = currentLevel.concentration * currentTimeSlot.multiplier
        
        // Atténuation progressive avec courbe naturelle
        const attenuationCurve = Math.pow(proximityFactor, 1.5) // Courbe plus naturelle
        const finalInfluence = baseInfluence * attenuationCurve
        
        if (finalInfluence > 0.001) {
          totalConcentration += finalInfluence
          influences.push({
            source: zone.name,
            distance: Math.round(distance),
            influence: finalInfluence.toFixed(4),
            level: concentrationLevel,
            contribution: proximityFactor * 100
          })
        }
      }
    })

    return {
      totalConcentration: totalConcentration.toFixed(4),
      influences: influences.sort((a, b) => parseFloat(b.influence) - parseFloat(a.influence))
    }
  }

  const updateLayers = (L: any) => {
    if (!layersRef.current.stationsGroup) return

    // Clear existing layers
    layersRef.current.stationsGroup.clearLayers()
    layersRef.current.pollutionGroup.clearLayers()
    layersRef.current.pipelinesGroup.clearLayers()

    // Add pollution zones with wind-affected dispersion
    if (showPollution) {
      pollutionZones.forEach(zone => {
        const currentLevel = zone.levels[concentrationLevel]
        const concentration = currentLevel.concentration * currentTimeSlot.multiplier
        
        // Créer forme de dispersion réaliste avec effet du vent
        if (showWindEffect) {
          createWindAffectedDispersion(L, zone, currentLevel, currentTimeSlot)
        } else {
          createCircularDispersion(L, zone, currentLevel)
        }

        // Add center marker
        const marker = L.circleMarker(zone.center, {
          radius: 10,
          fillColor: currentLevel.color,
          color: '#ffffff',
          weight: 3,
          fillOpacity: 0.9
        })

        marker.bindPopup(`
          <div class="modern-popup bg-white rounded-xl shadow-2xl border-0 p-4 min-w-[300px]">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-lg font-bold text-gray-800">${zone.name}</h3>
              <div class="px-3 py-1 rounded-full text-xs font-semibold text-white" style="background-color: ${currentLevel.color}">
                ${concentrationLevel.toUpperCase()}
              </div>
            </div>
            
            <div class="space-y-3">
              <div class="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3">
                <div class="text-sm text-gray-600 mb-1">Concentration Mesurée</div>
                <div class="text-2xl font-bold" style="color: ${currentLevel.color}">${concentration.toFixed(2)} ng/L</div>
              </div>
              
              <div class="grid grid-cols-2 gap-3">
                <div class="text-center">
                  <div class="text-xs text-gray-500">Période</div>
                  <div class="font-semibold text-gray-800">${currentTimeSlot.label}</div>
                </div>
                <div class="text-center">
                  <div class="text-xs text-gray-500">Type Zone</div>
                  <div class="font-semibold text-gray-800">Pollution</div>
                </div>
              </div>
              
              <div class="border-t pt-3">
                <div class="text-xs text-gray-500 mb-2">Conditions Météo</div>
                <div class="flex justify-between text-sm">
                  <span>Vent: ${currentTimeSlot.windDirection}° - ${currentTimeSlot.windSpeed} km/h</span>
                </div>
              </div>
            </div>
          </div>
        `, {
          className: 'modern-popup-container',
          maxWidth: 320,
          closeButton: true
        })

        marker.on('click', () => setSelectedZone({...zone, currentLevel, concentration}))
        marker.addTo(layersRef.current.pollutionGroup)
      })
    }

    // Add stations and pipelines
    if (showStations) {
      toulonStations.forEach(station => {
        // Station marker
        const stationIcon = L.divIcon({
          html: `
            <div class="station-marker" style="
              background-color: ${getStationColor(station.level)};
              width: 32px;
              height: 32px;
              border-radius: 8px;
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            ">
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
          `,
          className: 'custom-station-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })

        const stationMarker = L.marker(station.coords, { icon: stationIcon })
        
        stationMarker.bindPopup(`
          <div class="p-3 min-w-[250px]">
            <h4 class="font-bold text-blue-600 mb-2">${station.name}</h4>
            <p><strong>Capacité:</strong> ${station.capacity.toLocaleString()} m³/jour</p>
            <p><strong>Efficacité:</strong> ${station.efficiency}%</p>
            <div class="mt-2">
              <strong>Polluants rejetés:</strong>
              <ul class="text-xs mt-1">
                ${station.pollutants?.map(p => `<li>• ${p}</li>`).join('') || ''}
              </ul>
            </div>
          </div>
        `)

        stationMarker.on('click', () => setSelectedStation(station))
        stationMarker.addTo(layersRef.current.stationsGroup)

        // Dispersion depuis le point de rejet avec effet du vent
        if (showRejectionDispersion) {
          // Pour la station Gapeau, dispersion depuis l'embouchure en mer
          const dispersionPoint = (station.id === 'gapeau' && station.seaRejectionPoint) 
            ? station.seaRejectionPoint 
            : station.rejectionPoint

          // Calculer la taille de dispersion selon le niveau de concentration
          const baseDispersionSize = getDispersionSizeByLevel(station.level)
          
          // Créer dispersion avec effet du vent pour chaque station
          if (showWindEffect) {
            createStationWindDispersion(L, {
              center: dispersionPoint,
              level: station.level,
              baseConcentration: station.baseConcentration,
              stationName: station.name,
              capacity: station.capacity
            }, currentTimeSlot, baseDispersionSize)
          } else {
            createStationCircularDispersion(L, {
              center: dispersionPoint,
              level: station.level,
              baseConcentration: station.baseConcentration
            }, baseDispersionSize)
          }
        }

        // Rejection point marker avec couleur dynamique selon période
        const dynamicConcentration = station.baseConcentration * currentTimeSlot.multiplier
        const rejectionColor = getConcentrationColor(dynamicConcentration)
        
        const rejectionIcon = L.divIcon({
          html: `
            <div style="
              background: radial-gradient(circle, ${rejectionColor} 0%, ${getConcentrationColor(dynamicConcentration, 0.7)} 50%, ${getConcentrationColor(dynamicConcentration, 0.3)} 100%);
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 15px ${getConcentrationColor(dynamicConcentration, 0.6)}, 0 2px 8px rgba(0,0,0,0.4);
              animation: pulse 2s infinite;
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                opacity: 0.9;
              "></div>
            </div>
          `,
          className: 'custom-rejection-icon',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })

        const rejectionMarker = L.marker(station.rejectionPoint, { icon: rejectionIcon })
        
        rejectionMarker.bindPopup(`
          <div class="modern-popup bg-white rounded-xl shadow-2xl border-0 p-5 min-w-[320px]">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-800 flex items-center">
                <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${rejectionColor}"></div>
                ${station.name}
              </h3>
              <div class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                STATION
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div class="text-sm text-gray-600 mb-1">Concentration Actuelle</div>
                <div class="text-3xl font-bold text-blue-600">${dynamicConcentration.toFixed(2)} ng/L</div>
                <div class="text-xs text-gray-500 mt-1">Facteur temporel: ×${currentTimeSlot.multiplier}</div>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 mb-1">Capacité</div>
                  <div class="font-bold text-gray-800">${station.capacity.toLocaleString()}</div>
                  <div class="text-xs text-gray-500">m³/jour</div>
                </div>
                <div class="bg-gray-50 rounded-lg p-3">
                  <div class="text-xs text-gray-500 mb-1">Période</div>
                  <div class="font-bold text-gray-800">${currentTimeSlot.label}</div>
                </div>
              </div>
              
              <div class="border-t pt-3">
                <div class="text-xs text-gray-500 mb-2">Informations Techniques</div>
                <div class="text-sm text-gray-700">
                  Point de rejet principal pour le traitement des eaux usées de la zone
                </div>
              </div>
            </div>
          </div>
        `, {
          className: 'modern-popup-container',
          maxWidth: 350,
          closeButton: true
        })

        rejectionMarker.addTo(layersRef.current.stationsGroup)

        // Pipeline ou rivière
        if (showPipelines) {
          if (station.id === 'gapeau' && station.riverPath) {
            // Tracé spécial pour la rivière Gapeau
            const riverLine = L.polyline(station.riverPath, {
              color: '#0ea5e9', // Bleu rivière
              weight: 6,
              opacity: 0.9
            })

            riverLine.bindPopup(`
              <div class="p-2">
                <h4 class="font-bold text-blue-600">Rivière Gapeau</h4>
                <p>Transport des eaux traitées</p>
                <p>De: ${station.name}</p>
                <p>Vers: Mer Méditerranée</p>
                <p>Longueur: ~8km</p>
              </div>
            `)

            riverLine.addTo(layersRef.current.pipelinesGroup)

            // Canalisation station vers rivière
            const stationToPipe = L.polyline([station.coords, station.rejectionPoint], {
              color: '#3b82f6',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10'
            })

            stationToPipe.bindPopup(`
              <div class="p-2">
                <h4 class="font-bold">Canalisation</h4>
                <p>De: ${station.name}</p>
                <p>Vers: Rivière Gapeau</p>
              </div>
            `)

            stationToPipe.addTo(layersRef.current.pipelinesGroup)
          } else {
            // Canalisation normale
            const pipeline = L.polyline([station.coords, station.rejectionPoint], {
              color: '#3b82f6',
              weight: 4,
              opacity: 0.8,
              dashArray: '10, 10'
            })

            pipeline.bindPopup(`
              <div class="p-2">
                <h4 class="font-bold">Canalisation</h4>
                <p>De: ${station.name}</p>
                <p>Vers: Point de rejet marine</p>
              </div>
            `)

            pipeline.addTo(layersRef.current.pipelinesGroup)
          }
        }
      })
    }
  }

  const getStationColor = (level: string) => {
    switch (level) {
      case 'high': return '#dc2626'
      case 'medium': return '#ea580c'
      case 'low': return '#16a34a'
      default: return '#6b7280'
    }
  }

  const getDispersionColor = (concentration: number) => {
    if (concentration > 4.0) return '#dc2626' // Rouge
    if (concentration > 3.0) return '#ea580c' // Orange
    if (concentration > 2.0) return '#f59e0b' // Jaune
    if (concentration > 1.0) return '#10b981' // Vert clair
    return '#06b6d4' // Bleu
  }

  // Fonction pour obtenir la couleur de dispersion selon le niveau et l'intensité
  const getDispersionColorByLevel = (level: string, intensity: number) => {
    if (level === 'high') {
      // Rouge → Orange → Jaune → Vert
      if (intensity > 0.8) return '#dc2626' // Rouge
      if (intensity > 0.6) return '#ea580c' // Orange
      if (intensity > 0.3) return '#f59e0b' // Jaune
      return '#10b981' // Vert
    } else if (level === 'medium') {
      // Orange → Jaune → Vert
      if (intensity > 0.7) return '#ea580c' // Orange
      if (intensity > 0.4) return '#f59e0b' // Jaune
      return '#10b981' // Vert
    } else {
      // Vert → Bleu (faible pollution)
      if (intensity > 0.5) return '#10b981' // Vert
      return '#06b6d4' // Bleu
    }
  }

  const changeMapStyle = (style: string) => {
    if (!mapInstanceRef.current) return
    
    import('leaflet').then((L) => {
      // Remove current base layer
      if (layersRef.current.baseLayer) {
        mapInstanceRef.current.removeLayer(layersRef.current.baseLayer)
      }

      // Add new base layer
      const tileLayers = {
        satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri'
        }),
        street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }),
        terrain: L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
          attribution: 'Map tiles by Stamen Design'
        })
      }

      const newLayer = tileLayers[style as keyof typeof tileLayers]
      newLayer.addTo(mapInstanceRef.current)
      layersRef.current.baseLayer = newLayer
      setMapStyle(style)
    })
  }

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'bg-card/50 border-gray-700/50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapIcon className="h-5 w-5 text-blue-400" />
            <span>Carte Interactive Toulon</span>
            {isFullscreen && (
              <span className="text-sm text-gray-500 ml-2">- Mode Plein Écran</span>
            )}
          </div>
          
          {/* Bouton plein écran pour mobile */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="md:hidden p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center space-x-1"
          >
            {isFullscreen ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs">Fermer</span>
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                <span className="text-xs">Plein Écran</span>
              </>
            )}
          </button>
          <Badge className="bg-green-600">Données Géolocalisées</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contrôles Mobile-Friendly */}
        <div className="space-y-4">
          {/* Contrôles principaux - Mobile optimisé */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Période */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-300">Période:</span>
              <select 
                value={currentTimeSlot.id} 
                onChange={(e) => {
                  const newTimeSlot = timeSlots.find(t => t.id === e.target.value) || timeSlots[0]
                  setCurrentTimeSlot(newTimeSlot)
                  setConcentrationLevel(newTimeSlot.concentrationLevel)
                }}
                className="w-full px-3 py-2 text-sm bg-gray-800 text-white border border-gray-600 rounded-lg"
              >
                {timeSlots?.map(slot => (
                  <option key={slot.id} value={slot.id}>{slot.label}</option>
                )) || []}
              </select>
            </div>
            
            
            {/* Effet Vent */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-300">Effet Vent:</span>
              <Button
                variant={showWindEffect ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowWindEffect(!showWindEffect)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                🌪️ {showWindEffect ? 'Activé' : 'Désactivé'}
              </Button>
            </div>
          </div>
          
          {/* Info vent actuel */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-blue-900/30 rounded-lg border border-blue-600/50">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center transform text-white font-bold"
                style={{ transform: `rotate(${currentTimeSlot.windDirection}deg)` }}
              >
                ↑
              </div>
              <span className="text-sm font-medium">
                Vent: {currentTimeSlot.windDirection}° - {currentTimeSlot.windSpeed} km/h
              </span>
            </div>
            <div className="text-sm text-gray-300">
              Facteur temporel: ×{currentTimeSlot.multiplier}
            </div>
            <div className="text-sm text-gray-300">
              Niveau auto: <span className="capitalize font-medium">{currentTimeSlot.concentrationLevel}</span>
            </div>
          </div>
          
          {/* Contrôles de carte - Mobile optimisé */}
          <div className="space-y-3">
            {/* Style de carte */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-300">Style de carte:</span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={mapStyle === 'satellite' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeMapStyle('satellite')}
                  className="text-xs"
                >
                  <Satellite className="h-3 w-3 mr-1" />
                  Satellite
                </Button>
                <Button
                  variant={mapStyle === 'street' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeMapStyle('street')}
                  className="text-xs"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Rue
                </Button>
                <Button
                  variant={mapStyle === 'terrain' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => changeMapStyle('terrain')}
                  className="text-xs"
                >
                  <Layers className="h-3 w-3 mr-1" />
                  Terrain
                </Button>
              </div>
            </div>
            
            {/* Couches de données */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-300">Couches de données:</span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={showStations ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowStations(!showStations)}
                  className="text-xs justify-start"
                >
                  <Factory className="h-3 w-3 mr-1" />
                  Stations
                </Button>
                <Button
                  variant={showPipelines ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowPipelines(!showPipelines)}
                  className="text-xs justify-start"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Canalisations
                </Button>
                <Button
                  variant={showPollution ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowPollution(!showPollution)}
                  className="text-xs justify-start"
                >
                  <Target className="h-3 w-3 mr-1" />
                  Pollution
                </Button>
                <Button
                  variant={showRejectionDispersion ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowRejectionDispersion(!showRejectionDispersion)}
                  className="text-xs justify-start"
                >
                  <Droplets className="h-3 w-3 mr-1" />
                  Dispersion
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Carte */}
        <div 
          ref={mapRef} 
          className={`w-full rounded-lg border border-gray-700/50 relative overflow-hidden ${
            isFullscreen 
              ? 'h-[calc(100vh-200px)]' 
              : 'h-[400px] md:h-[500px]'
          }`}
          style={{ zIndex: 1 }}
        />

        {/* Légende */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900 text-white rounded-lg border border-gray-700">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Factory className="h-4 w-4 mr-2" />
              Stations d'Épuration
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-600 rounded border-2 border-white"></div>
                <span>Efficacité élevée (&gt;90%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-600 rounded border-2 border-white"></div>
                <span>Efficacité moyenne (70-90%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-600 rounded border-2 border-white"></div>
                <span>Efficacité faible (&lt;70%)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Dispersion Pollution
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-600 rounded-full opacity-70"></div>
                <span>Critique (&gt;4.0 ng/L)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-orange-600 rounded-full opacity-60"></div>
                <span>Élevé (2.5-4.0 ng/L)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full opacity-50"></div>
                <span>Modéré (1.0-2.5 ng/L)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full opacity-40"></div>
                <span>Faible (&lt;1.0 ng/L)</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Navigation className="h-4 w-4 mr-2" />
              Infrastructure
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-1 bg-blue-500"></div>
                <span>Canalisation vers mer</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full border border-white animate-pulse"></div>
                <span>Point de rejet marine</span>
              </div>
              <div className="flex items-center space-x-2">
                <Droplets className="h-3 w-3 text-blue-500" />
                <span>Flux d'eau traité</span>
              </div>
            </div>
          </div>
        </div>

        {/* Détails sélection */}
        {selectedStation && (
          <div className="p-4 bg-gray-900 text-white border border-blue-500 rounded-lg shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Factory className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-600">{selectedStation.name}</h4>
                <Badge className={`${
                  selectedStation.level === 'high' ? 'bg-red-500' :
                  selectedStation.level === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                }`}>
                  {selectedStation.efficiency}% efficacité
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedStation(null)}>×</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div><strong>Capacité:</strong> {selectedStation.capacity.toLocaleString()} m³/jour</div>
                <div><strong>Coordonnées:</strong> {selectedStation.coords[0].toFixed(4)}, {selectedStation.coords[1].toFixed(4)}</div>
                <div><strong>Efficacité:</strong> {selectedStation.efficiency}%</div>
              </div>
              <div className="space-y-2">
                <div><strong>Polluants rejetés:</strong></div>
                <div className="text-xs space-y-1">
                  {selectedStation.pollutants?.map((pollutant: string, index: number) => (
                    <div key={index} className="bg-gray-800 text-gray-200 p-1 rounded">• {pollutant}</div>
                  )) || []}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedZone && (
          <div className="p-4 bg-gray-900 text-white border border-red-500 rounded-lg shadow-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-red-600">{selectedZone.name}</h4>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedZone(null)}>×</Button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div><strong>Concentration max:</strong> {selectedZone.concentration} µg/L</div>
              <div><strong>Rayon d'impact:</strong> {selectedZone.radius}m</div>
              <div><strong>Coordonnées:</strong> {selectedZone.center[0].toFixed(4)}, {selectedZone.center[1].toFixed(4)}</div>
              <div><strong>Dispersion par distance:</strong></div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {selectedZone.dispersionLevels?.map((level: any, index: number) => (
                  <div key={index} className="bg-gray-800 text-gray-200 p-2 rounded">
                    <div>{level.radius}m: {level.concentration} µg/L</div>
                  </div>
                )) || []}
              </div>
            </div>
          </div>
        )}

        {/* Prédiction de concentration au point cliqué - Version moderne */}
        {clickedPoint && (
          <div className="modern-popup bg-white rounded-xl shadow-2xl border-0 p-5 min-w-[350px] max-w-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                Prédiction IA
              </h3>
              <button 
                onClick={() => setClickedPoint(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Coordonnées */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Position GPS</div>
                <div className="font-mono text-sm text-gray-800">
                  {clickedPoint.coords[0].toFixed(6)}°N<br/>
                  {clickedPoint.coords[1].toFixed(6)}°E
                </div>
              </div>
              
              {/* Concentration totale */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Concentration Prédite</div>
                <div className="text-3xl font-bold text-blue-600">
                  {clickedPoint.prediction.totalConcentration} ng/L
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Basé sur {clickedPoint.prediction.influences?.length || 0} source(s)
                </div>
              </div>
              
              {/* Sources d'influence */}
              {clickedPoint.prediction.influences?.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-3">Sources d'Influence</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {clickedPoint.prediction.influences?.map((influence: any, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-800 text-sm">{influence.source}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            influence.level === 'high' ? 'bg-red-100 text-red-800' :
                            influence.level === 'medium' ? 'bg-orange-100 text-orange-800' :
                            influence.level === 'low' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {influence.level}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="text-gray-500">Distance:</span> {influence.distance}m
                          </div>
                          <div>
                            <span className="text-gray-500">Impact:</span> {influence.influence} ng/L
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, influence.contribution || 0)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Contribution: {(influence.contribution || 0).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {clickedPoint.prediction.influences?.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune source de pollution détectée à proximité</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        
        /* Styles pour les dégradés de pollution - Simulation aquatique naturelle */
        .pollution-gradient-0 {
          filter: blur(0px) saturate(1.2);
          box-shadow: 
            inset 0 0 30px rgba(220, 38, 38, 0.4),
            0 0 15px rgba(220, 38, 38, 0.2);
          animation: waterFlow 8s ease-in-out infinite;
        }
        
        .pollution-gradient-1 {
          filter: blur(1px) saturate(1.1);
          box-shadow: 
            inset 0 0 25px rgba(239, 68, 68, 0.3),
            0 0 12px rgba(239, 68, 68, 0.15);
          animation: waterFlow 10s ease-in-out infinite 0.5s;
        }
        
        .pollution-gradient-2 {
          filter: blur(2px) saturate(1.0);
          box-shadow: 
            inset 0 0 20px rgba(251, 146, 60, 0.25),
            0 0 10px rgba(251, 146, 60, 0.12);
          animation: waterFlow 12s ease-in-out infinite 1s;
        }
        
        .pollution-gradient-3 {
          filter: blur(3px) saturate(0.9);
          box-shadow: 
            inset 0 0 15px rgba(132, 204, 22, 0.2),
            0 0 8px rgba(132, 204, 22, 0.1);
          animation: waterFlow 14s ease-in-out infinite 1.5s;
        }
        
        .pollution-gradient-4 {
          filter: blur(4px) saturate(0.8);
          box-shadow: 
            inset 0 0 12px rgba(6, 182, 212, 0.15),
            0 0 6px rgba(6, 182, 212, 0.08);
          animation: waterFlow 16s ease-in-out infinite 2s;
        }
        
        .pollution-gradient-5 {
          filter: blur(5px) saturate(0.7);
          box-shadow: 
            inset 0 0 8px rgba(6, 182, 212, 0.1),
            0 0 4px rgba(6, 182, 212, 0.05);
          animation: waterFlow 18s ease-in-out infinite 2.5s;
        }
        
        /* Animation de flux d'eau naturel */
        @keyframes waterFlow {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
          25% { 
            transform: scale(1.02) rotate(0.5deg);
            opacity: 0.95;
          }
          50% { 
            transform: scale(1.01) rotate(-0.3deg);
            opacity: 0.98;
          }
          75% { 
            transform: scale(1.015) rotate(0.2deg);
            opacity: 0.96;
          }
        }
        
        /* Effet de transition douce pour les changements */
        .leaflet-interactive {
          transition: all 0.3s ease-in-out;
        }
        
        /* Amélioration des bordures pour un effet plus naturel */
        .leaflet-interactive:hover {
          filter: brightness(1.1) saturate(1.2);
        }
      `}</style>
    </Card>
  )
}
