import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals)
}

export function formatConcentration(value: number): string {
  if (value < 0.001) return '<0.001 µg/L'
  if (value < 1) return `${value.toFixed(3)} µg/L`
  if (value < 1000) return `${value.toFixed(2)} µg/L`
  return `${(value / 1000).toFixed(2)} mg/L`
}

export function getRiskColor(riskLevel: number): string {
  switch (riskLevel) {
    case 1: return 'text-green-500'
    case 2: return 'text-yellow-500'
    case 3: return 'text-orange-500'
    case 4: return 'text-red-500'
    case 5: return 'text-red-700'
    default: return 'text-gray-500'
  }
}

export function getRiskBgColor(riskLevel: number): string {
  switch (riskLevel) {
    case 1: return 'bg-green-500/20'
    case 2: return 'bg-yellow-500/20'
    case 3: return 'bg-orange-500/20'
    case 4: return 'bg-red-500/20'
    case 5: return 'bg-red-700/20'
    default: return 'bg-gray-500/20'
  }
}

export function getTrendIcon(trend: string): string {
  switch (trend.toLowerCase()) {
    case 'increasing':
    case '↑':
      return '↗️'
    case 'decreasing':
    case '↓':
      return '↘️'
    case 'stable':
    case '→':
      return '➡️'
    default:
      return '➡️'
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export function generateHeatmapColor(value: number, max: number): string {
  const intensity = Math.min(value / max, 1)
  
  if (intensity < 0.2) return '#00ff00' // Green
  if (intensity < 0.4) return '#80ff00' // Yellow-green
  if (intensity < 0.6) return '#ffff00' // Yellow
  if (intensity < 0.8) return '#ff8000' // Orange
  return '#ff0000' // Red
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
