'use client'

import { AppProvider, useApp } from '@/lib/context'
import { Header } from '@/components/header'
import { OfflineBanner } from '@/components/offline-banner'
import { LocationSearch } from '@/components/location-search'
import { AlertDashboard } from '@/components/alert-dashboard'
import { ActionCards } from '@/components/action-cards'
import { AIPreparednessGuide } from '@/components/ai-preparedness-guide'
import { SettingsPanel } from '@/components/settings-panel'
import { DevicePanel } from '@/components/device-panel'
import { PreparednessChecklist } from '@/components/preparedness-checklist'
import { cn } from '@/lib/utils'

function DashboardContent() {
  const { userSettings, isOffline } = useApp()
  const { highContrast, largeText } = userSettings

  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        highContrast && 'contrast-125'
      )}
    >
      <Header />
      <OfflineBanner />

      <main className="container mx-auto px-4 py-6">
        {/* Location Search - Full Width */}
        <section aria-labelledby="location-heading" className="mb-6">
          <h2 id="location-heading" className="sr-only">
            Location Search
          </h2>
          <LocationSearch />
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Emergency Dashboard */}
            <section aria-labelledby="alert-heading">
              <h2 id="alert-heading" className="sr-only">
                Current Weather Alert
              </h2>
              <AlertDashboard />
            </section>

            {/* AI Preparedness Guide */}
            <section aria-labelledby="ai-guide-heading">
              <h2 id="ai-guide-heading" className="sr-only">
                AI Preparedness Guide
              </h2>
              <AIPreparednessGuide />
            </section>

            {/* Visual Action Cards */}
            <section aria-labelledby="actions-heading">
              <h2 id="actions-heading" className="sr-only">
                Recommended Actions
              </h2>
              <ActionCards />
            </section>

            {/* Preparedness Checklist - Shows prominently when offline */}
            {isOffline && (
              <section aria-labelledby="preparedness-heading">
                <h2 id="preparedness-heading" className="sr-only">
                  Emergency Preparedness Checklist
                </h2>
                <PreparednessChecklist />
              </section>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Device Status Panel */}
            <section aria-labelledby="device-heading">
              <h2 id="device-heading" className="sr-only">
                Raspberry Pi Device Status
              </h2>
              <DevicePanel />
            </section>

            {/* Settings Panel */}
            <section aria-labelledby="settings-heading">
              <h2 id="settings-heading" className="sr-only">
                Accessibility and Language Settings
              </h2>
              <SettingsPanel />
            </section>

            {/* Preparedness Checklist - Shows in sidebar when online */}
            {!isOffline && (
              <section aria-labelledby="preparedness-sidebar-heading">
                <h2 id="preparedness-sidebar-heading" className="sr-only">
                  Emergency Preparedness Checklist
                </h2>
                <PreparednessChecklist />
              </section>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6 text-center">
          <p className={cn('text-muted-foreground', largeText ? 'text-sm' : 'text-xs')}>
            ClearAlert Emergency Intelligence System
          </p>
          <p className={cn('text-muted-foreground/70 mt-1', largeText ? 'text-xs' : 'text-[10px]')}>
            Designed for resilience, accessibility, and clarity during emergencies
          </p>
        </footer>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  )
}
