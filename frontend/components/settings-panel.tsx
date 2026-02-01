'use client'

import React from "react"

import { useApp } from '@/lib/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Globe, Eye, Type, Zap, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'ar', name: 'العربية' },
]

interface SettingRowProps {
  icon: typeof Globe
  label: string
  description: string
  children: React.ReactNode
  largeText: boolean
}

function SettingRow({
  icon: Icon,
  label,
  description,
  children,
  largeText,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <Label
            className={cn(
              'font-medium text-foreground',
              largeText ? 'text-base' : 'text-sm'
            )}
          >
            {label}
          </Label>
          <p
            className={cn(
              'text-muted-foreground mt-0.5',
              largeText ? 'text-sm' : 'text-xs'
            )}
          >
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

export function SettingsPanel() {
  const { userSettings, updateSettings, isOffline } = useApp()
  const { language, highContrast, largeText, reducedMotion } = userSettings

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium text-foreground">
          <Settings className="h-5 w-5" />
          Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <SettingRow
          icon={Globe}
          label="Language"
          description="Choose your preferred language"
          largeText={largeText}
        >
          <Select
            value={language}
            onValueChange={(value) => updateSettings({ language: value })}
            disabled={isOffline}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingRow>

        <SettingRow
          icon={Eye}
          label="High Contrast"
          description="Increase color contrast for better visibility"
          largeText={largeText}
        >
          <Switch
            checked={highContrast}
            onCheckedChange={(checked) =>
              updateSettings({ highContrast: checked })
            }
            aria-label="Toggle high contrast"
          />
        </SettingRow>

        <SettingRow
          icon={Type}
          label="Large Text"
          description="Increase text size for easier reading"
          largeText={largeText}
        >
          <Switch
            checked={largeText}
            onCheckedChange={(checked) =>
              updateSettings({ largeText: checked })
            }
            aria-label="Toggle large text"
          />
        </SettingRow>

        <SettingRow
          icon={Zap}
          label="Reduced Motion"
          description="Minimize animations and transitions"
          largeText={largeText}
        >
          <Switch
            checked={reducedMotion}
            onCheckedChange={(checked) =>
              updateSettings({ reducedMotion: checked })
            }
            aria-label="Toggle reduced motion"
          />
        </SettingRow>

        {isOffline && (
          <p className="mt-4 text-center text-sm text-severity-moderate">
            Some settings may not sync while offline
          </p>
        )}
      </CardContent>
    </Card>
  )
}
