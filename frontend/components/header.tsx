'use client'

import Link from 'next/link'
import { useApp } from '@/lib/context'
import { Shield, Settings, User, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Header() {
  const { userSettings } = useApp()
  const { largeText, profile } = userSettings

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1
                className={cn(
                  'font-semibold text-foreground',
                  largeText ? 'text-xl' : 'text-lg'
                )}
              >
                ClearAlert
              </h1>
              <p
                className={cn(
                  'text-muted-foreground',
                  largeText ? 'text-sm' : 'text-xs'
                )}
              >
                Emergency Intelligence System
              </p>
            </div>
          </Link>
          
          <div className="flex items-center gap-1">
            <Link href="/status">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Radio className="h-4 w-4" />
                <span className={cn('hidden sm:inline', largeText ? 'text-sm' : 'text-xs')}>
                  Status Demo
                </span>
              </Button>
            </Link>
            
            <Link href="/settings">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-2 text-muted-foreground hover:text-foreground',
                  profile?.isConfigured && 'text-primary'
                )}
              >
                {profile?.isConfigured ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Settings className="h-4 w-4" />
                )}
                <span className={cn('hidden sm:inline', largeText ? 'text-sm' : 'text-xs')}>
                  {profile?.isConfigured ? 'Profile' : 'Setup Profile'}
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
