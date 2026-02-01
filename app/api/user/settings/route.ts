import { NextResponse } from 'next/server'
import type { UserSettings } from '@/lib/types'

// In-memory settings store (in production, this would be a database)
let userSettings: UserSettings = {
  language: 'en',
  highContrast: false,
  largeText: false,
  reducedMotion: false,
}

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 100))
  return NextResponse.json(userSettings)
}

export async function POST(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 100))

  const updates = await request.json()
  userSettings = { ...userSettings, ...updates }

  return NextResponse.json(userSettings)
}
