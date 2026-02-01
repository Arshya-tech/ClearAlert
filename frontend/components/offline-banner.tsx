'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/context'
import { WifiOff, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function OfflineBanner() {
  const { isOffline, cachedData, userSettings } = useApp()
  const { reducedMotion, largeText } = userSettings

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={reducedMotion ? {} : { height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={reducedMotion ? {} : { height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-severity-moderate/20 border-b border-severity-moderate/30">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-center gap-3">
                <WifiOff className="h-5 w-5 text-severity-moderate" />
                <div className="text-center">
                  <p
                    className={cn(
                      'font-medium text-severity-moderate',
                      largeText ? 'text-base' : 'text-sm'
                    )}
                  >
                    Offline Mode Active
                  </p>
                  {cachedData && (
                    <p
                      className={cn(
                        'text-severity-moderate/80 flex items-center justify-center gap-1',
                        largeText ? 'text-sm' : 'text-xs'
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      Last updated:{' '}
                      {new Date(cachedData.lastCached).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
