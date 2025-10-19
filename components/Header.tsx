'use client'

import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download } from 'lucide-react'
import { useState, useEffect } from 'react'

interface HeaderProps {
  title?: string
  subtitle?: string
  showActions?: boolean
  onRefresh?: () => void
  loading?: boolean
  lastUpdate?: Date
}

export function Header({ 
  title, 
  subtitle, 
  showActions = false, 
  onRefresh, 
  loading = false,
  lastUpdate 
}: HeaderProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlHeader = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setIsVisible(false)
      } else {
        // Scrolling up or at top
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', controlHeader)
    return () => window.removeEventListener('scroll', controlHeader)
  }, [lastScrollY])

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 
        bg-white/95 backdrop-blur-sm border-b border-gray-200/50
        transition-transform duration-300 ease-in-out
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
        lg:left-64
      `}
    >
      <div className="container mx-auto px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Logo size="md" showText={true} />
            {title && (
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs md:text-sm text-gray-600">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-3">
              {lastUpdate && (
                <div className="hidden md:block text-xs text-gray-500">
                  Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              {onRefresh && (
                <Button 
                  onClick={onRefresh} 
                  size="sm" 
                  variant="outline"
                  disabled={loading}
                  className="hidden md:flex border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Chargement...' : 'Actualiser'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
