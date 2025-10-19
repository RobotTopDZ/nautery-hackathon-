'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'
import { Logo } from '@/components/Logo'
import { 
  Home, 
  TrendingUp, 
  Map, 
  AlertTriangle, 
  Settings,
  Database,
  Brain,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
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
    name: 'Géographique',
    href: '/toulon',
    icon: Map,
    description: 'Carte Toulon GIS'
  },
  {
    name: 'Alertes',
    href: '#',
    icon: AlertTriangle,
    description: 'Système d\'alertes'
  }
]

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex bg-card/50 backdrop-blur-sm border-r border-gray-700/50 w-64 min-h-screen p-4">
        <div className="space-y-2 w-full">
          <div className="px-3 py-2 mb-4">
            <h2 className="text-lg font-semibold text-primary">Navigation</h2>
            <p className="text-xs text-neutral/70">Menu Principal</p>
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
        
          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-3 bg-card rounded-lg border border-gray-600/50">
              <div className="text-xs text-neutral/70 mb-1">System Status</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <nav className="fixed left-0 top-0 h-full w-64 bg-card border-r border-gray-700/50 p-4">
            <div className="space-y-2 mt-16">
              <div className="px-3 py-2 mb-4">
                <h2 className="text-lg font-semibold text-primary">Navigation</h2>
                <p className="text-xs text-neutral/70">Menu Principal</p>
              </div>
              
              {navigation.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
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
          </nav>
        </div>
      )}
    </>
  )
}
