'use client'

import { useWishlist } from '@/contexts/WishlistContext'
import Header from '@/components/layout/Header/Header'
import Footer from '@/components/layout/Footer/Footer'
import Link from 'next/link'
import Image from 'next/image'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">â¤ï¸ My Wishlist</h1>
            <p className="text-gray-600 text-lg">
              {wishlist.length === 0
                ? 'Your wishlist is empty. Start adding your favorite Tours and tours!'
                : `You have ${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} in your wishlist`}
            </p>
          </div>

          {wishlist.length === 0 ? (
            // Empty State
            <div className="text-center py-20">
              <div className="text-6xl mb-6">ðŸŽ’</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">No Wishlist Items Yet</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Explore our amazing Tours and tours, and add your favorites to the wishlist to save them for later!
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/tours"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:shadow-lg transition-all"
                >
                  Explore Tours
                </Link>
                <Link
                  href="/tours"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-full hover:shadow-lg transition-all"
                >
                  Explore Tours
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Wishlist Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {wishlist.map((item) => (
                  <div
                    key={`${item.type}-${item.slug}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                  >
                    {/* Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                      {/* Badge */}
                      <div className="absolute top-4 left-4 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full font-semibold text-sm text-gray-800 capitalize">
                        {item.type}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromWishlist(item.slug, item.type)}
                        className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg text-white"
                        title="Remove from wishlist"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Price</p>
                          <p className="text-2xl font-bold text-blue-600">â‚¹{item.price.toLocaleString()}</p>
                        </div>
                        <Link
                          href={`/${item.type}s/${item.slug}`}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all hover:scale-105"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Wishlist Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your entire wishlist?')) {
                      clearWishlist()
                    }
                  }}
                  className="px-8 py-3 bg-red-100 text-red-600 font-semibold rounded-full hover:bg-red-200 transition-all"
                >
                  Clear All Wishlist
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

