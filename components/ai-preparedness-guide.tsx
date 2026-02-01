'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useApp } from '@/lib/context'
import { cn } from '@/lib/utils'
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Bot,
} from 'lucide-react'

const PROFILE_STORAGE_KEY = 'clearalert-user-profile'

function loadUserProfile() {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

// Fallback static advice for when Gemini fails
const FALLBACK_ADVICE: Record<string, { explanation: string; checklist: string[] }> = {
  winter: {
    explanation: 'A winter weather alert indicates potentially hazardous conditions including snow, ice, or extreme cold. Stay informed and prepare for reduced mobility and possible power outages.',
    checklist: [
      'Stock up on essential supplies including food, water, and medications',
      'Keep warm clothing and blankets readily accessible',
      'Check heating systems and have backup heat sources ready',
      'Charge all devices and keep flashlights with fresh batteries',
      'Avoid unnecessary travel until conditions improve',
    ],
  },
  heat: {
    explanation: 'A heat alert means temperatures are dangerously high and could pose health risks. Stay hydrated and limit outdoor activities during peak heat hours.',
    checklist: [
      'Drink plenty of water throughout the day',
      'Stay in air-conditioned spaces when possible',
      'Avoid strenuous outdoor activities between 10am-4pm',
      'Check on elderly neighbors and family members',
      'Never leave children or pets in parked vehicles',
    ],
  },
  flood: {
    explanation: 'A flood warning indicates rising water levels that may affect your area. Move to higher ground if necessary and avoid walking or driving through floodwaters.',
    checklist: [
      'Move important documents and valuables to higher floors',
      'Prepare an emergency go-bag with essentials',
      'Never walk or drive through flooded areas',
      'Know your evacuation route and shelter locations',
      'Turn off utilities if instructed by authorities',
    ],
  },
  tornado: {
    explanation: 'A tornado warning means a tornado has been sighted or indicated by radar. Seek shelter immediately in the lowest, most interior room of a sturdy building.',
    checklist: [
      'Move immediately to your designated safe room or basement',
      'Stay away from windows, doors, and exterior walls',
      'Cover yourself with blankets or a mattress for protection',
      'Keep emergency supplies including water and first aid kit nearby',
      'Listen to local news for updates and all-clear announcements',
    ],
  },
  default: {
    explanation: 'An emergency alert has been issued for your area. Stay informed through official channels and follow guidance from local authorities.',
    checklist: [
      'Stay tuned to local news and emergency broadcasts',
      'Ensure your phone is charged for emergency communications',
      'Have essential supplies ready including water, food, and medications',
      'Know your evacuation routes and meeting points',
      'Check on family members and neighbors who may need assistance',
    ],
  },
}

interface ParsedContent {
  explanation: string
  checklist: string[]
}

function parseGeminiResponse(content: string): ParsedContent {
  const result: ParsedContent = {
    explanation: '',
    checklist: [],
  }

  // Extract explanation
  const explanationMatch = content.match(/## What This Means\n([\s\S]*?)(?=##|$)/)
  if (explanationMatch) {
    result.explanation = explanationMatch[1].trim()
  }

  // Extract checklist items
  const checklistMatch = content.match(/## Your Personalized Checklist\n([\s\S]*?)(?=##|$)/)
  if (checklistMatch) {
    const items = checklistMatch[1]
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.replace(/^-\s*/, '').trim())
      .filter((item) => item.length > 0)
    result.checklist = items
  }

  // Fallback parsing if headers not found
  if (!result.explanation && !result.checklist.length) {
    const lines = content.split('\n').filter((l) => l.trim())
    result.explanation = lines.slice(0, 2).join(' ')
    result.checklist = lines
      .slice(2)
      .filter((l) => l.includes('-'))
      .map((l) => l.replace(/^[*-]\s*/, '').trim())
      .slice(0, 5)
  }

  return result
}

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let index = 0
    setDisplayedText('')
    setIsComplete(false)

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsComplete(true)
        onComplete?.()
        clearInterval(interval)
      }
    }, 15)

    return () => clearInterval(interval)
  }, [text, onComplete])

  return (
    <span>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
        />
      )}
    </span>
  )
}

export function AIPreparednessGuide() {
  const { currentAlert, location, userSettings } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState<ParsedContent | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [showTypewriter, setShowTypewriter] = useState(false)
  const [typewriterComplete, setTypewriterComplete] = useState(false)

  const fetchGeminiContent = useCallback(async () => {
    if (!currentAlert) return

    setIsLoading(true)
    setError(null)
    setContent(null)
    setShowTypewriter(false)
    setTypewriterComplete(false)

    const userProfile = loadUserProfile()

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType: currentAlert.title || currentAlert.type,
          severity: currentAlert.severity,
          userProfile,
          location: location?.displayName || currentAlert.location,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch AI guidance')
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const parsed = parseGeminiResponse(data.content)
      setContent(parsed)
      setShowTypewriter(true)
    } catch (err) {
      console.error('Gemini API error:', err)
      setError('AI guidance unavailable. Showing general advice.')
      
      // Show fallback content
      const fallbackKey = currentAlert.type as keyof typeof FALLBACK_ADVICE
      const fallback = FALLBACK_ADVICE[fallbackKey] || FALLBACK_ADVICE.default
      setContent(fallback)
      setTypewriterComplete(true)
    } finally {
      setIsLoading(false)
    }
  }, [currentAlert, location])

  // Fetch content when alert changes
  useEffect(() => {
    if (currentAlert) {
      fetchGeminiContent()
    } else {
      setContent(null)
    }
  }, [currentAlert, fetchGeminiContent])

  // Don't render if no alert
  if (!currentAlert || !location) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-border bg-gradient-to-br from-primary/5 via-card to-primary/10 overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <span className={cn('text-foreground', userSettings.largeText ? 'text-lg' : 'text-base')}>
                AI Preparedness Guide
              </span>
              <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-normal">
                Powered by Gemini
              </span>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={fetchGeminiContent}
                disabled={isLoading}
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="pt-2">
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <motion.div
                      className="flex items-center gap-3"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">Generating personalized guidance...</span>
                    </motion.div>
                  </div>
                )}

                

                {content && !isLoading && (
                  <div className="space-y-4">
                    {/* Explanation */}
                    <div>
                      <h4 className={cn(
                        'font-medium text-foreground mb-2 flex items-center gap-2',
                        userSettings.largeText ? 'text-base' : 'text-sm'
                      )}>
                        <Sparkles className="h-4 w-4 text-primary" />
                        What This Means
                      </h4>
                      <p className={cn(
                        'text-muted-foreground leading-relaxed',
                        userSettings.largeText ? 'text-base' : 'text-sm'
                      )}>
                        {showTypewriter && !typewriterComplete ? (
                          <TypewriterText
                            text={content.explanation}
                            onComplete={() => setTypewriterComplete(true)}
                          />
                        ) : (
                          content.explanation
                        )}
                      </p>
                    </div>

                    {/* Checklist */}
                    {(typewriterComplete || !showTypewriter) && content.checklist.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 className={cn(
                          'font-medium text-foreground mb-3 flex items-center gap-2',
                          userSettings.largeText ? 'text-base' : 'text-sm'
                        )}>
                          <CheckCircle2 className="h-4 w-4 text-status-online" />
                          Your Personalized Checklist
                        </h4>
                        <ul className="space-y-2">
                          {content.checklist.map((item, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={cn(
                                'flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50',
                                userSettings.largeText ? 'text-base' : 'text-sm'
                              )}
                            >
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-medium flex-shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span className="text-foreground leading-relaxed">{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}

                    {/* Profile hint */}
                    {!userSettings.profile?.isConfigured && (typewriterComplete || !showTypewriter) && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50"
                      >
                        <a href="/settings" className="text-primary hover:underline">
                          Set up your profile
                        </a>{' '}
                        for more personalized guidance
                      </motion.p>
                    )}
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
