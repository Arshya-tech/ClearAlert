import type {
  WeatherAlert,
  ActionCard,
  UserSettings,
  DeviceStatus,
  CachedData,
  LocationInfo, // Added import for LocationInfo
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, `API error: ${response.statusText}`)
  }

  return response.json()
}

// Alert endpoints
export interface AlertsResponse {
  alerts: WeatherAlert[]
  location?: LocationInfo
  message: string
  error?: string
}

export async function getAlertsByLocation(
  location: string
): Promise<AlertsResponse> {
  return fetchApi<AlertsResponse>(
    `/api/alerts/current?location=${encodeURIComponent(location)}`
  )
}

export async function getCurrentAlert(): Promise<WeatherAlert | null> {
  return fetchApi<WeatherAlert | null>('/api/alerts/current')
}

export interface UserProfileParams {
  ageGroup?: string | null
  householdType?: string | null
  conditions?: string[]
}

export async function getAlertActions(
  alertId?: string,
  alertType?: string,
  profile?: UserProfileParams
): Promise<ActionCard[]> {
  const params = new URLSearchParams()
  if (alertId) params.set('alertId', alertId)
  if (alertType) params.set('type', alertType)
  if (profile?.ageGroup) params.set('ageGroup', profile.ageGroup)
  if (profile?.householdType) params.set('householdType', profile.householdType)
  if (profile?.conditions && profile.conditions.length > 0) {
    params.set('conditions', profile.conditions.join(','))
  }
  const queryString = params.toString()
  return fetchApi<ActionCard[]>(
    `/api/alerts/actions${queryString ? `?${queryString}` : ''}`
  )
}

// User settings endpoints
export async function getUserSettings(): Promise<UserSettings> {
  return fetchApi<UserSettings>('/api/user/settings')
}

export async function updateUserSettings(
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  return fetchApi<UserSettings>('/api/user/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  })
}

// Device endpoints
export async function getDeviceStatus(): Promise<DeviceStatus> {
  return fetchApi<DeviceStatus>('/api/device/status')
}

export async function testDevice(
  type: 'led' | 'audio'
): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>('/api/device/test', {
    method: 'POST',
    body: JSON.stringify({ type }),
  })
}

// Cache management for offline support
const CACHE_KEY = 'clearalert_cache'

export function getCachedData(): CachedData | null {
  if (typeof window === 'undefined') return null
  const cached = localStorage.getItem(CACHE_KEY)
  return cached ? JSON.parse(cached) : null
}

export function setCachedData(data: Partial<CachedData>): void {
  if (typeof window === 'undefined') return
  const existing = getCachedData() || {
    alerts: [],
    actions: [],
    preparednessItems: [],
    lastCached: new Date().toISOString(),
  }
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      ...existing,
      ...data,
      lastCached: new Date().toISOString(),
    })
  )
}

// Network status helper
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}
