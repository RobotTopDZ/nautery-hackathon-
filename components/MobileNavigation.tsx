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
    name: 'Accueil',
    href: '/',
    icon: Home,
    color: 'text-blue-400'
  },
  {
    name: 'Prédire',
    href: '/predict',
    icon: Brain,
    color: 'text-purple-400'
  },
  {
    name: 'Toulon',
    href: '/toulon',
    icon: Map,
    color: 'text-green-400'
  }
]

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-t border-gray-700/50">
      <div className="grid grid-cols-3 h-16">
        {mobileNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-neutral/70 hover:text-neutral active:scale-95"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-primary" : item.color
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-neutral/70"
              )}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
