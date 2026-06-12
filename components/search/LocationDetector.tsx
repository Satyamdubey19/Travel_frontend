'use client'

import axios from '@/lib/axios'
import { Globe, LoaderCircle, LocateFixed, MapPin, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { LocationSource } from '@/types/search'

const CACHE_DURATION = 30 * 60 * 1000

export default function LocationDetector() {
  const [location, setLocation] = useState("Detecting location...")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [source, setSource] = useState<LocationSource>(null)

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userLocation") || "null")

    if (saved?.city && Date.now() - saved.timestamp < CACHE_DURATION) {
      setLocation(saved.city)
      setSource(saved.source ?? null)
      setLoading(false)
      return
    }

    void getFreshLocation()
  }, [])

  const getFreshLocation = async () => {
    setRefreshing(true)

    if (!navigator.geolocation) {
      await getFromIP()
      setRefreshing(false)
      return
    }

    await new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          console.log(`Detected GPS coordinates: ${latitude}, ${longitude}`)

          try {
            const res = await axios.get(`/location/gps?lat=${latitude}&lng=${longitude}`)
            const city = res.data.city || 'Location Detected'

            setLocation(city)
            setSource('gps')
            setLoading(false)

            localStorage.setItem(
              "userLocation",
              JSON.stringify({ city, source: 'gps', timestamp: Date.now() })
            )
          } catch (error) {
            console.error('Error fetching GPS location:', error)
            await getFromIP()
          } finally {
            resolve()
          }
        },
        async () => {
          await getFromIP()
          resolve()
        },
        {
          timeout: 5000,
          enableHighAccuracy: true,
          maximumAge: 0
        }
      )
    })

    setRefreshing(false)
  }

  const getFromIP = async () => {
    try {
      const res = await axios.get('/location/ip')
      const city = res.data.city || 'India'

      setLocation(city)
      setSource('ip')
      setLoading(false)

      localStorage.setItem(
        "userLocation",
        JSON.stringify({ city, source: 'ip', timestamp: Date.now() })
      )
    } catch (error) {
      console.error('Error fetching IP location:', error)
      setLocation("India")
      setSource('ip')
      setLoading(false)
    }
  }

  const label = loading ? 'Detecting...' : location
  const sourceLabel = source === 'gps' ? 'Live GPS' : source === 'ip' ? 'Approximate' : 'Location'

  return (
    <div className="group inline-flex max-w-full min-w-0 items-center gap-2 overflow-hidden rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm">
        {loading ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        ) : source === 'gps' ? (
          <LocateFixed className="h-3.5 w-3.5" />
        ) : source === 'ip' ? (
          <Globe className="h-3.5 w-3.5" />
        ) : (
          <MapPin className="h-3.5 w-3.5" />
        )}
      </div>

      <div className="min-w-0 leading-tight">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {sourceLabel}
        </p>
        <p className="max-w-[7.5rem] truncate text-sm font-semibold text-slate-800 sm:max-w-[9.5rem]">
          {label}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void getFreshLocation()}
        disabled={refreshing}
        aria-label="Refresh location"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}
