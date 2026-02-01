'use client'

import React from "react"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, MapPin, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const EXAMPLE_LOCATIONS = [
  // Canadian locations (priority)
  'Toronto, Ontario',
  'Vancouver, BC',
  'Montreal, Quebec',
  'Calgary, Alberta',
  // Other global locations
  'New York, USA',
  'London, UK',
]

export function LocationSearch() {
  const { searchLocation, location, isSearching, clearLocation, userSettings, error } =
    useApp()
  const [query, setQuery] = useState('')
  const [showExamples, setShowExamples] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      await searchLocation(query.trim())
      setShowExamples(false)
    }
  }

  const handleExampleClick = async (example: string) => {
    setQuery(example)
    await searchLocation(example)
    setShowExamples(false)
  }

  const handleClear = () => {
    setQuery('')
    clearLocation()
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2
                className={cn(
                  'font-semibold text-foreground',
                  userSettings.largeText ? 'text-xl' : 'text-lg'
                )}
              >
                Check Your Location
              </h2>
              <p
                className={cn(
                  'text-muted-foreground',
                  userSettings.largeText ? 'text-base' : 'text-sm'
                )}
              >
                Enter any city, postal code, or region worldwide
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setShowExamples(e.target.value === '')
                }}
                onFocus={() => !query && setShowExamples(true)}
                onBlur={() => setTimeout(() => setShowExamples(false), 200)}
                placeholder="e.g., Toronto, Vancouver, London, Tokyo..."
                className={cn(
                  'pl-10 pr-10 bg-secondary border-border',
                  userSettings.largeText && 'text-lg h-12'
                )}
                disabled={isSearching}
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={!query.trim() || isSearching}
              className={cn(userSettings.largeText && 'h-12 px-6')}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </Button>
          </form>

          {/* Example Locations */}
          <AnimatePresence>
            {showExamples && !query && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="mb-2 text-sm text-muted-foreground">
                  Try these locations:
                </p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_LOCATIONS.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="rounded-full bg-secondary px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-primary/20"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Location Display */}
          <AnimatePresence>
            {location && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between rounded-lg bg-primary/10 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span
                    className={cn(
                      'text-foreground',
                      userSettings.largeText ? 'text-base' : 'text-sm'
                    )}
                  >
                    {location.displayName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}
