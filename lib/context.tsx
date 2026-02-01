'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type {
  WeatherAlert,
  ActionCard,
  UserSettings,
  DeviceStatus,
  CachedData,
  LocationInfo,
} from './types'
import {
  getAlertsByLocation,
  getAlertActions,
  getUserSettings,
  updateUserSettings,
  getDeviceStatus,
  getCachedData,
  setCachedData,
  isOnline,
} from './api'

interface AppState {
  alerts: WeatherAlert[]
  currentAlert: WeatherAlert | null
  actionCards: ActionCard[]
  userSettings: UserSettings
  deviceStatus: DeviceStatus | null
  isOffline: boolean
  isLoading: boolean
  isSearching: boolean
  error: string | null
  cachedData: CachedData | null
  location: LocationInfo | null
  statusMessage: string | null
}

interface AppContextValue extends AppState {
  searchLocation: (query: string) => Promise<void>
  refreshAlert: () => Promise<void>
  refreshActions: () => Promise<void>
  refreshDeviceStatus: () => Promise<void>
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>
  clearLocation: () => void
}

const defaultSettings: UserSettings = {
  language: 'en',
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  profile: {
    ageGroup: null,
    gender: null,
    householdType: null,
    specialConditions: [],
    isConfigured: false,
  },
}

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

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    alerts: [],
    currentAlert: null,
    actionCards: [],
    userSettings: defaultSettings,
    deviceStatus: null,
    isOffline: false,
    isLoading: false,
    isSearching: false,
    error: null,
    cachedData: null,
    location: null,
    statusMessage: null,
  })

  const checkOnlineStatus = useCallback(() => {
    const online = isOnline()
    setState((prev) => ({ ...prev, isOffline: !online }))
    return online
  }, [])

  const searchLocation = useCallback(
    async (query: string) => {
      if (!query.trim()) return

      if (!checkOnlineStatus()) {
        setState((prev) => ({
          ...prev,
          error: 'You are offline. Please check your internet connection.',
        }))
        return
      }

      setState((prev) => ({
        ...prev,
        isSearching: true,
        error: null,
        statusMessage: null,
      }))

      try {
        const response = await getAlertsByLocation(query)

        if (response.error === 'LOCATION_NOT_FOUND') {
          setState((prev) => ({
            ...prev,
            isSearching: false,
            error: response.message,
            alerts: [],
            currentAlert: null,
            location: null,
          }))
          return
        }

        const sortedAlerts = [...response.alerts].sort((a, b) => {
          const severityOrder = { extreme: 0, severe: 1, moderate: 2, low: 3 }
          return severityOrder[a.severity] - severityOrder[b.severity]
        })

        setState((prev) => ({
          ...prev,
          isSearching: false,
          alerts: sortedAlerts,
          currentAlert: sortedAlerts[0] || null,
          location: response.location || null,
          statusMessage: response.message,
          error: null,
        }))

        // Cache the data
        if (sortedAlerts.length > 0) {
          setCachedData({ alerts: sortedAlerts })
        }

        // Fetch actions for the most severe alert with user profile
        if (sortedAlerts[0]) {
          const profile = loadUserProfile()
          const actions = await getAlertActions(
            sortedAlerts[0].id,
            sortedAlerts[0].type,
            profile ? {
              ageGroup: profile.ageGroup,
              householdType: profile.householdType,
              conditions: profile.specialConditions,
            } : undefined
          ).catch(() => [])
          setState((prev) => ({ ...prev, actionCards: actions }))
          setCachedData({ actions })
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isSearching: false,
          error:
            err instanceof Error
              ? err.message
              : 'Failed to fetch alerts. Please try again.',
        }))
      }
    },
    [checkOnlineStatus]
  )

  const refreshAlert = useCallback(async () => {
    if (!state.location?.query) return

    await searchLocation(state.location.query)
  }, [state.location?.query, searchLocation])

  const refreshActions = useCallback(async () => {
    if (!checkOnlineStatus()) {
      const cached = getCachedData()
      if (cached?.actions) {
        setState((prev) => ({
          ...prev,
          actionCards: cached.actions,
          cachedData: cached,
        }))
      }
      return
    }

    try {
      const profile = loadUserProfile()
      const actions = await getAlertActions(
        state.currentAlert?.id,
        state.currentAlert?.type,
        profile ? {
          ageGroup: profile.ageGroup,
          householdType: profile.householdType,
          conditions: profile.specialConditions,
        } : undefined
      )
      setState((prev) => ({ ...prev, actionCards: actions, error: null }))
      setCachedData({ actions })
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to fetch actions',
      }))
    }
  }, [checkOnlineStatus, state.currentAlert?.id, state.currentAlert?.type])

  const refreshDeviceStatus = useCallback(async () => {
    if (!checkOnlineStatus()) return

    try {
      const status = await getDeviceStatus()
      setState((prev) => ({ ...prev, deviceStatus: status, error: null }))
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : 'Failed to fetch device status',
      }))
    }
  }, [checkOnlineStatus])

  const updateSettingsHandler = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      const optimisticSettings = { ...state.userSettings, ...newSettings }
      setState((prev) => ({ ...prev, userSettings: optimisticSettings }))

      if (!checkOnlineStatus()) return

      try {
        const savedSettings = await updateUserSettings(newSettings)
        setState((prev) => ({ ...prev, userSettings: savedSettings }))
      } catch (err) {
        setState((prev) => ({
          ...prev,
          error:
            err instanceof Error ? err.message : 'Failed to update settings',
        }))
      }
    },
    [checkOnlineStatus, state.userSettings]
  )

  const clearLocation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      location: null,
      alerts: [],
      currentAlert: null,
      actionCards: [],
      statusMessage: null,
      error: null,
    }))
  }, [])

  // Initial setup - load cached data, settings, and profile
  useEffect(() => {
    const initialize = async () => {
      // Load cached data
      const cached = getCachedData()
      if (cached) {
        setState((prev) => ({ ...prev, cachedData: cached }))
      }

      // Load user profile from localStorage
      const savedProfile = loadUserProfile()
      if (savedProfile) {
        setState((prev) => ({
          ...prev,
          userSettings: {
            ...prev.userSettings,
            profile: savedProfile,
          },
        }))
      }

      // Load settings
      try {
        if (isOnline()) {
          const settings = await getUserSettings().catch(() => defaultSettings)
          // Merge with loaded profile
          const profileFromStorage = loadUserProfile()
          setState((prev) => ({
            ...prev,
            userSettings: {
              ...settings,
              profile: profileFromStorage || prev.userSettings.profile,
            },
          }))

          const deviceStatus = await getDeviceStatus().catch(() => null)
          setState((prev) => ({ ...prev, deviceStatus }))
        }
      } catch {
        // Silently fail - we'll use defaults
      }
    }

    initialize()
  }, [])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState((prev) => ({ ...prev, isOffline: false }))
      if (state.location?.query) {
        refreshAlert()
      }
      refreshDeviceStatus()
    }

    const handleOffline = () => {
      setState((prev) => ({ ...prev, isOffline: true }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refreshAlert, refreshDeviceStatus, state.location?.query])

  return (
    <AppContext.Provider
      value={{
        ...state,
        searchLocation,
        refreshAlert,
        refreshActions,
        refreshDeviceStatus,
        updateSettings: updateSettingsHandler,
        clearLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
