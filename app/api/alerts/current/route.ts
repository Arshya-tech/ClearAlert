import { NextResponse } from 'next/server'
import type { WeatherAlert, AlertSeverity, AlertType } from '@/lib/types'

// Check if an alert is within the last 24 hours
function isWithin24Hours(timestamp: string): boolean {
  try {
    const alertDate = new Date(timestamp)
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return alertDate >= twentyFourHoursAgo
  } catch {
    return false // If we can't parse the date, exclude it
  }
}

// Map severity levels from various sources to our format
function mapSeverity(severity: string): AlertSeverity {
  const severityLower = severity.toLowerCase()
  if (
    severityLower.includes('extreme') ||
    severityLower.includes('red') ||
    severityLower.includes('very high')
  )
    return 'extreme'
  if (
    severityLower.includes('severe') ||
    severityLower.includes('orange') ||
    severityLower.includes('high')
  )
    return 'severe'
  if (
    severityLower.includes('moderate') ||
    severityLower.includes('yellow') ||
    severityLower.includes('medium')
  )
    return 'moderate'
  return 'low'
}

// Map event types to our alert types
function mapAlertType(event: string): AlertType {
  const eventLower = event.toLowerCase()
  if (eventLower.includes('tornado')) return 'tornado'
  if (eventLower.includes('hurricane') || eventLower.includes('tropical') || eventLower.includes('cyclone'))
    return 'hurricane'
  if (eventLower.includes('flood') || eventLower.includes('inondation'))
    return 'flood'
  if (eventLower.includes('thunderstorm') || eventLower.includes('orage') || eventLower.includes('lightning'))
    return 'thunderstorm'
  if (eventLower.includes('blizzard') || eventLower.includes('snow') || eventLower.includes('neige'))
    return 'blizzard'
  if (eventLower.includes('heat') || eventLower.includes('chaleur') || eventLower.includes('hot'))
    return 'heat'
  if (eventLower.includes('fire') || eventLower.includes('feu') || eventLower.includes('red flag'))
    return 'wildfire'
  if (eventLower.includes('earthquake') || eventLower.includes('seismic') || eventLower.includes('tremblement'))
    return 'earthquake'
  if (
    eventLower.includes('winter') ||
    eventLower.includes('freeze') ||
    eventLower.includes('frost') ||
    eventLower.includes('ice') ||
    eventLower.includes('gel') ||
    eventLower.includes('verglas')
  )
    return 'winter'
  if (eventLower.includes('wind') || eventLower.includes('vent') || eventLower.includes('gust'))
    return 'wind'
  if (
    eventLower.includes('coastal') ||
    eventLower.includes('tsunami') ||
    eventLower.includes('rip') ||
    eventLower.includes('marine') ||
    eventLower.includes('storm surge')
  )
    return 'coastal'
  return 'other'
}

// Geocode location using Nominatim (OpenStreetMap) - free, no API key needed
// Priority for Canada when query is ambiguous
async function geocodeLocation(
  query: string
): Promise<{
  lat: number
  lon: number
  displayName: string
  country: string
  countryCode: string
  state?: string
} | null> {
  try {
    // First try with the query as-is (supports any country)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'ClearAlert Emergency App (contact@clearalert.app)',
        },
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    if (data.length === 0) return null

    // Prioritize Canadian results if multiple matches
    const canadianResult = data.find(
      (r: { address?: { country_code?: string } }) =>
        r.address?.country_code === 'ca'
    )
    const result = canadianResult || data[0]

    return {
      lat: Number.parseFloat(result.lat),
      lon: Number.parseFloat(result.lon),
      displayName: result.display_name,
      country: result.address?.country || 'Unknown',
      countryCode: (result.address?.country_code || 'unknown').toUpperCase(),
      state: result.address?.state || result.address?.province,
    }
  } catch {
    return null
  }
}

// Fetch alerts from US NWS API
async function fetchNWSAlerts(
  lat: number,
  lon: number
): Promise<WeatherAlert[]> {
  try {
    const response = await fetch(
      `https://api.weather.gov/alerts/active?point=${lat},${lon}`,
      {
        headers: {
          'User-Agent': 'ClearAlert Emergency App',
          Accept: 'application/geo+json',
        },
      }
    )

    if (!response.ok) return []

    const data = await response.json()
    if (!data.features || data.features.length === 0) return []

    return data.features
      .filter((feature: { properties: { effective: string } }) => 
        isWithin24Hours(feature.properties.effective)
      )
      .map(
        (feature: {
          properties: {
            id: string
            severity: string
            event: string
            headline: string
            description: string
            instruction?: string
            areaDesc: string
            effective: string
            expires: string
            certainty: string
            senderName: string
          }
        }) => {
          const props = feature.properties
          const certaintyMap: Record<string, number> = {
            Observed: 1.0,
            Likely: 0.9,
            Possible: 0.7,
            Unlikely: 0.4,
            Unknown: 0.5,
          }

          return {
            id: props.id,
            type: mapAlertType(props.event),
            severity: mapSeverity(props.severity),
            title: props.event,
            headline: props.headline,
            description: simplifyDescription(props.description),
            instruction: props.instruction || '',
            location: props.areaDesc,
            timestamp: props.effective,
            confidence: certaintyMap[props.certainty] || 0.5,
            expiresAt: props.expires,
            source: 'National Weather Service (US)',
          }
        }
      )
  } catch (error) {
    console.error('Error fetching NWS alerts:', error)
    return []
  }
}

// Fetch alerts from Environment Canada GeoMet OGC API
async function fetchCanadaAlerts(
  lat: number,
  lon: number,
  province?: string
): Promise<WeatherAlert[]> {
  try {
    // Use the official Environment Canada GeoMet OGC API
    // This API provides weather alerts in GeoJSON format
    const response = await fetch(
      `https://api.weather.gc.ca/collections/alerts/items?f=json&lang=en&limit=100`,
      {
        headers: {
          'User-Agent': 'ClearAlert Emergency App',
          Accept: 'application/geo+json',
        },
      }
    )

    if (!response.ok) {
      console.error('Canada API response not ok:', response.status)
      return []
    }

    const data = await response.json()

    if (!data.features || data.features.length === 0) {
      return []
    }

    const alerts: WeatherAlert[] = []

    // Province name mappings for filtering
    const provinceAbbreviations: Record<string, string[]> = {
      'British Columbia': ['BC', 'British Columbia', 'Colombie-Britannique'],
      Alberta: ['AB', 'Alberta'],
      Saskatchewan: ['SK', 'Saskatchewan'],
      Manitoba: ['MB', 'Manitoba'],
      Ontario: ['ON', 'Ontario'],
      Quebec: ['QC', 'Quebec', 'Québec'],
      'New Brunswick': ['NB', 'New Brunswick', 'Nouveau-Brunswick'],
      'Nova Scotia': ['NS', 'Nova Scotia', 'Nouvelle-Écosse'],
      'Prince Edward Island': [
        'PE',
        'PEI',
        'Prince Edward Island',
        'Île-du-Prince-Édouard',
      ],
      'Newfoundland and Labrador': [
        'NL',
        'Newfoundland',
        'Labrador',
        'Terre-Neuve-et-Labrador',
      ],
      Yukon: ['YT', 'Yukon'],
      'Northwest Territories': ['NT', 'Northwest Territories', 'NWT'],
      Nunavut: ['NU', 'Nunavut'],
    }

    for (const feature of data.features) {
      const props = feature.properties || {}

      // Get alert area description
      const alertArea = props.area || props.headline || ''

      // Filter by province if specified
      let isRelevant = false
      if (province) {
        const provinceNames = provinceAbbreviations[province] || [province]
        isRelevant = provinceNames.some(
          (name) =>
            alertArea.toLowerCase().includes(name.toLowerCase()) ||
            (props.headline &&
              props.headline.toLowerCase().includes(name.toLowerCase()))
        )
      } else {
        // Check proximity using bounding box or coordinates if available
        if (feature.geometry?.coordinates) {
          // For polygons, check if point is roughly in the area
          isRelevant = true // Include all for now, could add geometry check
        } else {
          isRelevant = true
        }
      }

      if (isRelevant) {
        const eventType = props.event || props.headline?.split(' ')[0] || 'Alert'
        const severity = props.severity || props.urgency || 'Moderate'
        const alertTimestamp = props.effective || props.sent || new Date().toISOString()

        // Only include alerts from the last 24 hours
        if (!isWithin24Hours(alertTimestamp)) continue

        alerts.push({
          id: props.identifier || feature.id || `ca-${Date.now()}-${Math.random()}`,
          type: mapAlertType(eventType),
          severity: mapSeverity(severity),
          title: eventType,
          headline: props.headline || eventType,
          description: simplifyDescription(props.description || props.headline || ''),
          instruction: props.instruction || props.response || '',
          location: alertArea,
          timestamp: alertTimestamp,
          confidence: 0.9,
          expiresAt: props.expires || '',
          source: props.senderName || 'Environment and Climate Change Canada',
        })
      }
    }

    return alerts
  } catch (error) {
    console.error('Error fetching Canada alerts:', error)
    return []
  }
}

// Fetch alerts from GDACS (Global Disaster Alert and Coordination System)
// Works for all countries worldwide - uses strict location filtering
async function fetchGDACSAlerts(
  lat: number,
  lon: number,
  countryCode: string,
  countryName: string
): Promise<WeatherAlert[]> {
  try {
    // GDACS RSS feed for recent disasters
    const response = await fetch('https://www.gdacs.org/xml/rss.xml', {
      headers: {
        'User-Agent': 'ClearAlert Emergency App',
      },
    })

    if (!response.ok) return []

    const xmlText = await response.text()

    const alerts: WeatherAlert[] = []

    // Parse RSS items
    const itemMatches = xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)

    for (const itemMatch of itemMatches) {
      const item = itemMatch[1]

      const titleMatch = item.match(/<title>([^<]+)<\/title>/)
      const descMatch = item.match(/<description>([^<]+)<\/description>/)
      const linkMatch = item.match(/<link>([^<]+)<\/link>/)
      const pubDateMatch = item.match(/<pubDate>([^<]+)<\/pubDate>/)
      const geoLatMatch = item.match(/<geo:lat>([^<]+)<\/geo:lat>/)
      const geoLongMatch = item.match(/<geo:long>([^<]+)<\/geo:long>/)
      const alertLevelMatch = item.match(
        /<gdacs:alertlevel>([^<]+)<\/gdacs:alertlevel>/
      )
      const eventTypeMatch = item.match(
        /<gdacs:eventtype>([^<]+)<\/gdacs:eventtype>/
      )
      const countryMatch = item.match(/<gdacs:country>([^<]+)<\/gdacs:country>/)

      if (!titleMatch) continue

      // Check if alert is within 24 hours
      const alertTimestamp = pubDateMatch?.[1] || ''
      if (!isWithin24Hours(alertTimestamp)) continue

      // STRICT location filtering - must match BOTH proximity AND country
      const eventLat = geoLatMatch ? Number.parseFloat(geoLatMatch[1]) : null
      const eventLon = geoLongMatch ? Number.parseFloat(geoLongMatch[1]) : null

      let isRelevant = false

      // Must have coordinates for GDACS alerts to be considered relevant
      if (eventLat && eventLon) {
        const distance = calculateDistance(lat, lon, eventLat, eventLon)
        
        // Check if within reasonable proximity (300km for major disasters)
        // AND the country matches
        if (distance < 300) {
          // Also verify country match if available
          if (countryMatch) {
            const eventCountry = countryMatch[1].toLowerCase()
            const userCountry = countryName.toLowerCase()
            const userCode = countryCode.toLowerCase()
            
            // Strict country match
            const countryMatches = 
              eventCountry === userCountry ||
              eventCountry.includes(userCountry) ||
              userCountry.includes(eventCountry) ||
              eventCountry.includes(userCode)
            
            if (countryMatches) {
              isRelevant = true
            }
          } else {
            // No country in alert but very close proximity
            if (distance < 150) {
              isRelevant = true
            }
          }
        }
      }

      if (isRelevant) {
        alerts.push({
          id: linkMatch?.[1] || `gdacs-${Date.now()}-${Math.random()}`,
          type: mapAlertType(eventTypeMatch?.[1] || titleMatch[1]),
          severity: mapGDACSLevel(alertLevelMatch?.[1] || 'Green'),
          title: titleMatch[1],
          headline: titleMatch[1],
          description: simplifyDescription(descMatch?.[1] || ''),
          instruction: 'Follow local authority guidance for this event.',
          location: countryMatch?.[1] || 'International',
          timestamp: alertTimestamp || new Date().toISOString(),
          confidence: 0.8,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          source: 'GDACS - Global Disaster Alert System',
        })
      }
    }

    return alerts
  } catch (error) {
    console.error('Error fetching GDACS alerts:', error)
    return []
  }
}

// Map GDACS alert levels to our severity
function mapGDACSLevel(level: string): AlertSeverity {
  const levelLower = level.toLowerCase()
  if (levelLower === 'red') return 'extreme'
  if (levelLower === 'orange') return 'severe'
  if (levelLower === 'yellow' || levelLower === 'green') return 'moderate'
  return 'low'
}

// Calculate distance between two points using Haversine formula (returns km)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Simplify description to plain language
function simplifyDescription(description: string): string {
  if (!description) return ''

  let simplified = description
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\* /g, '')
    .replace(/\.\.\./g, '. ')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Take the first 3 sentences
  const sentences = simplified.split(/(?<=[.!?])\s+/)
  if (sentences.length > 3) {
    simplified = sentences.slice(0, 3).join(' ')
  }

  return simplified
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location')

  if (!location) {
    return NextResponse.json({ alerts: [], message: 'No location provided' })
  }

  // Geocode the location
  const geoResult = await geocodeLocation(location)

  if (!geoResult) {
    return NextResponse.json(
      {
        alerts: [],
        message:
          'Could not find that location. Please try a different search.',
        error: 'LOCATION_NOT_FOUND',
      },
      { status: 404 }
    )
  }

  const { lat, lon, countryCode, state } = geoResult

  // Fetch alerts based on country
  let alerts: WeatherAlert[] = []

  // Always fetch GDACS for global disaster coverage
  const gdacsAlerts = await fetchGDACSAlerts(lat, lon, countryCode, geoResult.country)
  alerts.push(...gdacsAlerts)

  // Fetch country-specific alerts
  if (countryCode === 'CA') {
    // Canada - Environment Canada
    const canadaAlerts = await fetchCanadaAlerts(lat, lon, state)
    alerts.push(...canadaAlerts)
  } else if (countryCode === 'US') {
    // United States - NWS
    const nwsAlerts = await fetchNWSAlerts(lat, lon)
    alerts.push(...nwsAlerts)
  }

  // Remove duplicates by title similarity
  const uniqueAlerts = alerts.filter(
    (alert, index, self) =>
      index ===
      self.findIndex(
        (a) =>
          a.title.toLowerCase() === alert.title.toLowerCase() ||
          (a.headline &&
            alert.headline &&
            a.headline.toLowerCase() === alert.headline.toLowerCase())
      )
  )

  // Sort by severity (extreme first) and timestamp
  const severityOrder = { extreme: 0, severe: 1, moderate: 2, low: 3 }
  uniqueAlerts.sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity]
    if (severityDiff !== 0) return severityDiff
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  return NextResponse.json({
    alerts: uniqueAlerts,
    location: {
      query: location,
      displayName: geoResult.displayName,
      country: geoResult.country,
      countryCode: geoResult.countryCode,
      state: geoResult.state,
      coordinates: { lat, lon },
    },
    message:
      uniqueAlerts.length === 0
        ? 'No major alerts in the last 24 hours. Stay safe and check back for updates!'
        : `Found ${uniqueAlerts.length} active alert${uniqueAlerts.length > 1 ? 's' : ''} in the last 24 hours.`,
  })
}
