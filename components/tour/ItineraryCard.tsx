'use client'

import { useState } from 'react'
import { Itinerary } from '@/lib/tours'

type ItineraryCardProps = {
  itinerary: Itinerary[]
}

export const ItineraryCard = ({ itinerary }: ItineraryCardProps) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1)

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-[21px] top-10 bottom-10 w-0.5 bg-gradient-to-b from-slate-300 via-slate-200 to-transparent" />

      <div className="space-y-4">
        {itinerary.map((item, index) => {
          const isExpanded = expandedDay === item.day
          return (
            <div key={item.day} className="relative pl-14 animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
              {/* Timeline dot */}
              <div className={`absolute left-2 top-4 w-5 h-5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                isExpanded
                  ? 'bg-slate-900 border-slate-900 scale-110 shadow-md shadow-slate-900/20'
                  : 'bg-white border-slate-300'
              }`}>
                {isExpanded && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                )}
              </div>

              <button
                onClick={() => setExpandedDay(isExpanded ? null : item.day)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 ${
                  isExpanded
                    ? 'border-slate-200 bg-white shadow-lg shadow-slate-200/50'
                    : 'border-slate-100 bg-white/50 hover:border-slate-200 hover:bg-white hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg transition-colors ${
                      isExpanded ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>Day {item.day}</span>
                    <h4 className="font-semibold text-slate-900 text-sm">{item.title}</h4>
                  </div>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-slate-100 rotate-180' : 'bg-slate-50'}`}>
                    <svg
                      className="w-4 h-4 text-slate-500"
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 space-y-4" onClick={(e) => e.stopPropagation()}>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Activities */}
                      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activities</p>
                        </div>
                        <ul className="space-y-2">
                          {item.activities.map((activity, idx) => (
                            <li key={idx} className="flex items-center gap-2.5 text-sm text-slate-700">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0" />
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Meals */}
                      <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .62-.504 1.124-1.125 1.124H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" /></svg>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meals Included</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.meals.map((meal, idx) => (
                            <span key={idx} className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg font-medium">
                              {meal}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
