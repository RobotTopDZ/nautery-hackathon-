import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
}

const sizeClasses = {
  sm: 'h-6 w-auto',
  md: 'h-8 w-auto', 
  lg: 'h-10 w-auto',
  xl: 'h-12 w-auto'
}

export function Logo({ size = 'md', className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <Image
        src="/logo.png"
        alt="Nautery Logo"
        width={120}
        height={40}
        className={cn(sizeClasses[size], "object-contain")}
        priority
      />
      {showText && (
        <div className="hidden sm:block">
          <h2 className="text-lg font-semibold text-primary">Nautery</h2>
          <p className="text-xs text-neutral/70">Ocean Analytics</p>
        </div>
      )}
    </div>
  )
}
