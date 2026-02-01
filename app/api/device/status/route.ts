import { NextResponse } from 'next/server'
import type { DeviceStatus } from '@/lib/types'

// Demo device status - in production, this would query the actual Raspberry Pi
const demoDeviceStatus: DeviceStatus = {
  isOnline: true,
  lastSyncTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
  alertMode: 'active',
  batteryLevel: 85,
  firmwareVersion: '1.2.3',
}

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 150))
  return NextResponse.json(demoDeviceStatus)
}
