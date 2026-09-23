"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  ReceiptIndianRupee,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import api, { getApiErrorMessage } from "@/lib/axios";
import RentalInspectionPanel from "@/components/rental/RentalInspectionPanel";
import IncidentReportPanel from "@/components/incident/IncidentReportPanel";

type BookingDetail = {
  id: string;
  type: "TOUR" | "RENTAL" | "ACTIVITY";
  bookingCode: string;
  status: string;
  title: string;
  listingHref: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  contact: { name: string; email: string; phone: string };
  quantityLabel: string;
  subtotal: number;
  taxes: number;
  totalAmount: number;
  currency: string;
  paymentStatus: string | null;
  cancellationPolicy: string | null;
  cancellationReason: string | null;
  riskAcknowledgement?: {
    acknowledgedAt: string;
    snapshot: {
      riskLevel?: string;
      riskDisclosure?: string;
      meetingPoint?: string;
      eligibilityRequirements?: string[];
      requiredEquipment?: string[];
      minimumAge?: number;
      requiresCaretaker?: boolean;
    } | null;
  } | null;
  refund: {
    status: string;
    requestedAmount: number;
    approvedAmount: number | null;
    providerRefundId: string | null;
    failureReason: string | null;
  } | null;
  hostName: string | null;
  notes: string | null;
  timeline: {
    type: string;
    title: string;
    message: string | null;
    createdAt: string;
  }[];
};
const format = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function BookingDetailPage() {
  const params = useParams<{ type: string; id: string }>();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    void api
      .get<{ data: BookingDetail }>(
        `/my-bookings/${encodeURIComponent(params.type)}/${encodeURIComponent(params.id)}`,
      )
      .then(({ data }) => setBooking(data.data))
      .catch((requestError) =>
        setError(
          getApiErrorMessage(requestError, "Booking could not be loaded"),
        ),
      )
      .finally(() => setLoading(false));
  }, [params.id, params.type]);
  if (loading)
    return (
      <>
        <Header />
        <main className="min-h-[75vh] animate-pulse bg-slate-100" />
        <Footer />
      </>
    );
  if (error || !booking)
    return (
      <>
        <Header />
        <main className="grid min-h-[70vh] place-items-center bg-slate-50 p-6">
          <div className="rounded-3xl bg-white p-9 text-center shadow-xl">
            <h1 className="text-2xl font-black">Booking unavailable</h1>
            <p className="mt-2 text-slate-500">{error}</p>
            <Link
              href="/my-bookings"
              className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"
            >
              Back to bookings
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,.13),transparent_28%),#f8fafc]">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"
        >
          <ArrowLeft className="size-4" />
          My bookings
        </Link>
        <header className="mt-5 rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">
                {booking.type} · {booking.bookingCode}
              </p>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                {booking.title}
              </h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="size-4" />
                {booking.location}
              </p>
            </div>
            <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase text-cyan-200 ring-1 ring-white/15">
              {booking.status.replaceAll("_", " ")}
            </span>
          </div>
        </header>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: CalendarDays,
                  label: "Dates",
                  value: `${format(booking.startDate)}${booking.endDate ? ` → ${format(booking.endDate)}` : ""}`,
                },
                {
                  icon: UserRound,
                  label: "Reservation",
                  value: booking.quantityLabel,
                },
                {
                  icon: CreditCard,
                  label: "Payment",
                  value: booking.paymentStatus ?? "Not available",
                },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white bg-white/85 p-5 shadow-sm"
                >
                  <Icon className="size-5 text-cyan-600" />
                  <p className="mt-4 text-xs font-black uppercase tracking-[.15em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </section>
            <section className="rounded-[2rem] bg-white/85 p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-black">Booking timeline</h2>
              <div className="mt-5 space-y-0">
                {booking.timeline.map((item, index) => (
                  <div
                    key={`${item.createdAt}-${index}`}
                    className="grid grid-cols-[2rem_1fr] gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <span className="mt-1 size-3 rounded-full bg-cyan-500 ring-4 ring-cyan-100" />
                      {index < booking.timeline.length - 1 && (
                        <span className="min-h-16 w-px bg-slate-200" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="font-black text-slate-900">{item.title}</p>
                      {item.message && (
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {item.message}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {booking.refund && (
              <section className="rounded-[2rem] border border-orange-100 bg-orange-50 p-6">
                <h2 className="flex items-center gap-2 text-xl font-black text-orange-950">
                  <ReceiptIndianRupee className="size-5" />
                  Refund status
                </h2>
                <p className="mt-3 text-sm font-black uppercase text-orange-800">
                  {booking.refund.status.replaceAll("_", " ")}
                </p>
                <p className="mt-2 text-sm text-orange-900">
                  Requested ₹
                  {booking.refund.requestedAmount.toLocaleString("en-IN")}
                  {booking.refund.approvedAmount != null
                    ? ` · Approved ₹${booking.refund.approvedAmount.toLocaleString("en-IN")}`
                    : ""}
                </p>
                {booking.refund.failureReason && (
                  <p className="mt-2 text-sm text-rose-700">
                    {booking.refund.failureReason}
                  </p>
                )}
                {booking.refund.providerRefundId && (
                  <p className="mt-2 text-xs text-orange-700">
                    Provider reference: {booking.refund.providerRefundId}
                  </p>
                )}
              </section>
            )}
            {booking.type === "RENTAL" && (
              <RentalInspectionPanel bookingId={booking.id} mode="traveler" />
            )}
            {booking.type === "TOUR" && (
              <IncidentReportPanel bookingId={booking.id} />
            )}
          </div>
          <aside className="h-fit space-y-5 lg:sticky lg:top-24">
            <section className="rounded-[2rem] border border-white bg-white/90 p-6 shadow-xl">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <ReceiptIndianRupee className="text-cyan-600" />
                Payment summary
              </h2>
              <div className="mt-5 space-y-3 text-sm">
                <p className="flex justify-between">
                  <span>Subtotal</span>
                  <strong>₹{booking.subtotal.toLocaleString("en-IN")}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Taxes</span>
                  <strong>₹{booking.taxes.toLocaleString("en-IN")}</strong>
                </p>
                <p className="flex justify-between border-t border-slate-100 pt-3 text-base">
                  <span className="font-black">Total</span>
                  <strong>
                    ₹{booking.totalAmount.toLocaleString("en-IN")}
                  </strong>
                </p>
              </div>
            </section>
            <section className="rounded-[2rem] bg-white/90 p-6 shadow-sm">
              {booking.type === "TOUR" && booking.riskAcknowledgement && (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
                  <p className="text-xs font-black uppercase tracking-[.16em]">Risk disclosure captured</p>
                  <p className="mt-2 text-sm font-black">{(booking.riskAcknowledgement.snapshot?.riskLevel ?? "Recorded").replaceAll("_", " ")} risk · minimum age {booking.riskAcknowledgement.snapshot?.minimumAge ?? "recorded"}</p>
                  <p className="mt-2 text-sm leading-6">{booking.riskAcknowledgement.snapshot?.riskDisclosure ?? "The disclosure snapshot is retained with this booking."}</p>
                  <p className="mt-2 text-xs font-bold text-amber-800">Acknowledged {new Date(booking.riskAcknowledgement.acknowledgedAt).toLocaleString("en-IN")}. This does not waive legal rights.</p>
                </div>
              )}
              <h2 className="flex items-center gap-2 font-black">
                <ShieldCheck className="size-5 text-emerald-600" />
                Terms captured
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {booking.cancellationPolicy ||
                  "No cancellation policy was stored."}
              </p>
              {booking.cancellationReason && (
                <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
                  <strong>Cancellation reason:</strong>{" "}
                  {booking.cancellationReason}
                </p>
              )}
            </section>
            <section className="rounded-[2rem] bg-white/90 p-6 shadow-sm">
              <h2 className="font-black">Contact & host</h2>
              <p className="mt-3 text-sm text-slate-600">
                {booking.contact.name}
                <br />
                {booking.contact.email}
                <br />
                {booking.contact.phone}
              </p>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                Hosted by <strong>{booking.hostName || "Marketplace host"}</strong>
              </p>
            </section>
            <Link
              href={booking.listingHref}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 font-black text-white"
            >
              <CheckCircle2 className="size-5" />
              View listing
            </Link>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <Clock3 className="size-4" />
              Updates reflect stored booking and provider state.
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
