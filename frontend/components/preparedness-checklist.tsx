'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useApp } from '@/lib/context'
import { cn } from '@/lib/utils'
import {
  ClipboardList,
  Droplets,
  Utensils,
  FileStack,
  Radio,
  Flashlight,
  Heart,
  ChevronDown,
  Pill,
  Baby,
  Dog,
  Accessibility,
  Sparkles,
} from 'lucide-react'
import type { AgeGroup, HouseholdType, SpecialCondition } from '@/lib/types'

interface ChecklistItem {
  id: string
  title: string
  description: string
  category: string
  forAgeGroups?: AgeGroup[]
  forHouseholds?: HouseholdType[]
  forConditions?: SpecialCondition[]
  isPersonalized?: boolean
}

const baseChecklist: ChecklistItem[] = [
  {
    id: '1',
    title: 'Water Supply',
    description: 'One gallon per person per day for at least 3 days',
    category: 'supplies',
  },
  {
    id: '2',
    title: 'Non-perishable Food',
    description: 'At least a 3-day supply of food that does not require cooking',
    category: 'supplies',
  },
  {
    id: '3',
    title: 'Battery-powered Radio',
    description: 'With extra batteries to receive emergency broadcasts',
    category: 'communication',
  },
  {
    id: '4',
    title: 'Flashlight',
    description: 'With extra batteries for power outages',
    category: 'supplies',
  },
  {
    id: '5',
    title: 'First Aid Kit',
    description: 'Include bandages, antiseptic, medications, and emergency contacts',
    category: 'medical',
  },
  {
    id: '6',
    title: 'Important Documents',
    description: 'Copies of IDs, insurance policies, and bank records in waterproof container',
    category: 'documents',
  },
  {
    id: '7',
    title: 'Emergency Contacts',
    description: 'Written list of family, neighbors, and local emergency numbers',
    category: 'communication',
  },
]

const personalizedItems: ChecklistItem[] = [
  // Medical needs
  {
    id: 'med-1',
    title: 'Prescription Medications',
    description: 'At least 2 weeks supply of all prescription medications',
    category: 'medical',
    forConditions: ['medical-needs'],
    isPersonalized: true,
  },
  {
    id: 'med-2',
    title: 'Medical Equipment Backup',
    description: 'Backup power or batteries for essential medical devices',
    category: 'medical',
    forConditions: ['medical-needs'],
    isPersonalized: true,
  },
  {
    id: 'med-3',
    title: 'Medical Information Card',
    description: 'List of medications, allergies, and emergency medical contacts',
    category: 'medical',
    forConditions: ['medical-needs'],
    isPersonalized: true,
  },
  
  // Mobility issues
  {
    id: 'mob-1',
    title: 'Evacuation Plan',
    description: 'Written plan for how to evacuate with mobility aids',
    category: 'documents',
    forConditions: ['mobility-issues'],
    isPersonalized: true,
  },
  {
    id: 'mob-2',
    title: 'Emergency Registry',
    description: 'Register with local emergency services for evacuation assistance',
    category: 'communication',
    forConditions: ['mobility-issues'],
    isPersonalized: true,
  },
  
  // Hearing impaired
  {
    id: 'hear-1',
    title: 'Visual Alert System',
    description: 'Flashing light alerts for smoke/emergency alarms',
    category: 'communication',
    forConditions: ['hearing-impaired'],
    isPersonalized: true,
  },
  {
    id: 'hear-2',
    title: 'Backup Hearing Aid Batteries',
    description: 'Extra batteries or charging equipment for hearing devices',
    category: 'medical',
    forConditions: ['hearing-impaired'],
    isPersonalized: true,
  },
  
  // Vision impaired
  {
    id: 'vis-1',
    title: 'Tactile Emergency Supplies',
    description: 'Label emergency supplies with braille or tactile markers',
    category: 'supplies',
    forConditions: ['vision-impaired'],
    isPersonalized: true,
  },
  {
    id: 'vis-2',
    title: 'Audio Emergency Radio',
    description: 'Battery-powered radio with audio announcements',
    category: 'communication',
    forConditions: ['vision-impaired'],
    isPersonalized: true,
  },
  
  // Young children
  {
    id: 'child-1',
    title: 'Baby Supplies',
    description: 'Formula, diapers, wipes, and baby food for at least 3 days',
    category: 'supplies',
    forConditions: ['young-children'],
    isPersonalized: true,
  },
  {
    id: 'child-2',
    title: 'Comfort Items',
    description: 'Favorite toys, blankets, or stuffed animals for comfort',
    category: 'supplies',
    forConditions: ['young-children'],
    isPersonalized: true,
  },
  {
    id: 'child-3',
    title: 'Child ID Cards',
    description: 'Photos and ID info for each child in case of separation',
    category: 'documents',
    forConditions: ['young-children'],
    forHouseholds: ['small-family', 'large-family'],
    isPersonalized: true,
  },
  
  // Pets
  {
    id: 'pet-1',
    title: 'Pet Food & Water',
    description: 'At least 3 days of pet food, treats, and water',
    category: 'supplies',
    forConditions: ['pets'],
    isPersonalized: true,
  },
  {
    id: 'pet-2',
    title: 'Pet Medications',
    description: 'Any prescription medications your pet needs',
    category: 'medical',
    forConditions: ['pets'],
    isPersonalized: true,
  },
  {
    id: 'pet-3',
    title: 'Pet Carrier & Leash',
    description: 'Secure carriers for each pet and extra leashes',
    category: 'supplies',
    forConditions: ['pets'],
    isPersonalized: true,
  },
  {
    id: 'pet-4',
    title: 'Pet-Friendly Shelter List',
    description: 'List of evacuation shelters that accept pets',
    category: 'documents',
    forConditions: ['pets'],
    isPersonalized: true,
  },
  
  // Elderly care
  {
    id: 'elder-1',
    title: 'Caregiver Contact List',
    description: 'Contact info for doctors, home care aides, and family',
    category: 'communication',
    forConditions: ['elderly-care'],
    isPersonalized: true,
  },
  {
    id: 'elder-2',
    title: 'Comfort Items for Seniors',
    description: 'Reading glasses, dentures, hearing aids with extra batteries',
    category: 'medical',
    forConditions: ['elderly-care'],
    isPersonalized: true,
  },
  
  // Senior-specific
  {
    id: 'senior-1',
    title: 'Medication Organizer',
    description: 'Pre-sorted medications in clearly labeled containers',
    category: 'medical',
    forAgeGroups: ['senior'],
    isPersonalized: true,
  },
  {
    id: 'senior-2',
    title: 'Easy-Open Food Containers',
    description: 'Emergency food in containers that are easy to open',
    category: 'supplies',
    forAgeGroups: ['senior'],
    isPersonalized: true,
  },
  
  // Student-specific
  {
    id: 'student-1',
    title: 'Campus Emergency Plan',
    description: 'Know your campus evacuation routes and shelter locations',
    category: 'documents',
    forAgeGroups: ['student'],
    isPersonalized: true,
  },
  {
    id: 'student-2',
    title: 'Portable Phone Charger',
    description: 'Keep a charged power bank in your bag at all times',
    category: 'communication',
    forAgeGroups: ['student'],
    isPersonalized: true,
  },
  
  // Family-specific
  {
    id: 'family-1',
    title: 'Family Communication Plan',
    description: 'Designated meeting places and out-of-area emergency contact',
    category: 'communication',
    forHouseholds: ['small-family', 'large-family'],
    isPersonalized: true,
  },
  {
    id: 'family-2',
    title: 'Entertainment for Kids',
    description: 'Books, games, or activities to keep children occupied',
    category: 'supplies',
    forHouseholds: ['small-family', 'large-family'],
    isPersonalized: true,
  },
]

const categoryIcons: Record<string, typeof Droplets> = {
  supplies: Droplets,
  communication: Radio,
  medical: Heart,
  documents: FileStack,
}

function getCategoryIcon(category: string) {
  return categoryIcons[category] || Utensils
}

export function PreparednessChecklist() {
  const { userSettings } = useApp()
  const { largeText, reducedMotion, profile } = userSettings
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [isExpanded, setIsExpanded] = useState(true)

  // Build personalized checklist based on user profile
  const checklist = useMemo(() => {
    const items = [...baseChecklist]
    
    if (profile?.isConfigured) {
      personalizedItems.forEach((item) => {
        let shouldInclude = false
        
        // Check age group match
        if (item.forAgeGroups && profile.ageGroup) {
          if (item.forAgeGroups.includes(profile.ageGroup)) {
            shouldInclude = true
          }
        }
        
        // Check household match
        if (item.forHouseholds && profile.householdType) {
          if (item.forHouseholds.includes(profile.householdType)) {
            shouldInclude = true
          }
        }
        
        // Check special conditions match
        if (item.forConditions && profile.specialConditions?.length > 0) {
          if (item.forConditions.some((c) => profile.specialConditions.includes(c))) {
            shouldInclude = true
          }
        }
        
        if (shouldInclude) {
          items.push(item)
        }
      })
    }
    
    return items
  }, [profile])

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedItems(newChecked)
  }

  const progress = Math.round((checkedItems.size / checklist.length) * 100)
  const personalizedCount = checklist.filter((i) => i.isPersonalized).length

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
              <ClipboardList className="h-5 w-5" />
              Preparedness Checklist
            </CardTitle>
            {personalizedCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Personalized
              </Badge>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </button>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className={cn('text-muted-foreground', largeText ? 'text-sm' : 'text-xs')}>
              Progress
            </span>
            <span className={cn('font-medium text-foreground', largeText ? 'text-sm' : 'text-xs')}>
              {checkedItems.size}/{checklist.length} items
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
            />
          </div>
        </div>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={reducedMotion ? {} : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reducedMotion ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <div className="space-y-3">
                {checklist.map((item, index) => {
                  const Icon = getCategoryIcon(item.category)
                  const isChecked = checkedItems.has(item.id)

                  return (
                    <motion.div
                      key={item.id}
                      initial={reducedMotion ? {} : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: reducedMotion ? 0 : index * 0.03 }}
                      className={cn(
                        'flex items-start gap-3 rounded-lg p-3 transition-colors',
                        isChecked ? 'bg-primary/10' : 'bg-secondary/30',
                        item.isPersonalized && !isChecked && 'ring-1 ring-primary/20'
                      )}
                    >
                      <Checkbox
                        id={item.id}
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon
                            className={cn(
                              'h-4 w-4',
                              isChecked ? 'text-primary' : 'text-muted-foreground'
                            )}
                          />
                          <label
                            htmlFor={item.id}
                            className={cn(
                              'font-medium cursor-pointer transition-colors',
                              isChecked
                                ? 'text-primary line-through'
                                : 'text-foreground',
                              largeText ? 'text-base' : 'text-sm'
                            )}
                          >
                            {item.title}
                          </label>
                          {item.isPersonalized && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary/80">
                              For You
                            </Badge>
                          )}
                        </div>
                        <p
                          className={cn(
                            'mt-1 text-muted-foreground',
                            largeText ? 'text-sm' : 'text-xs'
                          )}
                        >
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              
              {!profile?.isConfigured && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20"
                >
                  <p className={cn('text-center text-muted-foreground', largeText ? 'text-sm' : 'text-xs')}>
                    <Sparkles className="inline h-4 w-4 text-primary mr-1" />
                    <a href="/settings" className="text-primary hover:underline font-medium">
                      Set up your profile
                    </a>{' '}
                    to get a personalized checklist based on your needs
                  </p>
                </motion.div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
