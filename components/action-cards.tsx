'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/context'
import { Card, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import { Home, Shield, Radio, Battery, Droplets, Wind, Car, Phone, Flashlight, FileStack as FirstAid, ChevronDown, Info, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const iconMap: Record<string, typeof Home> = {
  home: Home,
  shelter: Home,
  shield: Shield,
  radio: Radio,
  battery: Battery,
  water: Droplets,
  wind: Wind,
  car: Car,
  phone: Phone,
  flashlight: Flashlight,
  firstaid: FirstAid,
  default: Info,
}

function getIcon(iconName: string) {
  return iconMap[iconName.toLowerCase()] || iconMap.default
}

interface ActionCardItemProps {
  icon: string
  instruction: string
  whyItMatters: string
  index: number
  reducedMotion: boolean
  largeText: boolean
  isPersonalized?: boolean
}

function ActionCardItem({
  icon,
  instruction,
  whyItMatters,
  index,
  reducedMotion,
  largeText,
  isPersonalized,
}: ActionCardItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = getIcon(icon)

  return (
    <motion.div
      initial={reducedMotion ? {} : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: reducedMotion ? 0 : index * 0.1, duration: 0.3 }}
    >
      <Card className={cn(
        "border-border bg-secondary/50 hover:bg-secondary/80 transition-colors",
        isPersonalized && "ring-1 ring-primary/30"
      )}>
        <CardContent className="p-4">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p
                      className={cn(
                        'font-medium text-foreground leading-relaxed',
                        largeText ? 'text-lg' : 'text-base'
                      )}
                    >
                      {instruction}
                    </p>
                    {isPersonalized && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary/80 flex-shrink-0">
                        For You
                      </Badge>
                    )}
                  </div>
                  {whyItMatters && (
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        aria-label={isOpen ? 'Hide details' : 'Show why this matters'}
                      >
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-5 w-5" />
                        </motion.div>
                      </button>
                    </CollapsibleTrigger>
                  )}
                </div>
                <AnimatePresence>
                  {whyItMatters && (
                    <CollapsibleContent forceMount>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-md bg-accent/50 p-3">
                          <p
                            className={cn(
                              'text-muted-foreground',
                              largeText ? 'text-base' : 'text-sm'
                            )}
                          >
                            <span className="font-medium text-foreground">
                              Why this matters:{' '}
                            </span>
                            {whyItMatters}
                          </p>
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Collapsible>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ActionCards() {
  const { actionCards, currentAlert, isSearching, userSettings, location } = useApp()
  const { reducedMotion, largeText } = userSettings

  // Don't show anything if no location is searched yet
  if (!location) {
    return null
  }

  if (isSearching) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!currentAlert || actionCards.length === 0) {
    return null
  }

  const hasPersonalizedActions = actionCards.some((card) => card.priority > 3)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <h3 className={cn('font-semibold text-foreground', largeText ? 'text-xl' : 'text-lg')}>
          Recommended Actions
        </h3>
        {hasPersonalizedActions && (
          <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Personalized
          </Badge>
        )}
      </div>
      {actionCards
        .sort((a, b) => a.priority - b.priority)
        .map((card, index) => (
          <ActionCardItem
            key={card.id}
            icon={card.icon}
            instruction={card.instruction}
            whyItMatters={card.whyItMatters}
            index={index}
            reducedMotion={reducedMotion}
            largeText={largeText}
            isPersonalized={card.priority > 3}
          />
        ))}
    </div>
  )
}
