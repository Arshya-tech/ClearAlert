'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Snowflake, AlertTriangle, Radio, Check, Loader2, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const BACKEND_URL = 'http://localhost:8000/simulate'

type Language = 'en' | 'es'
type AlertLevel = 'severe' | 'moderate' | null

interface AlertStatus {
  type: AlertLevel
  success: boolean
  message: string
}

export default function StatusPage() {
  const [language, setLanguage] = useState<Language>('en')
  const [isLoading, setIsLoading] = useState<AlertLevel>(null)
  const [alertStatus, setAlertStatus] = useState<AlertStatus | null>(null)

  const sendAlert = async (level: 'severe' | 'moderate') => {
    setIsLoading(level)
    setAlertStatus(null)

    const heatIndex = level === 'severe' ? 45 : 33

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heat_index: heatIndex,
          language: language,
        }),
      })

      if (response.ok) {
        setAlertStatus({
          type: level,
          success: true,
          message: level === 'severe' 
            ? 'Severe alert broadcasted successfully' 
            : 'Moderate alert broadcasted successfully',
        })
      } else {
        setAlertStatus({
          type: level,
          success: false,
          message: 'Failed to broadcast alert. Check backend connection.',
        })
      }
    } catch {
      setAlertStatus({
        type: level,
        success: false,
        message: 'Connection error. Ensure the Raspberry Pi backend is running.',
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground text-lg">ClearAlert</h1>
                <p className="text-muted-foreground text-xs">Emergency Intelligence System</p>
              </div>
            </Link>

            {/* Language Selector */}
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
              <SelectTrigger className="w-[140px] bg-secondary border-border">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-8">
          {/* Title Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 rgba(239, 68, 68, 0)',
                    '0 0 0 8px rgba(239, 68, 68, 0.1)',
                    '0 0 0 0 rgba(239, 68, 68, 0)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10"
              >
                <Radio className="h-8 w-8 text-destructive" />
              </motion.div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              ClearAlert
            </h1>
            <p className="text-xl text-primary font-medium">
              Live Emergency Status Demo
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Trigger emergency alerts to test Raspberry Pi audio broadcast system
            </p>
          </motion.div>

          {/* Alert Buttons */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Severe Alert Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className={cn(
                  "border-2 border-red-500/30 bg-red-950/20 overflow-hidden transition-all duration-300",
                  "hover:border-red-500/60 hover:bg-red-950/30 hover:shadow-lg hover:shadow-red-500/10"
                )}
              >
                <CardContent className="p-0">
                  <Button
                    onClick={() => sendAlert('severe')}
                    disabled={isLoading !== null}
                    className={cn(
                      "w-full h-auto py-8 px-6 rounded-none",
                      "bg-gradient-to-br from-red-600 to-red-700",
                      "hover:from-red-500 hover:to-red-600",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-all duration-300 group"
                    )}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <div className="absolute inset-0 bg-red-400/30 rounded-full blur-xl group-hover:bg-red-400/50 transition-colors" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20 border-2 border-red-400/50">
                          {isLoading === 'severe' ? (
                            <Loader2 className="h-10 w-10 text-red-100 animate-spin" />
                          ) : (
                            <Snowflake className="h-10 w-10 text-red-100" />
                          )}
                        </div>
                      </motion.div>
                      <div className="space-y-1 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-red-300 animate-pulse" />
                          <span className="text-xl font-bold text-red-50">Severe Snowstorm Alert</span>
                        </div>
                        <p className="text-sm text-red-200/80">
                          Heat Index: 45 | Critical Emergency
                        </p>
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Moderate Alert Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                className={cn(
                  "border-2 border-yellow-500/30 bg-yellow-950/20 overflow-hidden transition-all duration-300",
                  "hover:border-yellow-500/60 hover:bg-yellow-950/30 hover:shadow-lg hover:shadow-yellow-500/10"
                )}
              >
                <CardContent className="p-0">
                  <Button
                    onClick={() => sendAlert('moderate')}
                    disabled={isLoading !== null}
                    className={cn(
                      "w-full h-auto py-8 px-6 rounded-none",
                      "bg-gradient-to-br from-yellow-600 to-amber-700",
                      "hover:from-yellow-500 hover:to-amber-600",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "transition-all duration-300 group"
                    )}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: 'spring', stiffness: 400 }}
                      >
                        <div className="absolute inset-0 bg-yellow-400/30 rounded-full blur-xl group-hover:bg-yellow-400/50 transition-colors" />
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500/20 border-2 border-yellow-400/50">
                          {isLoading === 'moderate' ? (
                            <Loader2 className="h-10 w-10 text-yellow-100 animate-spin" />
                          ) : (
                            <Snowflake className="h-10 w-10 text-yellow-100" />
                          )}
                        </div>
                      </motion.div>
                      <div className="space-y-1 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="h-3 w-3 rounded-full bg-yellow-300 animate-pulse" />
                          <span className="text-xl font-bold text-yellow-50">Moderate Snowstorm Alert</span>
                        </div>
                        <p className="text-sm text-yellow-200/80">
                          Heat Index: 33 | Weather Advisory
                        </p>
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Status Message */}
          <AnimatePresence mode="wait">
            {alertStatus && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Card 
                  className={cn(
                    "border",
                    alertStatus.success 
                      ? "border-green-500/30 bg-green-950/20" 
                      : "border-red-500/30 bg-red-950/20"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          alertStatus.success 
                            ? "bg-green-500/20" 
                            : "bg-red-500/20"
                        )}
                      >
                        {alertStatus.success ? (
                          <Check className={cn("h-5 w-5", "text-green-400")} />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p 
                          className={cn(
                            "font-medium",
                            alertStatus.success ? "text-green-300" : "text-red-300"
                          )}
                        >
                          {alertStatus.message}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Language: {language === 'en' ? 'English' : 'Spanish'} | 
                          Level: {alertStatus.type === 'severe' ? 'Severe' : 'Moderate'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <Card className="border-border bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Hackathon Demo Mode | Raspberry Pi Audio Broadcast System</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
