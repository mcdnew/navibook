'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutGrid,
  CalendarDays,
  Anchor,
  UserCircle2,
  Wallet
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  matchPaths: string[]
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    icon: LayoutGrid,
    label: 'Home',
    matchPaths: ['/dashboard'],
  },
  {
    href: '/calendar',
    icon: CalendarDays,
    label: 'Calendar',
    matchPaths: ['/calendar'],
  },
  {
    href: '/bookings',
    icon: Anchor,
    label: 'Bookings',
    matchPaths: ['/bookings'],
  },
  {
    href: '/customers',
    icon: UserCircle2,
    label: 'Guests',
    matchPaths: ['/customers'],
  },
  {
    href: '/payments',
    icon: Wallet,
    label: 'Payments',
    matchPaths: ['/payments'],
  },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  // Don't show on login page or customer portal
  if (pathname === '/' || pathname.startsWith('/portal/')) {
    return null
  }

  const isActive = (matchPaths: string[]) => {
    return matchPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20 md:hidden" />

      {/* Fixed bottom navigation - only visible on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-border md:hidden safe-area-inset-bottom shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.matchPaths)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full space-y-0.5 transition-all duration-200',
                  'focus:outline-none rounded-lg',
                  active
                    ? 'text-primary scale-105'
                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                )}
              >
                <Icon className={cn('w-6 h-6', active && 'stroke-[2.5px]')} />
                <span className={cn('text-[10px] font-medium tracking-wide uppercase', active && 'font-semibold')}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
