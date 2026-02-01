'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/lib/context'
import { testDevice } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Cpu,
  Wifi,
  WifiOff,
  Clock,
  Activity,
  Lightbulb,
  Volume2,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function HeartbeatIndicator({ isOnline, reducedMotion }: { isOnline: boolean; reducedMotion: boolean }) {
  return (
    <div className="relative flex items-center justify-center">
      {isOnline && !reducedMotion && (
        <motion.div
          className="absolute h-4 w-4 rounded-full bg-status-online"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      )}
      <div
        className={cn(
          'relative h-3 w-3 rounded-full',
          isOnline ? 'bg-status-online' : 'bg-status-offline'
        )}
      />
    </div>
  )
}

export function DevicePanel() {
  const { deviceStatus, refreshDeviceStatus, isOffline, userSettings } = useApp()
  const { reducedMotion, largeText } = userSettings
  const [testingLed, setTestingLed] = useState(false)
  const [testingAudio, setTestingAudio] = useState(false)
  const [testResult, setTestResult] = useState<{
    type: 'led' | 'audio'
    success: boolean
  } | null>(null)

  const handleTestLed = async () => {
    if (isOffline) return
    setTestingLed(true)
    setTestResult(null)
    try {
      const result = await testDevice('led')
      setTestResult({ type: 'led', success: result.success })
    } catch {
      setTestResult({ type: 'led', success: false })
    } finally {
      setTestingLed(false)
    }
  }

  const handleTestAudio = async () => {
    if (isOffline) return
    setTestingAudio(true)
    setTestResult(null)
    try {
      const result = await testDevice('audio')
      setTestResult({ type: 'audio', success: result.success })
    } catch {
      setTestResult({ type: 'audio', success: false })
    } finally {
      setTestingAudio(false)
    }
  }

  const isDeviceOnline = deviceStatus?.isOnline ?? false
  const alertModeLabel = {
    active: 'Active Monitoring',
    standby: 'Standby',
    test: 'Test Mode',
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
            <Cpu className="h-5 w-5" />
            Device Control
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshDeviceStatus}
            disabled={isOffline}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device Status */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
              {isDeviceOnline ? (
                <Wifi className="h-5 w-5 text-status-online" />
              ) : (
                <WifiOff className="h-5 w-5 text-status-offline" />
              )}
            </div>
            <div>
              <p className={cn('font-medium text-foreground', largeText ? 'text-base' : 'text-sm')}>
                Raspberry Pi Status
              </p>
              <div className="flex items-center gap-2 mt-1">
                <HeartbeatIndicator isOnline={isDeviceOnline} reducedMotion={reducedMotion} />
                <span
                  className={cn(
                    isDeviceOnline ? 'text-status-online' : 'text-status-offline',
                    largeText ? 'text-sm' : 'text-xs'
                  )}
                >
                  {isDeviceOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Details */}
        {deviceStatus && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className={cn('text-muted-foreground', largeText ? 'text-sm' : 'text-xs')}>
                  Last Sync
                </p>
                <p className={cn('font-medium text-foreground', largeText ? 'text-base' : 'text-sm')}>
                  {formatTime(deviceStatus.lastSyncTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-secondary/30 p-3">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className={cn('text-muted-foreground', largeText ? 'text-sm' : 'text-xs')}>
                  Alert Mode
                </p>
                <p className={cn('font-medium text-foreground', largeText ? 'text-base' : 'text-sm')}>
                  {alertModeLabel[deviceStatus.alertMode]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Controls */}
        <div className="space-y-3">
          <h4 className={cn('font-medium text-foreground', largeText ? 'text-base' : 'text-sm')}>
            Test Hardware
          </h4>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleTestLed}
              disabled={isOffline || testingLed || !isDeviceOnline}
            >
              {testingLed ? (
                <motion.div
                  className="mr-2 h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Test LED
            </Button>
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={handleTestAudio}
              disabled={isOffline || testingAudio || !isDeviceOnline}
            >
              {testingAudio ? (
                <motion.div
                  className="mr-2 h-4 w-4 rounded-full border-2 border-primary border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
                />
              ) : (
                <Volume2 className="mr-2 h-4 w-4" />
              )}
              Test Audio
            </Button>
          </div>
          {testResult && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'text-center',
                testResult.success ? 'text-status-online' : 'text-status-offline',
                largeText ? 'text-sm' : 'text-xs'
              )}
            >
              {testResult.type === 'led' ? 'LED' : 'Audio'} test{' '}
              {testResult.success ? 'successful' : 'failed'}
            </motion.p>
          )}
        </div>

        {isOffline && (
          <p className="text-center text-sm text-severity-moderate">
            Device controls unavailable while offline
          </p>
        )}
      </CardContent>
    </Card>
  )
}
