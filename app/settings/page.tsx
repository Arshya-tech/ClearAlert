'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import {
  Shield,
  ArrowLeft,
  User,
  Users,
  Heart,
  GraduationCap,
  Briefcase,
  Clock,
  Home,
  Baby,
  Dog,
  Accessibility,
  Eye,
  Ear,
  Pill,
  Check,
  Sparkles,
} from 'lucide-react'
import type {
  UserProfile,
  AgeGroup,
  Gender,
  HouseholdType,
  SpecialCondition,
} from '@/lib/types'

const STORAGE_KEY = 'clearalert-user-profile'

const ageGroupOptions: { value: AgeGroup; label: string; icon: typeof User; description: string }[] = [
  { value: 'student', label: 'Student', icon: GraduationCap, description: 'School or university student' },
  { value: 'adult', label: 'Adult', icon: Briefcase, description: 'Working professional or homemaker' },
  { value: 'senior', label: 'Senior', icon: Clock, description: 'Retired or 65+ years' },
]

const householdOptions: { value: HouseholdType; label: string; icon: typeof User; description: string }[] = [
  { value: 'single', label: 'Single', icon: User, description: 'Living alone' },
  { value: 'couple', label: 'Couple', icon: Users, description: 'Two adults' },
  { value: 'small-family', label: 'Small Family', icon: Home, description: '2-3 members with children' },
  { value: 'large-family', label: 'Large Family', icon: Users, description: '4+ members' },
]

const specialConditionOptions: { value: SpecialCondition; label: string; icon: typeof Heart; description: string }[] = [
  { value: 'medical-needs', label: 'Medical Needs', icon: Pill, description: 'Requires medication or medical equipment' },
  { value: 'mobility-issues', label: 'Mobility Issues', icon: Accessibility, description: 'Limited mobility or uses wheelchair' },
  { value: 'hearing-impaired', label: 'Hearing Impaired', icon: Ear, description: 'Deaf or hard of hearing' },
  { value: 'vision-impaired', label: 'Vision Impaired', icon: Eye, description: 'Blind or low vision' },
  { value: 'young-children', label: 'Young Children', icon: Baby, description: 'Infants or toddlers in household' },
  { value: 'pets', label: 'Pets', icon: Dog, description: 'Dogs, cats, or other pets' },
  { value: 'elderly-care', label: 'Elderly Care', icon: Heart, description: 'Caring for elderly family member' },
]

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    ageGroup: null,
    gender: null,
    householdType: null,
    specialConditions: [],
    isConfigured: false,
  })
  const [isSaved, setIsSaved] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load profile from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setProfile(parsed)
      } catch {
        // Invalid data, use defaults
      }
    }
    setIsLoaded(true)
  }, [])

  const handleSave = () => {
    const updatedProfile = { ...profile, isConfigured: true }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile))
    setProfile(updatedProfile)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const toggleCondition = (condition: SpecialCondition) => {
    setProfile((prev) => {
      const conditions = prev.specialConditions.includes(condition)
        ? prev.specialConditions.filter((c) => c !== condition)
        : [...prev.specialConditions, condition]
      
      // If 'none' is selected, clear other conditions
      if (condition === 'none') {
        return { ...prev, specialConditions: conditions.includes('none') ? ['none'] : [] }
      }
      // If any other condition is selected, remove 'none'
      return { ...prev, specialConditions: conditions.filter((c) => c !== 'none') }
    })
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-primary" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  Personal Settings
                </h1>
                <p className="text-xs text-muted-foreground">
                  Customize your emergency alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">ClearAlert</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Intro Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="border-border bg-gradient-to-br from-primary/5 to-primary/10 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">
                    Personalize Your Alerts
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Tell us about yourself so we can provide emergency advice tailored to your specific needs. 
                    Your information stays on your device and is never shared.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6">
          {/* Age Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-primary" />
                  Age Group
                </CardTitle>
                <CardDescription>
                  Select your age category for relevant safety advice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  {ageGroupOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = profile.ageGroup === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setProfile((prev) => ({ ...prev, ageGroup: option.value }))}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                          isSelected
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:bg-secondary/50'
                        )}
                      >
                        <Icon className={cn('h-8 w-8', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        <span className="font-medium text-sm">{option.label}</span>
                        <span className="text-xs text-center opacity-70">{option.description}</span>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gender (Optional) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-5 w-5 text-primary" />
                  Gender
                  <span className="text-xs font-normal text-muted-foreground ml-1">(Optional)</span>
                </CardTitle>
                <CardDescription>
                  Helps provide gender-specific health advice during emergencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={profile.gender || ''}
                  onValueChange={(value) => setProfile((prev) => ({ ...prev, gender: value as Gender }))}
                >
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Select gender (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>

          {/* Household Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Home className="h-5 w-5 text-primary" />
                  Household Type
                </CardTitle>
                <CardDescription>
                  Helps us recommend family-appropriate emergency plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {householdOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = profile.householdType === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setProfile((prev) => ({ ...prev, householdType: option.value }))}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50'
                        )}
                      >
                        <Icon className={cn('h-6 w-6 flex-shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        <div>
                          <span className={cn('font-medium text-sm block', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                            {option.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Special Conditions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Accessibility className="h-5 w-5 text-primary" />
                  Special Considerations
                </CardTitle>
                <CardDescription>
                  Select all that apply to receive tailored emergency guidance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {specialConditionOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = profile.specialConditions.includes(option.value)
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleCondition(option.value)}
                        className={cn(
                          'flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50'
                        )}
                      >
                        <div className={cn(
                          'flex h-5 w-5 items-center justify-center rounded border flex-shrink-0',
                          isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <Icon className={cn('h-5 w-5 flex-shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        <div>
                          <span className={cn('font-medium text-sm block', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                            {option.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
                
                {/* None option */}
                <button
                  type="button"
                  onClick={() => toggleCondition('none')}
                  className={cn(
                    'mt-3 w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                    profile.specialConditions.includes('none')
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50'
                  )}
                >
                  <Check className={cn('h-4 w-4', profile.specialConditions.includes('none') ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="text-sm font-medium">None of the above</span>
                </button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Button
              onClick={handleSave}
              className="flex-1 h-12 text-base font-medium"
              disabled={isSaved}
            >
              <AnimatePresence mode="wait">
                {isSaved ? (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-5 w-5" />
                    Settings Saved!
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    Save Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full h-12 text-base bg-transparent">
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Privacy Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          Your information is stored locally on your device and is never sent to any server.
        </motion.p>
      </main>
    </div>
  )
}
