"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"

type RentalRow = {
  id: string
  title: string
  city?: string | null
  status?: string
  isActive?: boolean
  vehicleType?: string
}

export default function AdminRentalsPage() {
  const [rows, setRows] = useState<RentalRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/rental")
      .then(({ data }) => setRows(Array.isArray(data.data) ? data.data : []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="p-6 lg:p-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">Admin</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">Rentals</h1>
        <p className="mt-2 text-sm text-slate-600">Review active travel rental inventory.</p>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Loading rentals...</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No rentals found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.16em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Rental</th>
                <th className="px-5 py-4">City</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-5 py-4 font-semibold text-slate-950">{row.title}</td>
                  <td className="px-5 py-4 text-slate-600">{row.city ?? "-"}</td>
                  <td className="px-5 py-4 text-slate-600">{row.vehicleType ?? "-"}</td>
                  <td className="px-5 py-4 text-slate-600">{row.status ?? (row.isActive ? "ACTIVE" : "PAUSED")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  )
}
