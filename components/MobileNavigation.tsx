'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  Home, 
  Brain,
  Map, 
  AlertTriangle, 
  BarChart3
} from 'lucide-react'

const mobileNavigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    color: 'text-blue-400'
  },
  {
    name: 'Prédictions',
    href: '/predictions',
    icon: Brain,
    color: 'text-purple-400'
  },
  {
    name: 'Géographique',
    href: '/toulon',
    icon: Map,
    color: 'text-green-400'
  },
  {
    name: 'Alertes',
    href: '#',
    icon: AlertTriangle,
    color: 'text-red-400'
  }
]

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <div className="md:hidden mobile-nav-fixed bg-white border-t border-gray-200 shadow-lg safe-area-inset-bottom">
      <div className="grid grid-cols-4 h-16 pb-safe">
        {mobileNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-300 relative group",
                "hover:bg-gray-50 active:scale-95 active:bg-gray-100",
                isActive && "text-blue-600"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full" />
              )}
              
              {/* Icon with bounce animation */}
              <Icon className={cn(
                "h-5 w-5 transition-all duration-300 group-hover:scale-110",
                isActive ? "text-blue-600" : "text-gray-600"
              )} />
              
              {/* Label */}
              <span className={cn(
                "text-xs font-medium transition-all duration-300",
                isActive ? "text-blue-600 font-semibold" : "text-gray-600"
              )}>
                {item.name}
              </span>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-lg bg-blue-600/10 scale-0 group-active:scale-100 transition-transform duration-150" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
