export type AlertSeverity = 'low' | 'moderate' | 'severe' | 'extreme'

export type AlertType =
  | 'tornado'
  | 'hurricane'
  | 'flood'
  | 'thunderstorm'
  | 'blizzard'
  | 'heat'
  | 'wildfire'
  | 'earthquake'
  | 'winter'
  | 'wind'
  | 'fire'
  | 'coastal'
  | 'other'

export interface WeatherAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  location: string
  timestamp: string
  confidence: number
  expiresAt: string
  headline?: string
  instruction?: string
  source?: string
}

export interface LocationInfo {
  query: string
  displayName: string
  country?: string
  countryCode?: string
  state?: string
  coordinates?: {
    lat: number
    lon: number
  }
}

export interface ActionCard {
  id: string
  alertId: string
  icon: string
  instruction: string
  whyItMatters: string
  priority: number
}

export type AgeGroup = 'student' | 'adult' | 'senior'
export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say'
export type HouseholdType = 'single' | 'couple' | 'small-family' | 'large-family'
export type SpecialCondition = 
  | 'medical-needs'
  | 'mobility-issues'
  | 'hearing-impaired'
  | 'vision-impaired'
  | 'young-children'
  | 'pets'
  | 'elderly-care'
  | 'none'

export interface UserProfile {
  ageGroup: AgeGroup | null
  gender: Gender | null
  householdType: HouseholdType | null
  specialConditions: SpecialCondition[]
  isConfigured: boolean
}

export interface UserSettings {
  language: string
  highContrast: boolean
  largeText: boolean
  reducedMotion: boolean
  profile: UserProfile
}

export interface DeviceStatus {
  isOnline: boolean
  lastSyncTime: string
  alertMode: 'active' | 'standby' | 'test'
  batteryLevel?: number
  firmwareVersion?: string
}

export interface PreparednessItem {
  id: string
  title: string
  description: string
  isChecked: boolean
  category: string
}

export interface CachedData {
  alerts: WeatherAlert[]
  actions: ActionCard[]
  preparednessItems: PreparednessItem[]
  lastCached: string
}
