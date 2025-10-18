'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Waves } from 'lucide-react'

interface Region {
  id: string
  name: string
  country: string
  coordinates: [number, number]
  zoom: number
  description: string
  flag: string
}

const regions: Region[] = [
  {
    id: 'toulon',
    name: 'Toulon',
    country: 'France',
    coordinates: [43.1242, 5.9280],
    zoom: 10,
    description: 'Méditerranée - Port militaire principal',
    flag: '🇫🇷'
  },
  {
    id: 'marseille',
    name: 'Marseille',
    country: 'France', 
    coordinates: [43.3183, 5.3547],
    zoom: 10,
    description: 'Méditerranée - Plus grand port de France',
    flag: '🇫🇷'
  },
  {
    id: 'nice',
    name: 'Nice',
    country: 'France',
    coordinates: [43.7102, 7.2620],
    zoom: 10,
    description: 'Côte d\'Azur - Tourisme côtier',
    flag: '🇫🇷'
  },
  {
    id: 'barcelona',
    name: 'Barcelone',
    country: 'Espagne',
    coordinates: [41.3851, 2.1734],
    zoom: 10,
    description: 'Méditerranée - Port industriel majeur',
    flag: '🇪🇸'
  },
  {
    id: 'rome',
    name: 'Rome (Côtier)',
    country: 'Italie',
    coordinates: [41.9028, 12.4964],
    zoom: 9,
    description: 'Mer Tyrrhénienne - Zone côtière',
    flag: '🇮🇹'
  },
  {
    id: 'naples',
    name: 'Naples',
    country: 'Italie',
    coordinates: [40.8518, 14.2681],
    zoom: 10,
    description: 'Golfe de Naples - Méditerranée',
    flag: '🇮🇹'
  },
  {
    id: 'valencia',
    name: 'Valence',
    country: 'Espagne',
    coordinates: [39.4699, -0.3763],
    zoom: 10,
    description: 'Méditerranée - Port commercial',
    flag: '🇪🇸'
  },
  {
    id: 'lisbon',
    name: 'Lisbonne',
    country: 'Portugal',
    coordinates: [38.7223, -9.1393],
    zoom: 10,
    description: 'Atlantique - Estuaire du Tage',
    flag: '🇵🇹'
  },
  {
    id: 'amsterdam',
    name: 'Amsterdam',
    country: 'Pays-Bas',
    coordinates: [52.3676, 4.9041],
    zoom: 10,
    description: 'Mer du Nord - Port d\'Amsterdam',
    flag: '🇳🇱'
  },
  {
    id: 'copenhagen',
    name: 'Copenhague',
    country: 'Danemark',
    coordinates: [55.6761, 12.5683],
    zoom: 10,
    description: 'Mer Baltique - Øresund',
    flag: '🇩🇰'
  }
]

interface RegionSelectorProps {
  selectedRegion: Region | null
  onRegionChange: (region: Region) => void
  className?: string
}

export function RegionSelector({ selectedRegion, onRegionChange, className }: RegionSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-400" />
            <span>Sélection de Région</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden"
          >
            {isExpanded ? 'Réduire' : 'Étendre'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Current Selection */}
        {selectedRegion && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{selectedRegion.flag}</span>
                  <span className="font-medium text-blue-400">{selectedRegion.name}</span>
                </div>
                <p className="text-xs text-neutral/70 mt-1">{selectedRegion.description}</p>
              </div>
              <MapPin className="h-4 w-4 text-blue-400" />
            </div>
          </div>
        )}

        {/* Region Grid */}
        <div className={`space-y-2 ${!isExpanded && 'hidden md:block'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {regions.map((region) => (
              <Button
                key={region.id}
                variant={selectedRegion?.id === region.id ? "default" : "outline"}
                className="justify-start h-auto p-3 text-left"
                onClick={() => onRegionChange(region)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <span className="text-lg">{region.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{region.name}</div>
                    <div className="text-xs text-neutral/70 truncate">{region.country}</div>
                  </div>
                  {selectedRegion?.id === region.id && (
                    <Waves className="h-4 w-4 text-blue-400 flex-shrink-0" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {selectedRegion && (
          <div className="mt-4 pt-3 border-t border-gray-600/50">
            <div className="text-xs text-neutral/70 text-center">
              Coordonnées: {selectedRegion.coordinates[0].toFixed(4)}, {selectedRegion.coordinates[1].toFixed(4)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { regions }
export type { Region }
