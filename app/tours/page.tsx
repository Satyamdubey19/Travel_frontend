'use client'

import { useState, useMemo, useEffect } from 'react'
import { tours as fallbackTours, type Tour } from '@/lib/tours'
import { TourCard } from '@/components/tour/TourCard'
import Header from '@/components/layout/Header/Header'
import Footer from '@/components/layout/Footer/Footer'
import { Search, SlidersHorizontal, LayoutGrid, List, Compass, Shield, Headphones, X } from 'lucide-react'
import api from '@/lib/axios'

type SortOption = 'recommended' | 'price-low' | 'price-high' | 'rating' | 'duration'

const categories = [
  { id: 'all', label: 'All Tours', emoji: '🌍' },
  { id: 'adventure', label: 'Adventure', emoji: '🏔️' },
  { id: 'relaxation', label: 'Relaxation', emoji: '🏖️' },
  { id: 'cultural', label: 'Cultural', emoji: '🏛️' },
]

const features = [
  { icon: Compass, title: 'Curated Experiences', desc: 'Hand-picked destinations with expert guides' },
  { icon: Shield, title: 'Best Price Guarantee', desc: 'Find a lower price? We\'ll match it' },
  { icon: Headphones, title: '24/7 Support', desc: 'Round-the-clock assistance on your trip' },
]

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>(fallbackTours)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('recommended')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    let ignore = false

    const loadTours = async () => {
      try {
        const { data: payload } = await api.get('/tour', {
          headers: { 'Cache-Control': 'no-store' },
        })
        if (!ignore && Array.isArray(payload?.data)) {
          setTours(payload.data)
        }
      } catch {
        if (!ignore) setTours(fallbackTours)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadTours()

    return () => {
      ignore = true
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(searchInput)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
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
          tour.tags.some(tag => tag.toLowerCase().includes(q))
      )
    }

    if (activeCategory !== 'all') {
      result = result.filter((tour) => tour.category === activeCategory)
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
  }, [searchQuery, activeCategory, sortBy, tours])

  const totalDestinations = new Set(tours.map(t => t.location.city)).size
  const avgRating = tours.length > 0
    ? (tours.reduce((sum, t) => sum + t.rating, 0) / tours.length).toFixed(1)
    : '0.0'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden border-b border-slate-700/50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-14">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">✈️</span>
                <span className="text-xs sm:text-sm font-semibold text-blue-300 tracking-wide uppercase">
                  Explore Curated Travel
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  Discover Unforgettable
                </span>
                <br />
                <span className="text-white">Tour Experiences</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-6 leading-relaxed">
                Curated destinations with expert guides, premium stays, and seamless travel planning
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-2xl">
              {[
                { value: `${tours.length}+`, label: 'Packages' },
                { value: `${totalDestinations}+`, label: 'Places' },
                { value: avgRating, label: 'Rating' },
                { value: '24/7', label: 'Support' },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-700/30 hover:bg-slate-700/50 backdrop-blur-sm rounded-lg p-2.5 sm:p-3 text-center transition-colors duration-300">
                  <p className="text-lg sm:text-xl font-semibold text-blue-300">{stat.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border-b border-gray-100 py-5 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6">
            <form onSubmit={handleSearch} className="flex max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by destination, city, or activity..."
                  className="w-full h-12 pl-12 pr-10 rounded-l-xl border border-r-0 border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                />
                {searchInput && (
                  <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="h-12 px-6 sm:px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-r-xl transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </form>
          </div>
        </section>

        <section className="bg-white border-b border-gray-100 py-4 sticky top-14 z-40 shadow-lg">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      activeCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-auto"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="duration">Shortest First</option>
                  </select>
                </div>
                <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 pt-8 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {isLoading ? (
                <>Loading tours...</>
              ) : (
                <>
              Showing <span className="font-semibold text-gray-800">{filteredTours.length}</span> {filteredTours.length === 1 ? 'tour' : 'tours'}
              {searchQuery && <> for &quot;<span className="text-blue-600">{searchQuery}</span>&quot;</>}
              {activeCategory !== 'all' && <> in <span className="capitalize text-blue-600">{activeCategory}</span></>}
                </>
              )}
            </p>
            {(searchQuery || activeCategory !== 'all') && (
              <button
                onClick={() => { clearSearch(); setActiveCategory('all') }}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-6">
          {filteredTours.length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-4'
            }>
              {filteredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} layout={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No tours found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We couldn&apos;t find any tours matching your criteria. Try adjusting your search or filters.
              </p>
              <button
                onClick={() => { clearSearch(); setActiveCategory('all') }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
              >
                View All Tours
              </button>
            </div>
          )}
        </section>

        <section className="bg-white border-t border-gray-100 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Travel With Us</h2>
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.map((feature) => (
                <div key={feature.title} className="text-center p-6 rounded-2xl hover:bg-blue-50 transition-colors duration-300">
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

        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Can&apos;t Find Your Perfect Tour?</h2>
            <p className="text-blue-200 mb-6 max-w-md mx-auto">Let us customize a package just for you. Tell us your preferences and we&apos;ll create your dream itinerary.</p>
            <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl">
              Request Custom Tour
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
