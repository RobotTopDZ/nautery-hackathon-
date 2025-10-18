'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Home, 
  TrendingUp, 
  Map, 
  AlertTriangle, 
  Settings,
  Database,
  Brain
} from 'lucide-react'

const navigation = [
  {
    name: 'Tableau de Bord',
    href: '/',
    icon: Home,
    description: 'Vue d\'ensemble principale'
  },
  {
    name: 'Prédictions',
    href: '/predictions',
    icon: Brain,
    description: 'Prévisions IA'
  },
  {
    name: 'Prédire',
    href: '/predict',
    icon: Brain,
    description: 'Faire des prédictions'
  },
  {
    name: 'Analyses',
    href: '/analytics',
    icon: TrendingUp,
    description: 'Analyse détaillée'
  },
  {
    name: 'Vue Carte',
    href: '/map',
    icon: Map,
    description: 'Vue géographique'
  },
  {
    name: 'Alertes',
    href: '/alerts',
    icon: AlertTriangle,
    description: 'Gestion des risques'
  },
  {
    name: 'Données',
    href: '/data',
    icon: Database,
    description: 'Accès données brutes'
  }
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-card/50 backdrop-blur-sm border-r border-gray-700/50 w-64 min-h-screen p-4">
      <div className="space-y-2">
        <div className="px-3 py-2 mb-4">
          <h2 className="text-lg font-semibold text-primary">🌊 Ocean Monitor</h2>
          <p className="text-xs text-neutral/70">Environmental Analytics</p>
        </div>
        
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-auto p-3",
                  isActive && "bg-primary text-background"
                )}
              >
                <Icon className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </Button>
            </Link>
          )
        })}
      </div>
      
      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-3 bg-card rounded-lg border border-gray-600/50">
          <div className="text-xs text-neutral/70 mb-1">System Status</div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs">All systems operational</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
