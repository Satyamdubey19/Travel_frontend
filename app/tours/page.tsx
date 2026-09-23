'use client'

import { Suspense, useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { tours as defaultTours, type Tour } from '@/lib/tours'
import { TourCard } from '@/components/tour/TourCard'
import Header from '@/components/layout/Header/Header'
import Footer from '@/components/layout/Footer/Footer'
import SearchBar from '@/components/search/SearchBar'
import MemeTravelTicker from '@/components/ui/MemeTravelTicker'
import ResponsiveFilter from '@/components/ui/ResponsiveFilter'
import { SlidersHorizontal, LayoutGrid, List, Compass, Shield, MessageCircle } from 'lucide-react'
import api, { getApiErrorMessage } from '@/lib/axios'

type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating' | 'duration'

const categories = [
  { id: 'all', label: 'All tours' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'relaxation', label: 'Relaxation' },
  { id: 'cultural', label: 'Cultural' },
]

const features = [
  { icon: Compass, title: 'Local-led itineraries', desc: 'Understand the route, group and inclusions before booking' },
  { icon: Shield, title: 'Risk shown early', desc: 'Eligibility, equipment and safety disclosures stay visible' },
  { icon: MessageCircle, title: 'Private Trip Circles', desc: 'Confirmed members can connect inside the trip' },
]

function ToursContent() {
  const searchParams = useSearchParams()
  const urlQ = searchParams.get('q') || searchParams.get('destination') || ''
  const urlCategory = searchParams.get('category') || 'all'

  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [userQuery, setUserQuery] = useState<string | null>(null)
  const [userCategory, setUserCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('recommended')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [maxPrice, setMaxPrice] = useState<number>(100000)
  const [difficulty, setDifficulty] = useState<string>('all')

  const searchQuery = userQuery ?? urlQ
  const activeCategory = userCategory ?? urlCategory

  useEffect(() => {
    let ignore = false

    const loadTours = async () => {
      try {
        const { data: payload } = await api.get('/tour', {
          headers: { 'Cache-Control': 'no-store' },
        })
        if (!ignore) {
          if (Array.isArray(payload?.data) && payload.data.length > 0) {
            setTours(payload.data)
          } else {
            setTours(defaultTours)
          }
        }
      } catch (requestError) {
        if (!ignore) {
          setTours(defaultTours)
          setError(getApiErrorMessage(requestError, 'Showing curated tours'))
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadTours()

    return () => {
      ignore = true
    }
  }, [])

  const clearSearch = () => {
    setUserQuery('')
  }

  const filteredTours = useMemo(() => {
    let result = tours

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (tour) =>
          tour.title.toLowerCase().includes(q) ||
          tour.destination.toLowerCase().includes(q) ||
          tour.location.city.toLowerCase().includes(q) ||
          tour.location.country.toLowerCase().includes(q) ||
          tour.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    if (activeCategory !== 'all') {
      result = result.filter((tour) => tour.category === activeCategory)
    }

    if (difficulty !== 'all') {
      const d = difficulty.toLowerCase()
      result = result.filter(
        (tour) =>
          (tour.riskLevel && tour.riskLevel.toLowerCase() === d) ||
          (tour.tags && tour.tags.some((t) => t.toLowerCase() === d))
      )
    }

    if (maxPrice < 100000) {
      result = result.filter((tour) => tour.price <= maxPrice)
    }

    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result = [...result].sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating)
        break
      case 'duration':
        result = [...result].sort((a, b) => a.duration - b.duration)
        break
    }

    return result
  }, [searchQuery, activeCategory, difficulty, maxPrice, sortBy, tours])

  const totalDestinations = new Set(tours.map((t) => t.location.city)).size
  const avgRating =
    tours.length > 0
      ? (tours.reduce((sum, t) => sum + t.rating, 0) / tours.length).toFixed(1)
      : '0.0'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden border-b border-slate-700/50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-14">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs sm:text-sm font-semibold text-blue-300 tracking-wide uppercase">
                Live hosted inventory
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Explore India with
              </span>
              <br />
              <span className="text-white">people who know it.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-6 leading-relaxed">
              Compare real itineraries, transparent pricing, group size and safety requirements before you book.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-2xl">
            {[
              { value: `${tours.length}+`, label: 'Packages' },
              { value: `${totalDestinations}+`, label: 'Places' },
              { value: avgRating, label: 'Rating' },
              { value: 'Live', label: 'Catalog' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-slate-700/30 hover:bg-slate-700/50 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 text-center transition-colors duration-300"
              >
                <p className="text-lg sm:text-xl font-semibold text-blue-300">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern Shared SearchBar */}
      <section className="relative z-30 -mt-8 container mx-auto px-4 sm:px-6">
        <SearchBar
          initialDestination={searchQuery}
          onSearch={(query) => setUserQuery(query)}
          onSearchSubmit={({ destination }) => setUserQuery(destination)}
        />
        {/* Subtle Travel Meme Bar below Search */}
        <div className="mt-3 max-w-2xl mx-auto">
          <MemeTravelTicker variant="subtle" />
        </div>
      </section>

      {/* Filter and View Controls Bar */}
      <section className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-4 sticky top-14 z-20 shadow-sm mt-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setUserCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'bg-slate-950 text-white shadow-md shadow-slate-950/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-950'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs font-bold border border-slate-200/80 rounded-xl px-3 py-2 bg-white text-slate-700 outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 w-full sm:w-auto shadow-sm"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="duration">Shortest First</option>
                </select>
              </div>
              <div className="hidden md:flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/60">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-slate-950'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-slate-950'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Query Status */}
      <section className="container mx-auto px-4 sm:px-6 pt-8 pb-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {isLoading ? (
              <>Loading tours...</>
            ) : (
              <>
                Showing <span className="font-semibold text-gray-800">{filteredTours.length}</span>{' '}
                {filteredTours.length === 1 ? 'tour' : 'tours'}
                {searchQuery && (
                  <>
                    {' '}
                    for &quot;<span className="text-blue-600">{searchQuery}</span>&quot;
                  </>
                )}
                {activeCategory !== 'all' && (
                  <>
                    {' '}
                    in <span className="capitalize text-blue-600">{activeCategory}</span>
                  </>
                )}
              </>
            )}
          </p>
          {(searchQuery || activeCategory !== 'all') && (
            <button
              onClick={() => {
                clearSearch()
                setUserCategory('all')
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Tour Cards Grid or Funny Meme Empty State with Responsive Filters */}
      <section className="container mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800"
          >
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[18rem_1fr] items-start">
          {/* Responsive Filter (Desktop Sticky Sidebar + Mobile Drawer) */}
          <aside className="w-full">
            <ResponsiveFilter
              categories={[
                { label: 'All tours', value: 'all' },
                { label: 'Adventure', value: 'adventure' },
                { label: 'Relaxation', value: 'relaxation' },
                { label: 'Cultural', value: 'cultural' },
              ]}
              selectedCategory={activeCategory}
              onCategoryChange={(val) => setUserCategory(val)}
              difficulties={[
                { label: 'Any difficulty', value: 'all' },
                { label: 'Easy', value: 'easy' },
                { label: 'Moderate', value: 'moderate' },
                { label: 'Challenging', value: 'challenging' },
              ]}
              selectedDifficulty={difficulty}
              onDifficultyChange={(val) => setDifficulty(val)}
              minPrice={500}
              maxPrice={100000}
              priceRange={maxPrice}
              onPriceChange={(val) => setMaxPrice(val)}
              currencyPrefix="₹"
              sortOptions={[
                { label: 'Recommended', value: 'recommended' },
                { label: 'Price: Low to High', value: 'price-low' },
                { label: 'Price: High to Low', value: 'price-high' },
                { label: 'Top Rated', value: 'rating' },
                { label: 'Shortest First', value: 'duration' },
              ]}
              selectedSort={sortBy}
              onSortChange={(val) => setSortBy(val as SortOption)}
              onReset={() => {
                setUserCategory('all')
                setDifficulty('all')
                setMaxPrice(100000)
                setSortBy('recommended')
                clearSearch()
              }}
              totalResults={filteredTours.length}
              resultLabel="Tours"
            />
          </aside>

          {/* Tours Content Area */}
          <div className="min-w-0">
            {filteredTours.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {filteredTours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} layout={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-14 px-4 max-w-lg mx-auto">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Compass className="size-8 animate-spin" style={{ animationDuration: '10s' }} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No expeditions found</h3>
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-4 mb-6 text-xs sm:text-sm text-amber-950 font-medium">
                  <p className="font-black text-amber-900 mb-1">🎬 Bunny once said:</p>
                  &ldquo;Kahin pahunchne ke liye kahin se nikalna zaroori hota hai... par yahan toh koi tour hi nahi mila!&rdquo;
                  <p className="mt-2 text-slate-600 text-[11px]">
                    Maybe the network was weak or this destination is still being chartered. Try these verified circuits:
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {['Spiti', 'Goa', 'Kerala', 'Manali', 'Rishikesh'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          setUserQuery(chip)
                          setUserCategory('all')
                        }}
                        className="rounded-lg bg-white border border-amber-300/80 px-2.5 py-1 text-xs font-bold text-amber-950 shadow-xs hover:bg-amber-100 transition"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearSearch()
                    setUserCategory('all')
                    setDifficulty('all')
                    setMaxPrice(100000)
                    setSortBy('recommended')
                  }}
                  className="px-6 py-2.5 bg-slate-950 text-white rounded-xl hover:bg-cyan-700 transition font-bold text-sm shadow-md"
                >
                  Reset &amp; View All Tours
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-100 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Travel With Us</h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-2xl hover:bg-blue-50 transition-colors duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prefer Something Shorter CTA */}
      <section className="bg-slate-950 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Prefer something shorter?</h2>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            Browse local activities that can fit inside a single day.
          </p>
          <Link
            href="/activities"
            className="inline-flex px-8 py-3 bg-white text-slate-950 font-semibold rounded-lg hover:bg-cyan-50 transition shadow-lg"
          >
            Explore activities
          </Link>
        </div>
      </section>
    </main>
  )
}

export default function ToursPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="size-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        }
      >
        <ToursContent />
      </Suspense>
      <Footer />
    </>
  )
}
