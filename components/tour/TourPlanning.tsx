'use client'

import { useState } from 'react'
import type { Tour } from '@/lib/tours'

type TourPlanningProps = {
  tour: Tour
}

export const TourPlanning = ({ tour }: TourPlanningProps) => {
  const [planData, setPlanData] = useState({
    startDate: '',
    endDate: '',
    specialRequests: '',
  })

  const handleChange = (field: string, value: string) => {
    setPlanData({ ...planData, [field]: value })
  }

  const handleSubmit = () => {
    if (planData.startDate && planData.endDate) {
      alert('Tour plan saved! Our team will contact you soon.')
      // Reset form
      setPlanData({ startDate: '', endDate: '', specialRequests: '' })
    } else {
      alert('Please fill in the required fields')
    }
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-2xl font-bold text-slate-900">Plan Your Tour</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Start Date</label>
          <input
            type="date"
            value={planData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred End Date</label>
          <input
            type="date"
            value={planData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests & Preferences</label>
        <textarea
          value={planData.specialRequests}
          onChange={(e) => handleChange('specialRequests', e.target.value)}
          placeholder="Dietary restrictions, accessibility needs, activity preferences, etc."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
      >
        Save Tour Plan
      </button>

      {/* Quick Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-semibold text-slate-900 mb-2">💡 Tour Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ Best time: {tour.bestTimeToVisit}</li>
          <li>✓ Ideal group size: {tour.groupSize}</li>
          <li>✓ Pack according to season and activities</li>
          <li>✓ Bring travel insurance</li>
        </ul>
      </div>
    </div>
  )
}
