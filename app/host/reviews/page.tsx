"use client"

import { useEffect, useState } from "react"
import { MessageSquare, Star, ThumbsDown, ThumbsUp } from "lucide-react"
import { HostEmptyState, HostPage, HostSection, HostStatCard } from "@/components/host/HostUI"
import Spinner from "@/components/ui/Spinner"

interface Review {
  id: string
  rating: number
  comment: string
  guestName: string
  propertyName: string
  createdAt: string
  verified: boolean
}

export default function ReviewsPage() {
  const [reviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
  })

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        setStats({ averageRating: 4.5, totalReviews: 24, positive: 20, neutral: 3, negative: 1 })
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    void fetchReviews()
  }, [])

  if (loading) return <Spinner minimal />

  const ratingDistribution = [
    { star: 5, pct: 62 },
    { star: 4, pct: 21 },
    { star: 3, pct: 10 },
    { star: 2, pct: 4 },
    { star: 1, pct: 3 },
  ]

  return (
    <HostPage
      eyebrow="Reputation"
      title="Guest Reviews"
      description="Monitor guest sentiment, respond to feedback, and protect your listing's ranking."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HostStatCard label="Average rating" value={`${stats.averageRating}/5`} hint="Overall" tone="amber" icon={<Star className="h-5 w-5" />} />
        <HostStatCard label="Total reviews" value={stats.totalReviews} tone="cyan" icon={<MessageSquare className="h-5 w-5" />} />
        <HostStatCard label="Positive" value={stats.positive} hint=">= 4 stars" tone="emerald" icon={<ThumbsUp className="h-5 w-5" />} />
        <HostStatCard label="Needs attention" value={stats.negative} hint="< 3 stars" tone="rose" icon={<ThumbsDown className="h-5 w-5" />} />
      </section>

      <HostSection title="Rating breakdown" eyebrow="Distribution">
        <div className="space-y-3 p-5">
          {ratingDistribution.map(({ star, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex w-12 shrink-0 items-center gap-1 text-sm font-semibold text-slate-700">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {star}
              </div>
              <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-amber-400 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right text-xs font-semibold text-slate-500">{pct}%</span>
            </div>
          ))}
        </div>
      </HostSection>

      <HostSection title="Recent reviews" eyebrow="Feedback">
        {reviews.length === 0 ? (
          <HostEmptyState
            icon={<MessageSquare className="h-6 w-6" />}
            title="No reviews yet"
            description="Once guests check out they can leave reviews. They will appear here."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <div key={review.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{review.guestName}</p>
                    <p className="text-xs text-slate-500">{review.propertyName}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {review.rating.toFixed(1)}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                    {review.verified && <span className="ml-2 font-semibold text-emerald-600">Verified</span>}
                  </p>
                  <button className="text-xs font-semibold text-sky-600 transition hover:text-sky-700">Reply</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </HostSection>
    </HostPage>
  )
}
