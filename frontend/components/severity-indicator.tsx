'use client'

import { motion } from 'framer-motion'
import type { AlertSeverity, AlertType } from '@/lib/types'
import {
  CloudLightning,
  Wind,
  Droplets,
  Flame,
  Snowflake,
  Thermometer,
  AlertTriangle,
  Mountain,
  Waves,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SeverityIndicatorProps {
  severity: AlertSeverity
  type: AlertType
  size?: 'sm' | 'md' | 'lg'
  showPulse?: boolean
}

const severityConfig: Record<
  AlertSeverity,
  { color: string; bgColor: string; label: string }
> = {
  low: {
    color: 'text-severity-low',
    bgColor: 'bg-severity-low/20',
    label: 'Low',
  },
  moderate: {
    color: 'text-severity-moderate',
    bgColor: 'bg-severity-moderate/20',
    label: 'Moderate',
  },
  severe: {
    color: 'text-severity-severe',
    bgColor: 'bg-severity-severe/20',
    label: 'Severe',
  },
  extreme: {
    color: 'text-severity-extreme',
    bgColor: 'bg-severity-extreme/20',
    label: 'Extreme',
  },
}

const alertIcons: Record<AlertType, typeof CloudLightning> = {
  tornado: Wind,
  hurricane: Wind,
  flood: Droplets,
  thunderstorm: CloudLightning,
  blizzard: Snowflake,
  heat: Thermometer,
  wildfire: Flame,
  earthquake: Mountain,
  winter: Snowflake,
  wind: Wind,
  fire: Flame,
  coastal: Waves,
  other: AlertTriangle,
}

const sizeConfig = {
  sm: { container: 'w-16 h-16', icon: 24 },
  md: { container: 'w-24 h-24', icon: 40 },
  lg: { container: 'w-32 h-32', icon: 56 },
}

export function SeverityIndicator({
  severity,
  type,
  size = 'lg',
  showPulse = true,
}: SeverityIndicatorProps) {
  const config = severityConfig[severity]
  const Icon = alertIcons[type] || AlertTriangle
  const { container, icon } = sizeConfig[size]

  return (
    <div className="relative flex items-center justify-center">
      {showPulse && (severity === 'severe' || severity === 'extreme') && (
        <motion.div
          className={cn(
            'absolute rounded-full',
            container,
            config.bgColor
          )}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: severity === 'extreme' ? 1 : 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      )}
      <motion.div
        className={cn(
          'relative flex items-center justify-center rounded-full',
          container,
          config.bgColor
        )}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <Icon className={cn(config.color)} size={icon} strokeWidth={1.5} />
      </motion.div>
    </div>
  )
}

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const config = severityConfig[severity]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
        config.bgColor,
        config.color
      )}
    >
      <span
        className={cn('h-2 w-2 rounded-full', config.color.replace('text-', 'bg-'))}
      />
      {config.label}
    </span>
  )
}
