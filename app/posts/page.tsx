'use client'

import { useState, useEffect } from 'react'
import { userPosts } from '@/lib/userPosts'
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import Header from '@/components/layout/Header/Header'
import Footer from '@/components/layout/Footer/Footer'

export default function PostsPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likes, setLikes] = useState<Record<string, number>>({})
  const [liked, setLiked] = useState<Set<string>>(new Set())
  const [isSliding, setIsSliding] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const savedLikes = localStorage.getItem('postLikes')
    const savedLiked = localStorage.getItem('userLikes')
    
    if (savedLikes) {
      setLikes(JSON.parse(savedLikes))
    } else {
      const initialLikes: Record<string, number> = {}
      userPosts.forEach(post => {
        initialLikes[post.id] = post.likes
      })
      setLikes(initialLikes)
    }
    
    if (savedLiked) {
      setLiked(new Set(JSON.parse(savedLiked)))
    }
  }, [])

  // Save likes to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('postLikes', JSON.stringify(likes))
      localStorage.setItem('userLikes', JSON.stringify(Array.from(liked)))
    }
  }, [likes, liked, isMounted])

  const currentPost = userPosts[currentIndex]
  const hasLiked = liked.has(currentPost.id)

  const handleLike = () => {
    if (hasLiked) {
      setLiked(prev => {
        const newSet = new Set(prev)
        newSet.delete(currentPost.id)
        return newSet
      })
      setLikes(prev => ({
        ...prev,
        [currentPost.id]: prev[currentPost.id] - 1,
      }))
    } else {
      setLiked(prev => new Set(prev).add(currentPost.id))
      setLikes(prev => ({
        ...prev,
        [currentPost.id]: prev[currentPost.id] + 1,
      }))
    }
  }

  const handlePrevious = () => {
    setIsSliding(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev === 0 ? userPosts.length - 1 : prev - 1))
      setIsSliding(false)
    }, 300)
  }

  const handleNext = () => {
    setIsSliding(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev === userPosts.length - 1 ? 0 : prev + 1))
      setIsSliding(false)
    }, 300)
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white py-8 px-4 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-3">Weekly Travel Contest</h1>
            <p className="text-lg text-slate-600 mb-2">Vote for the best travel stories using <span className="font-semibold text-blue-600">#GetHotels</span></p>
            <p className="text-sm text-slate-500">🎁 Winner gets exclusive discounts & coupons every week</p>
          </div>

          {/* Main Card */}
          <div className={`transition-all duration-300 ${isSliding ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 hover:shadow-2xl transition-shadow duration-300">
              {/* Image Section */}
              <div className="relative h-80 sm:h-[500px] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300">
                <img
                  src={currentPost.image}
                  alt={currentPost.description}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-5 left-5">
                  <span className="px-4 py-2 bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold rounded-full shadow-lg">
                    {currentPost.category === 'hotel' ? '🏨 Hotel' : currentPost.category === 'tour' ? '✈️ Tour' : '🌍 Destination'}
                  </span>
                </div>

                {/* Winner Badge */}
                {currentIndex === userPosts.findIndex(p => likes[p.id] === Math.max(...Object.values(likes))) && (
                  <div className="absolute top-5 right-24 sm:right-32">
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900 text-xs font-bold rounded-full shadow-lg animate-bounce">
                      👑 Leading
                    </span>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-10">
                {/* User Info - Elegant */}
                <div className="flex items-center gap-4 mb-7 pb-7 border-b border-slate-200">
                  <div className="relative">
                    <img
                      src={currentPost.userImage}
                      alt={currentPost.username}
                      className="w-16 h-16 rounded-full border-3 border-blue-200 object-cover shadow-md"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-transparent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-base truncate">{currentPost.username}</h3>
                    <p className="text-xs text-slate-500 mt-1">{currentPost.timestamp}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-700 leading-relaxed mb-6 text-base sm:text-lg">{currentPost.description}</p>

                {/* Hashtags - Elegant Pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {currentPost.hashtags.map(tag => (
                    <span
                      key={tag}
                      className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full border border-blue-200 hover:border-blue-400 hover:from-blue-100 hover:to-blue-200 transition-all cursor-pointer shadow-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Like Section - Elegant Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                  <button
                    onClick={handleLike}
                    className="flex items-center gap-3 transition-all duration-300 group hover:scale-105"
                  >
                    <Heart
                      size={24}
                      className={`transition-all duration-300 ${
                        hasLiked ? 'fill-red-500 text-red-500' : 'text-slate-400 group-hover:text-red-400'
                      }`}
                    />
                    <span className={`text-sm font-bold transition-colors ${
                      hasLiked ? 'text-red-500' : 'text-slate-600'
                    }`}>
                      {likes[currentPost.id] || 0} {likes[currentPost.id] === 1 ? 'Like' : 'Likes'}
                    </span>
                  </button>

                  {/* Navigation - Elegant */}
                  <div className="flex gap-1 sm:gap-3 items-center">
                    <button
                      onClick={handlePrevious}
                      className="p-2.5 hover:bg-slate-100 rounded-full transition-all hover:scale-110 active:scale-95"
                      aria-label="Previous post"
                      title="Previous"
                    >
                      <ChevronLeft size={22} className="text-slate-600" />
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-blue-50 rounded-full border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">
                        {currentIndex + 1}
                      </span>
                      <span className="text-xs text-slate-500">/</span>
                      <span className="text-xs font-bold text-slate-700">
                        {userPosts.length}
                      </span>
                    </div>
                    <button
                      onClick={handleNext}
                      className="p-2.5 hover:bg-slate-100 rounded-full transition-all hover:scale-110 active:scale-95"
                      aria-label="Next post"
                      title="Next"
                    >
                      <ChevronRight size={22} className="text-slate-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard - Elegant */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">🏆 Top Posts This Week</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {userPosts
                .sort((a, b) => (likes[b.id] || 0) - (likes[a.id] || 0))
                .slice(0, 3)
                .map((post, idx) => (
                  <div key={post.id} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 shadow-md">
                        <span className="text-lg font-bold text-amber-900">#{idx + 1}</span>
                      </div>
                      <img src={post.userImage} alt={post.username} className="w-12 h-12 rounded-full border-2 border-slate-200 object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{post.username}</p>
                        <p className="text-xs text-slate-500 mt-1">{post.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                      <Heart size={18} className="fill-red-500 text-red-500" />
                      <span className="text-sm font-bold text-red-600">{likes[post.id] || 0}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Info Box - Elegant */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-8 sm:p-10 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              📸 How to Participate
            </h3>
            <ul className="space-y-4 text-slate-700">
              <li className="flex gap-4 items-start">
                <span className="text-blue-600 font-bold text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">1</span>
                <span className="text-base pt-1">Book a hotel or tour using <span className="font-bold text-blue-600">#GetHotels</span></span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-blue-600 font-bold text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">2</span>
                <span className="text-base pt-1">Share your travel experience on social media</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-blue-600 font-bold text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">3</span>
                <span className="text-base pt-1">Use our hashtag <span className="font-bold text-blue-600">#GetHotels</span> in your post</span>
              </li>
              <li className="flex gap-4 items-start">
                <span className="text-blue-600 font-bold text-xl flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full">4</span>
                <span className="text-base pt-1">Vote for your favorite posts on this page</span>
              </li>
              <li className="flex gap-4 items-start bg-white border-2 border-blue-200 rounded-2xl p-4 mt-4">
                <span className="text-2xl flex-shrink-0">🎁</span>
                <span className="text-base font-semibold text-blue-700 pt-1">Most liked post wins exclusive discounts & coupons every week!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
