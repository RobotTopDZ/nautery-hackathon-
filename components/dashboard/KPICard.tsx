'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, getTrendIcon } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  description?: string
  alert?: boolean
  className?: string
  icon?: React.ReactNode
}

export function KPICard({
  title,
  value,
  unit,
  trend,
  trendValue,
  description,
  alert = false,
  className,
  icon
}: KPICardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400'
      case 'down': return 'text-red-400'
      case 'stable': return 'text-yellow-400'
      default: return 'text-neutral/70'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />
      case 'down': return <TrendingDown className="h-4 w-4" />
      case 'stable': return <Minus className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <Card className={cn(
      "kpi-card",
      alert && "border-alert bg-alert/5",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-neutral/70">
          {title}
        </CardTitle>
        {alert && <AlertTriangle className="h-4 w-4 text-alert" />}
        {icon && !alert && <div className="text-primary">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-primary">
            {typeof value === 'number' ? value.toFixed(2) : value}
          </div>
          {unit && (
            <span className="text-sm text-neutral/70">{unit}</span>
          )}
        </div>
        
        {trend && trendValue && (
          <div className={cn("flex items-center space-x-1 text-xs mt-1", getTrendColor())}>
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
        
        {description && (
          <p className="text-xs text-neutral/50 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
