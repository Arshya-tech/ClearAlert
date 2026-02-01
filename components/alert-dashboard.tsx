'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/context'
import { SeverityIndicator, SeverityBadge } from './severity-indicator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  MapPin,
  Clock,
  Gauge,
  RefreshCw,
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { WeatherAlert } from '@/lib/types'

function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

function AlertCard({
  alert,
  isExpanded,
  onToggle,
  isPrimary = false,
}: {
  alert: WeatherAlert
  isExpanded: boolean
  onToggle: () => void
  isPrimary?: boolean
}) {
  const { userSettings } = useApp()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border transition-colors',
        isPrimary
          ? 'border-primary/30 bg-card'
          : 'border-border bg-secondary/50'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 text-left"
        aria-expanded={isExpanded}
      >
        <div className="flex items-start gap-4">
          <SeverityIndicator
            severity={alert.severity}
            type={alert.type}
            size={isPrimary ? 'md' : 'sm'}
            showPulse={isPrimary && !userSettings.reducedMotion}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <SeverityBadge severity={alert.severity} />
              {isPrimary && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                  Most Urgent
                </span>
              )}
            </div>
            <h3
              className={cn(
                'font-semibold text-foreground text-balance',
                userSettings.largeText ? 'text-xl' : 'text-lg'
              )}
            >
              {alert.headline || alert.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-muted-foreground">
              <span
                className={cn(
                  'flex items-center gap-1',
                  userSettings.largeText ? 'text-sm' : 'text-xs'
                )}
              >
                <Clock className="h-3 w-3" />
                {formatTimeAgo(alert.timestamp)}
              </span>
              <span
                className={cn(
                  'flex items-center gap-1',
                  userSettings.largeText ? 'text-sm' : 'text-xs'
                )}
              >
                <Gauge className="h-3 w-3" />
                {Math.round(alert.confidence * 100)}% confidence
              </span>
            </div>
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0">
              <div className="border-t border-border pt-4">
                <p
                  className={cn(
                    'text-muted-foreground mb-4',
                    userSettings.largeText ? 'text-base' : 'text-sm'
                  )}
                >
                  {alert.description}
                </p>

                {alert.instruction && (
                  <div className="bg-secondary/50 rounded-lg p-3 mb-4">
                    <h4
                      className={cn(
                        'font-medium text-foreground mb-1',
                        userSettings.largeText ? 'text-base' : 'text-sm'
                      )}
                    >
                      What to do:
                    </h4>
                    <p
                      className={cn(
                        'text-muted-foreground',
                        userSettings.largeText ? 'text-base' : 'text-sm'
                      )}
                    >
                      {alert.instruction}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-muted-foreground">
                  <span
                    className={cn(
                      'flex items-center gap-1',
                      userSettings.largeText ? 'text-sm' : 'text-xs'
                    )}
                  >
                    <MapPin className="h-3 w-3" />
                    {alert.location}
                  </span>
                  {alert.source && (
                    <span
                      className={cn(
                        'flex items-center gap-1',
                        userSettings.largeText ? 'text-sm' : 'text-xs'
                      )}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Source: {alert.source}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function NoAlertsMessage() {
  const { userSettings, statusMessage, location, refreshAlert, isSearching } =
    useApp()

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-status-online/20"
        >
          <Shield className="h-12 w-12 text-status-online" />
        </motion.div>
        <div>
          <h3
            className={cn(
              'font-semibold text-foreground',
              userSettings.largeText ? 'text-2xl' : 'text-xl'
            )}
          >
            All Clear
          </h3>
          <p
            className={cn(
              'mt-2 text-muted-foreground max-w-md',
              userSettings.largeText ? 'text-lg' : 'text-base'
            )}
          >
            {statusMessage ||
              'No major alerts in the last 24 hours. Stay safe and check back for updates!'}
          </p>
          {location && (
            <p
              className={cn(
                'mt-2 text-muted-foreground flex items-center justify-center gap-1',
                userSettings.largeText ? 'text-base' : 'text-sm'
              )}
            >
              <MapPin className="h-4 w-4" />
              {location.displayName.split(',').slice(0, 2).join(',')}
              {location.country && (
                <span className="ml-1 text-primary/80">
                  ({location.country})
                </span>
              )}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshAlert}
          disabled={isSearching}
          className="mt-2 bg-transparent"
        >
          <RefreshCw
            className={cn('mr-2 h-4 w-4', isSearching && 'animate-spin')}
          />
          Check for updates
        </Button>
      </CardContent>
    </Card>
  )
}

function WelcomeMessage() {
  const { userSettings } = useApp()
  const hasProfile = userSettings.profile?.isConfigured

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex min-h-[300px] flex-col items-center justify-center gap-4 text-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
        >
          <MapPin className="h-12 w-12 text-primary" />
        </motion.div>
        <div>
          <h3
            className={cn(
              'font-semibold text-foreground',
              userSettings.largeText ? 'text-2xl' : 'text-xl'
            )}
          >
            Welcome to ClearAlert
          </h3>
          <p
            className={cn(
              'mt-2 text-muted-foreground max-w-md',
              userSettings.largeText ? 'text-lg' : 'text-base'
            )}
          >
            Enter any location worldwide to check for active weather alerts and
            emergency notifications. We support Canada, USA, Europe, and global disaster alerts.
          </p>
        </div>
        
        {!hasProfile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-2 p-4 rounded-lg bg-primary/5 border border-primary/20 max-w-sm"
          >
            <p className={cn('text-muted-foreground', userSettings.largeText ? 'text-sm' : 'text-xs')}>
              <Sparkles className="inline h-4 w-4 text-primary mr-1" />
              <Link href="/settings" className="text-primary hover:underline font-medium">
                Set up your profile
              </Link>{' '}
              to receive personalized emergency advice tailored to your needs
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

export function AlertDashboard() {
  const {
    alerts,
    isSearching,
    isOffline,
    refreshAlert,
    userSettings,
    location,
    statusMessage,
  } = useApp()
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(
    new Set([alerts[0]?.id])
  )

  const toggleAlert = (id: string) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Loading state
  if (isSearching) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex min-h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            />
            <p className="text-muted-foreground">Searching for alerts...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No location entered yet
  if (!location) {
    return <WelcomeMessage />
  }

  // Location searched but no alerts
  if (location && alerts.length === 0) {
    return <NoAlertsMessage />
  }

  // Has alerts
  return (
    <Card className="border-border bg-card overflow-hidden">
      {isOffline && (
        <div className="bg-severity-moderate/20 px-4 py-2 text-center text-sm text-severity-moderate">
          Offline Mode - Showing cached data
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle
              className={cn(
                'font-medium text-muted-foreground',
                userSettings.largeText ? 'text-lg' : 'text-base'
              )}
            >
              Active Alerts
            </CardTitle>
            {statusMessage && (
              <p
                className={cn(
                  'text-foreground mt-1',
                  userSettings.largeText ? 'text-base' : 'text-sm'
                )}
              >
                {statusMessage}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshAlert}
            disabled={isOffline || isSearching}
          >
            <RefreshCw
              className={cn('h-4 w-4', isSearching && 'animate-spin')}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {alerts.map((alert, index) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                isExpanded={expandedAlerts.has(alert.id)}
                onToggle={() => toggleAlert(alert.id)}
                isPrimary={index === 0}
              />
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
