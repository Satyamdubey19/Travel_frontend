import { ArrowUpRight, BarChart3, CalendarDays, IndianRupee, Star, Users } from "lucide-react"
import { HostPage, HostPill, HostSection, HostStatCard } from "@/components/host/HostUI"

const metrics = [
  { title: "Total revenue", value: "Rs 12.5L", change: "+12%", icon: IndianRupee, tone: "cyan" as const },
  { title: "Occupancy", value: "75%", change: "+5%", icon: BarChart3, tone: "emerald" as const },
  { title: "Guests hosted", value: "245", change: "+22%", icon: Users, tone: "amber" as const },
  { title: "Average rating", value: "4.8", change: "+0.3", icon: Star, tone: "violet" as const },
]

const revenueBars = [42, 58, 54, 72, 66, 84, 78, 92]
const bookingBars = [36, 48, 44, 68, 62, 74, 88, 82]

const properties = [
  { name: "Grand Hotel", bookings: 45, revenue: "Rs 8.5L", occupancy: "85%", rating: "4.9" },
  { name: "Beach Resort", bookings: 32, revenue: "Rs 6.4L", occupancy: "72%", rating: "4.7" },
  { name: "Mountain Adventure", bookings: 18, revenue: "Rs 3.6L", occupancy: "65%", rating: "4.6" },
]

export default function AnalyticsPage() {
  return (
    <HostPage
      eyebrow="Reports"
      title="Analytics"
      description="A clear look at revenue, booking pace, occupancy, and property-level performance."
      actions={<HostPill tone="emerald"><CalendarDays className="h-3.5 w-3.5" /> Last 30 days</HostPill>}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ title, value, change, icon: Icon, tone }) => (
          <HostStatCard
            key={title}
            label={title}
            value={value}
            hint={change}
            tone={tone}
            icon={<Icon className="h-5 w-5" />}
          />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Monthly revenue" subtitle="Earnings trend across active listings" bars={revenueBars} tone="bg-cyan-600" />
        <ChartCard title="Booking velocity" subtitle="Reservations accepted by month" bars={bookingBars} tone="bg-emerald-600" />
      </section>

      <HostSection title="Property scoreboard" eyebrow="Portfolio performance">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left">Property</th>
                <th className="px-5 py-3 text-left">Bookings</th>
                <th className="px-5 py-3 text-left">Revenue</th>
                <th className="px-5 py-3 text-left">Occupancy</th>
                <th className="px-5 py-3 text-left">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map(property => (
                <tr key={property.name} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4 font-bold text-slate-950">{property.name}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{property.bookings}</td>
                  <td className="px-5 py-4 font-bold text-slate-950">{property.revenue}</td>
                  <td className="px-5 py-4 font-semibold text-slate-700">{property.occupancy}</td>
                  <td className="px-5 py-4 font-bold text-amber-600">{property.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HostSection>
    </HostPage>
  )
}

function ChartCard({ title, subtitle, bars, tone }: { title: string; subtitle: string; bars: number[]; tone: string }) {
  return (
    <HostSection
      title={title}
      description={subtitle}
      actions={<HostPill><ArrowUpRight className="h-3.5 w-3.5" /> Live</HostPill>}
    >
      <div className="flex h-64 items-end gap-3 p-5">
        {bars.map((height, index) => (
          <span key={`${title}-${index}`} className="flex flex-1 items-end rounded-lg bg-slate-50 p-1.5">
            <span
              className={`w-full rounded-md ${tone} shadow-sm transition hover:opacity-80`}
              style={{ height: `${height}%` }}
            />
          </span>
        ))}
      </div>
    </HostSection>
  )
}
