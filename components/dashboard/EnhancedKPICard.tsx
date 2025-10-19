'use client'

import { EnhancedCard, EnhancedCardContent } from '@/components/ui/enhanced-card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { useState } from 'react'

interface EnhancedKPICardProps {
  title: string
  value: string | number
  unit?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  description?: string
  onClick?: () => void
}

const colorClasses = {
  blue: {
    icon: 'text-blue-400 bg-blue-500/10',
    trend: 'text-blue-400',
    accent: 'border-l-blue-500'
  },
  green: {
    icon: 'text-green-400 bg-green-500/10',
    trend: 'text-green-400',
    accent: 'border-l-green-500'
  },
  yellow: {
    icon: 'text-yellow-400 bg-yellow-500/10',
    trend: 'text-yellow-400',
    accent: 'border-l-yellow-500'
  },
  red: {
    icon: 'text-red-400 bg-red-500/10',
    trend: 'text-red-400',
    accent: 'border-l-red-500'
  },
  purple: {
    icon: 'text-purple-400 bg-purple-500/10',
    trend: 'text-purple-400',
    accent: 'border-l-purple-500'
  }
}

export function EnhancedKPICard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  color = 'blue',
  description,
  onClick
}: EnhancedKPICardProps) {
  const [isPressed, setIsPressed] = useState(false)
  const colors = colorClasses[color]

  return (
    <EnhancedCard 
      hover={true}
      interactive={!!onClick}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        "border-l-4 relative overflow-hidden group",
        colors.accent,
        onClick && "cursor-pointer",
        isPressed && "scale-[0.97]"
      )}
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <EnhancedCardContent className="p-4 md:p-6 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className={cn(
                "p-2 rounded-lg transition-all duration-300 group-hover:scale-110",
                colors.icon
              )}>
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h3 className="text-sm md:text-base font-medium text-neutral/80 group-hover:text-neutral transition-colors">
                {title}
              </h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl md:text-3xl font-bold text-primary group-hover:scale-105 transition-transform duration-300 inline-block">
                  {value}
                </span>
                {unit && (
                  <span className="text-sm text-neutral/60">
                    {unit}
                  </span>
                )}
              </div>
              
              {trend && (
                <div className={cn(
                  "flex items-center space-x-1 text-xs md:text-sm font-medium transition-colors",
                  trend.isPositive ? "text-green-400" : "text-red-400"
                )}>
                  <span>{trend.isPositive ? '↗' : '↘'}</span>
                  <span>{Math.abs(trend.value)}%</span>
                  <span className="text-neutral/60">vs dernier mois</span>
                </div>
              )}
              
              {description && (
                <p className="text-xs text-neutral/60 mt-2 group-hover:text-neutral/80 transition-colors">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </EnhancedCardContent>
      
      {/* Ripple effect on click */}
      {onClick && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-primary/10 rounded-xl opacity-0 group-active:opacity-100 transition-opacity duration-150" />
        </div>
      )}
    </EnhancedCard>
  )
}
