"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Car,
  Check,
  CreditCard,
  FileCheck2,
  Fuel,
  Gauge,
  MapPin,
  ShieldCheck,
  Star,
  WalletCards,
} from "lucide-react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api, { getApiErrorMessage } from "@/lib/axios";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import PolicyModal from "@/components/policy/PolicyModal";
import DatePicker from "@/components/ui/DatePicker";
import { findRentalBySlug, type Rental, type RentalReview } from "@/lib/rentals";

const dateInput = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export default function RentalDetailPage() {
  const slug = String(useParams<{ slug: string }>().slug);
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [rental, setRental] = useState<Rental | null>(null);
  const [reviews, setReviews] = useState<RentalReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pickupDate, setPickupDate] = useState(dateInput(1));
  const [returnDate, setReturnDate] = useState(dateInput(2));
  const [pickupTime, setPickupTime] = useState("10:00");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [helmet, setHelmet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<null | "TRAVELER_SAFETY_POLICY" | "CANCELLATION_POLICY">(null);
  const idempotencyKey = useRef(crypto.randomUUID());

  useEffect(() => {
    void Promise.all([
      api.get<{ data: Rental }>(`/rental/${encodeURIComponent(slug)}`),
      api.get<{ data: RentalReview[] }>(
        `/rental/${encodeURIComponent(slug)}/reviews`,
      ).catch(() => ({ data: { data: [] as RentalReview[] } })),
    ])
      .then(([rentalResponse, reviewResponse]) => {
        const liveRental = rentalResponse.data?.data || findRentalBySlug(slug);
        if (liveRental) {
          setRental(liveRental);
          setReviews(reviewResponse.data?.data ?? []);
        } else {
          setRental(null);
          setError("Rental not found");
        }
      })
      .catch((requestError) => {
        const fallback = findRentalBySlug(slug);
        if (fallback) {
          setRental(fallback);
        } else {
          setError(
            getApiErrorMessage(requestError, "Rental could not be loaded"),
          );
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);
  const days = useMemo(
    () =>
      Math.max(
        0,
        Math.round(
          (new Date(`${returnDate}T00:00:00Z`).getTime() -
            new Date(`${pickupDate}T00:00:00Z`).getTime()) /
            86_400_000,
        ),
      ),
    [pickupDate, returnDate],
  );
  const total = (rental?.pricePerDay ?? 0) * days;

  const checkout = async () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(`/car-rental/${slug}`)}`);
      return;
    }
    if (!policyAgreed) {
      return setCheckoutMessage(
        "Please confirm possession of a valid driving license and accept the Rental Safety Guidelines and Cancellation Policy.",
      );
    }
    if (!rental || !rental.cancellation)
      return setCheckoutMessage(
        "This host must publish cancellation terms before checkout.",
      );
    if (days < 1)
      return setCheckoutMessage("Return date must be after pickup date.");
    if (!name.trim() || !email.trim() || phone.trim().length < 8)
      return setCheckoutMessage("Complete your contact name, email and phone.");
    try {
      setBusy(true);
      setCheckoutMessage("");
      const { data: bookingPayload } = await api.post<{
        data: { id: string; bookingCode: string };
      }>(`/rental/${encodeURIComponent(slug)}/booking`, {
        pickupDate,
        returnDate,
        pickupTime,
        withHelmet: helmet,
        contactName: name.trim(),
        contactEmail: email.trim(),
        contactPhone: phone.trim(),
        notes: notes.trim() || undefined,
        idempotencyKey: idempotencyKey.current,
      });
      const { data: orderPayload } = await api.post<{
        data: {
          orderId: string;
          amount: number;
          currency: string;
          keyId: string;
          bookingCode: string;
        };
      }>(`/rental/${encodeURIComponent(slug)}/payment/order`, {
        bookingId: bookingPayload.data.id,
      });
      const response = await openRazorpayCheckout({
        key: orderPayload.data.keyId,
        amount: orderPayload.data.amount,
        currency: orderPayload.data.currency,
        name: "Travels Pro",
        description: `${rental.title} · ${days} day${days === 1 ? "" : "s"}`,
        order_id: orderPayload.data.orderId,
        prefill: { name, email, contact: phone },
        notes: { bookingCode: orderPayload.data.bookingCode },
        theme: { color: "#0891b2" },
      });
      const { data: verified } = await api.post<{
        data: { bookingCode: string };
      }>(`/rental/${encodeURIComponent(slug)}/payment/verify`, response);
      idempotencyKey.current = crypto.randomUUID();
      setCheckoutMessage(
        `Confirmed. Your rental reference is ${verified.data.bookingCode}.`,
      );
    } catch (requestError) {
      setCheckoutMessage(
        getApiErrorMessage(requestError, "Checkout could not be completed"),
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return (
      <>
        <Header />
        <main className="min-h-[75vh] animate-pulse bg-slate-100" />
        <Footer />
      </>
    );
  if (error || !rental)
    return (
      <>
        <Header />
        <main className="grid min-h-[70vh] place-items-center bg-slate-50 p-6">
          <div className="max-w-lg rounded-3xl bg-white p-9 text-center shadow-xl">
            <Car className="mx-auto size-10 text-slate-300" />
            <h1 className="mt-4 text-2xl font-black">Rental unavailable</h1>
            <p className="mt-2 text-slate-500">
              {error || "This rental is no longer public."}
            </p>
            <Link
              href="/car-rental"
              className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"
            >
              Browse rentals
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_90%_4%,rgba(6,182,212,.14),transparent_24%),#f8fafc]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link
          href="/car-rental"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="size-4" />
          All rentals
        </Link>
        <section className="mt-5 overflow-hidden rounded-[2.25rem] border border-white bg-white/75 shadow-[0_28px_80px_rgba(15,23,42,.1)] backdrop-blur-2xl">
          <div className="grid lg:grid-cols-[1.2fr_.8fr]">
            <div className="relative min-h-80 overflow-hidden bg-slate-200 lg:min-h-[31rem]">
              <img
                src={rental.image}
                alt={rental.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-7 text-white sm:p-10">
                <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-200">
                  {rental.brand} · {rental.type}
                </p>
                <h1 className="mt-2 text-3xl font-black sm:text-5xl">
                  {rental.title}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-sm text-white/80">
                  <MapPin className="size-4" />
                  {rental.pickupArea}, {rental.city}
                </p>
              </div>
            </div>
            <div className="p-7 sm:p-9">
              <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                Trip-ready details
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Gauge,
                    label: rental.transmission || rental.engine || "Vehicle",
                  },
                  {
                    icon: Fuel,
                    label: rental.fuel || "Fuel details with host",
                  },
                  {
                    icon: Car,
                    label: rental.seats ? `${rental.seats} seats` : rental.type,
                  },
                  {
                    icon: Star,
                    label: rental.reviews
                      ? `${rental.rating} · ${rental.reviews} reviews`
                      : "New listing",
                  },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                  >
                    <Icon className="size-5 text-cyan-600" />
                    <p className="mt-3 text-sm font-bold text-slate-800">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
                <div className="flex items-center gap-2 font-black">
                  <BadgeCheck className="size-5 text-cyan-300" />
                  {rental.vendor.name}
                </div>
                <p className="mt-2 text-sm text-white/60">
                  {rental.vendor.verified
                    ? "Approved and verified host"
                    : "Verification unavailable"}
                </p>
              </div>
            </div>
          </div>
        </section>
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_25rem]">
          <div className="space-y-6">
            <section className="rounded-[2rem] border border-white bg-white/80 p-6 shadow-sm backdrop-blur-xl sm:p-8">
              <h2 className="text-2xl font-black">
                Included with this listing
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {rental.features.length ? (
                  rental.features.map((item) => (
                    <p
                      key={item}
                      className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      {item}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Ask the host to confirm included equipment before pickup.
                  </p>
                )}
              </div>
            </section>
            <section className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[2rem] bg-white/80 p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-black">
                  <FileCheck2 className="text-cyan-600" />
                  Documents
                </h2>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {rental.documents.length ? (
                    rental.documents.map((item) => <li key={item}>• {item}</li>)
                  ) : (
                    <li>
                      Confirm valid licence and government ID requirements with
                      the host.
                    </li>
                  )}
                </ul>
              </div>
              <div className="rounded-[2rem] bg-white/80 p-6 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-black">
                  <WalletCards className="text-cyan-600" />
                  Deposit & cancellation
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Refundable/security deposit shown by host:{" "}
                  <strong>₹{rental.deposit.toLocaleString("en-IN")}</strong>.
                  This is not included in the online total.
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {rental.cancellation ||
                    "Cancellation terms are not published; checkout is disabled."}
                </p>
              </div>
            </section>
            <section className="rounded-[2rem] bg-white/80 p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black">Verified traveler reviews</h2>
              {reviews.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <p className="font-black">{review.User.name}</p>
                      <p className="mt-1 text-amber-500">
                        {"★".repeat(review.rating)}
                        <span className="text-slate-300">
                          {"★".repeat(5 - review.rating)}
                        </span>
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {review.comment}
                      </p>
                      {review.response && (
                        <div className="mt-4 rounded-xl border-l-4 border-cyan-500 bg-cyan-50 p-3">
                          <p className="text-xs font-black uppercase text-cyan-800">
                            Host response
                          </p>
                          <p className="mt-1 text-sm leading-6 text-cyan-950">
                            {review.response}
                          </p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  No completed-rental reviews yet.
                </p>
              )}
            </section>
          </div>
          <aside className="h-fit rounded-[2rem] border border-white bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,.12)] backdrop-blur-2xl lg:sticky lg:top-24">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-400">Daily rate</p>
                <p className="text-3xl font-black">
                  ₹{rental.pricePerDay.toLocaleString("en-IN")}
                </p>
              </div>
              <ShieldCheck className="size-7 text-cyan-600" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <DatePicker
                label="Pickup"
                value={pickupDate}
                onChange={setPickupDate}
                minDate={dateInput(0)}
              />
              <DatePicker
                label="Return"
                value={returnDate}
                onChange={setReturnDate}
                minDate={pickupDate || dateInput(0)}
              />
            </div>
            <label className="mt-3 block text-xs font-bold text-slate-600">
              Pickup time
              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3"
              />
            </label>
            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5">
              {[
                ["Name", name, setName, "text"],
                ["Email", email, setEmail, "email"],
                ["Phone", phone, setPhone, "tel"],
              ].map(([label, value, setter, type]) => (
                <label
                  key={String(label)}
                  className="block text-xs font-bold text-slate-600"
                >
                  {String(label)}
                  <input
                    type={String(type)}
                    value={String(value)}
                    onChange={(e) =>
                      (setter as (value: string) => void)(e.target.value)
                    }
                    className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  />
                </label>
              ))}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Pickup notes or accessibility needs"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
              {rental.type === "bike" && (
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={helmet}
                    onChange={(e) => setHelmet(e.target.checked)}
                  />
                  Request helmet (confirm availability at pickup)
                </label>
              )}
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between">
                <span>
                  {days || 0} day{days === 1 ? "" : "s"}
                </span>
                <strong>₹{total.toLocaleString("en-IN")}</strong>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Taxes and delivery: ₹0. Security deposit, fuel and incidentals
                are separate.
              </p>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs text-slate-700">
              <label className="flex cursor-pointer items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={policyAgreed}
                  onChange={(e) => setPolicyAgreed(e.target.checked)}
                  className="mt-0.5 size-4 accent-cyan-600 rounded cursor-pointer"
                />
                <span className="leading-snug">
                  I confirm holding an active government driving license, agree to pre/post inspection custody rules, and accept the{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePolicyModal("TRAVELER_SAFETY_POLICY");
                    }}
                    className="font-bold text-cyan-700 hover:underline underline-offset-2"
                  >
                    Rental Safety Guidelines
                  </button>{" "}
                  and{" "}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivePolicyModal("CANCELLATION_POLICY");
                    }}
                    className="font-bold text-cyan-700 hover:underline underline-offset-2"
                  >
                    Cancellation Policy
                  </button>
                  .
                </span>
              </label>
            </div>

            <button
              type="button"
              disabled={busy || authLoading || days < 1 || !rental.cancellation || !policyAgreed}
              onClick={() => void checkout()}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f172a,#0891b2)] font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CreditCard className="size-5" />
              {busy
                ? "Securing your ride…"
                : isAuthenticated
                  ? "Hold & pay securely"
                  : "Sign in to continue"}
            </button>
            {checkoutMessage && (
              <p
                role="status"
                className="mt-3 rounded-xl bg-cyan-50 p-3 text-sm font-semibold text-cyan-900"
              >
                {checkoutMessage}
              </p>
            )}
            <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <CalendarDays className="size-4" />
              Availability is rechecked before payment.
            </p>
          </aside>
        </div>
      </main>
      <Footer />
      <PolicyModal
        isOpen={Boolean(activePolicyModal)}
        policyType={activePolicyModal || "TRAVELER_SAFETY_POLICY"}
        onClose={() => setActivePolicyModal(null)}
      />
    </div>
  );
}
