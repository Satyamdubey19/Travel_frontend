"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";
import {
  HostEmptyState,
  HostPage,
  HostPill,
  HostSection,
  HostStatCard,
} from "@/components/host/HostUI";
import Spinner from "@/components/ui/Spinner";
import RentalInspectionPanel from "@/components/rental/RentalInspectionPanel";
import IncidentReportPanel from "@/components/incident/IncidentReportPanel";

type Traveler = {
  id: string;
  fullName: string;
  age?: number | null;
  dob?: string | null;
  gender?: string | null;
  email?: string | null;
  phone?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  foodPreference?: string | null;
  medicalNotes?: string | null;
  bloodGroup?: string | null;
  relation?: string | null;
  status: string;
};
type HostBookingDetail = {
  id: string;
  bookingCode: string;
  bookingType: "tour" | "activity" | "rental";
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  numberOfGuests: number;
  quantityLabel?: string;
  totalPrice: number;
  currency: string;
  specialRequests?: string | null;
  guest: { name: string; email: string; phone: string };
  tour?: { name: string; city?: string | null } | null;
  payment?: {
    status: string;
    hostEarnings?: number | null;
    platformFee?: number | null;
    grossAmount?: number;
  } | null;
  travelers: Traveler[];
  refund?: {
    status: string;
    requestedAmount: number;
    approvedAmount?: number | null;
  } | null;
  cancellationPolicy?: string | null;
  timeline?: Array<{
    type: string;
    title: string;
    message?: string | null;
    createdAt: string;
  }>;
};

function dateLabel(value?: string | null) {
  return value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not set";
}
function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function HostBookingDetailPage() {
  const params = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<HostBookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const type =
          new URLSearchParams(window.location.search).get("type") ?? "tour";
        const { data } = await api.get<{ data: HostBookingDetail }>(
          `/host/bookings/${params.bookingId}?type=${encodeURIComponent(type)}`,
        );
        if (active) setBooking(data.data);
      } catch (cause) {
        if (active)
          setError(getApiErrorMessage(cause, "Could not load this booking."));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [params.bookingId]);

  if (loading)
    return <Spinner fullPage message="Loading booking operations…" />;
  if (!booking)
    return (
      <HostPage title="Booking unavailable" eyebrow="Operations">
        <HostEmptyState
          title="This booking could not be opened"
          description={error || "It may not belong to this host."}
          action={
            <Link
              href="/host/bookings"
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
            >
              Back to bookings
            </Link>
          }
        />
      </HostPage>
    );

  return (
    <HostPage
      eyebrow={`${booking.bookingType} operations`}
      title={booking.tour?.name ?? "Booking"}
      description={`Reference ${booking.bookingCode}`}
      actions={
        <Link
          href="/host/bookings"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          All bookings
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HostStatCard
          label="Booking status"
          value={
            <HostPill
              tone={
                booking.status === "confirmed"
                  ? "emerald"
                  : booking.status === "pending"
                    ? "amber"
                    : "slate"
              }
            >
              {booking.status.replaceAll("_", " ")}
            </HostPill>
          }
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <HostStatCard
          label={booking.bookingType === "rental" ? "Duration" : "Travelers"}
          value={booking.quantityLabel ?? booking.numberOfGuests}
          icon={<Users className="h-5 w-5" />}
          tone="cyan"
        />
        <HostStatCard
          label="Guest paid"
          value={money(booking.totalPrice)}
          icon={<CalendarDays className="h-5 w-5" />}
          tone="violet"
        />
        <HostStatCard
          label={
            booking.payment?.hostEarnings != null ? "Host earnings" : "Payment"
          }
          value={
            booking.payment?.hostEarnings != null
              ? money(booking.payment.hostEarnings)
              : (booking.payment?.status ?? "Not started")
          }
          hint={
            booking.payment?.hostEarnings != null
              ? booking.payment.status
              : "Settlement breakdown pending"
          }
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="emerald"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.5fr]">
        <HostSection title="Lead guest" eyebrow="Contact">
          <div className="space-y-3 p-5 text-sm">
            <p className="flex items-center gap-3 font-bold text-slate-900">
              <UserRound className="h-4 w-4 text-cyan-700" />
              {booking.guest.name}
            </p>
            <a
              href={`mailto:${booking.guest.email}`}
              className="flex items-center gap-3 text-slate-600 hover:text-cyan-700"
            >
              <Mail className="h-4 w-4" />
              {booking.guest.email}
            </a>
            <a
              href={`tel:${booking.guest.phone}`}
              className="flex items-center gap-3 text-slate-600 hover:text-cyan-700"
            >
              <Phone className="h-4 w-4" />
              {booking.guest.phone}
            </a>
            <p className="flex items-center gap-3 text-slate-600">
              <MapPin className="h-4 w-4" />
              {booking.tour?.city ?? "Meeting city pending"}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Starts
                </p>
                <p className="mt-1 font-bold">{dateLabel(booking.startDate)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-400">
                  Ends
                </p>
                <p className="mt-1 font-bold">{dateLabel(booking.endDate)}</p>
              </div>
            </div>
            {booking.specialRequests && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900">
                <p className="text-xs font-black uppercase">Special request</p>
                <p className="mt-1 leading-6">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </HostSection>

        <HostSection title="Traveler manifest" eyebrow="Trip safety">
          <div className="divide-y divide-slate-100">
            {booking.travelers.length ? (
              booking.travelers.map((traveler, index) => (
                <article key={traveler.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-cyan-700">
                        Traveler {index + 1} · {traveler.relation ?? "Guest"}
                      </p>
                      <h2 className="mt-1 text-lg font-black text-slate-950">
                        {traveler.fullName}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        {traveler.age
                          ? `${traveler.age} years`
                          : dateLabel(traveler.dob)}{" "}
                        ·{" "}
                        {traveler.gender?.replaceAll("_", " ") ??
                          "Gender not shared"}
                      </p>
                    </div>
                    <HostPill
                      tone={
                        traveler.status === "CONFIRMED" ? "emerald" : "amber"
                      }
                    >
                      {traveler.status}
                    </HostPill>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="flex items-center gap-2 font-bold">
                        <HeartPulse className="h-4 w-4 text-rose-600" />
                        Trip care notes
                      </p>
                      <p className="mt-2 leading-6">
                        {[
                          traveler.bloodGroup &&
                            `Blood: ${traveler.bloodGroup}`,
                          traveler.foodPreference,
                          traveler.medicalNotes,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "No care notes shared"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                      <p className="font-bold">Emergency contact</p>
                      <p className="mt-2">
                        {traveler.emergencyContactName || "Not provided"}
                      </p>
                      {traveler.emergencyContactPhone && (
                        <a
                          className="mt-1 block text-cyan-700"
                          href={`tel:${traveler.emergencyContactPhone}`}
                        >
                          {traveler.emergencyContactPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <HostEmptyState
                title={
                  booking.bookingType === "rental"
                    ? "Lead renter verified at pickup"
                    : "No traveler manifest"
                }
                description={
                  booking.bookingType === "rental"
                    ? "Use the lead guest contact and complete document checks during vehicle handover."
                    : "Legacy bookings may not include individual traveler records."
                }
              />
            )}
          </div>
        </HostSection>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <HostSection title="Booking timeline" eyebrow="Audit trail">
          <div className="space-y-4 p-5">
            {(booking.timeline ?? []).length ? (
              booking.timeline!.map((item, index) => (
                <div
                  key={`${item.type}-${item.createdAt}-${index}`}
                  className="flex gap-3"
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-500 shadow-[0_0_0_5px_rgba(6,182,212,0.12)]" />
                  <div>
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString("en-IN")}
                    </p>
                    {item.message && (
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {item.message}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No timeline events are available.
              </p>
            )}
          </div>
        </HostSection>
        <HostSection title="Cancellation and refund" eyebrow="Customer promise">
          <div className="space-y-3 p-5 text-sm leading-6 text-slate-600">
            <p>
              {booking.cancellationPolicy ||
                "No cancellation policy snapshot is available for this booking."}
            </p>
            {booking.refund && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950">
                <p className="font-black">
                  Refund: {booking.refund.status.replaceAll("_", " ")}
                </p>
                <p>
                  Requested {money(booking.refund.requestedAmount)}
                  {booking.refund.approvedAmount != null
                    ? ` · approved ${money(booking.refund.approvedAmount)}`
                    : ""}
                </p>
              </div>
            )}
          </div>
        </HostSection>
      </div>
      {booking.bookingType === "rental" && (
        <RentalInspectionPanel bookingId={booking.id} mode="host" />
      )}
      {booking.bookingType === "tour" && (
        <IncidentReportPanel bookingId={booking.id} audience="host" />
      )}
    </HostPage>
  );
}
