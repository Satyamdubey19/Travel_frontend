"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";
import PolicyModal from "@/components/policy/PolicyModal";
import DatePicker from "@/components/ui/DatePicker";

type Slot = {
  id?: string;
  date: string;
  startTime: string;
  totalSpots: number;
  bookedSpots?: number;
  isActive?: boolean;
};
type Form = {
  slug: string;
  title: string;
  description: string;
  city: string;
  state: string;
  country: string;
  area: string;
  category: string;
  difficulty: string;
  price: string;
  originalPrice: string;
  duration: string;
  groupSizeMin: string;
  groupSizeMax: string;
  totalSlots: string;
  availableSlots: string;
  language: string;
  image: string;
  highlights: string;
  included: string;
  excluded: string;
  meetingPoint: string;
  cancellationPolicy: string;
};
const initial: Form = {
  slug: "",
  title: "",
  description: "",
  city: "",
  state: "",
  country: "India",
  area: "",
  category: "ADVENTURE",
  difficulty: "EASY",
  price: "",
  originalPrice: "",
  duration: "2 hours",
  groupSizeMin: "1",
  groupSizeMax: "20",
  totalSlots: "20",
  availableSlots: "20",
  language: "English",
  image: "",
  highlights: "",
  included: "",
  excluded: "",
  meetingPoint: "",
  cancellationPolicy: "",
};
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const futureDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export default function ActivityListingForm({
  activityId,
}: {
  activityId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [newSlot, setNewSlot] = useState<Slot>({
    date: futureDate(),
    startTime: "09:00",
    totalSpots: 10,
  });
  const [loading, setLoading] = useState(Boolean(activityId));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [safetyAgreementAgreed, setSafetyAgreementAgreed] = useState(true);
  const [activePolicyModal, setActivePolicyModal] = useState<null | "HOST_SAFETY_AGREEMENT">(null);
  useEffect(() => {
    if (!activityId) return;
    void Promise.all([
      api.get(`/activity/${activityId}?scope=mine`),
      api.get(`/activity/${activityId}/slots`),
    ])
      .then(([activityResponse, slotResponse]) => {
        const item = activityResponse.data.data;
        setForm({
          slug: item.slug ?? "",
          title: item.title ?? "",
          description: item.description ?? "",
          city: item.city ?? "",
          state: item.state ?? "",
          country: item.country ?? "India",
          area: item.area ?? "",
          category: item.category ?? "ADVENTURE",
          difficulty: item.difficulty ?? "EASY",
          price: item.price ?? "",
          originalPrice: item.originalPrice ?? "",
          duration: item.duration ?? "",
          groupSizeMin: item.groupSizeMin ?? "1",
          groupSizeMax: item.groupSizeMax ?? "20",
          totalSlots: item.totalSlots ?? "20",
          availableSlots: item.availableSlots ?? "20",
          language: item.language ?? "English",
          image: item.images?.[0] ?? item.imageUrl ?? "",
          highlights: (item.highlights ?? []).join(", "),
          included: (item.included ?? []).join(", "),
          excluded: (item.excluded ?? []).join(", "),
          meetingPoint: item.meetingPoint ?? "",
          cancellationPolicy: item.cancellationPolicy ?? "",
        });
        setSlots(slotResponse.data.data ?? []);
      })
      .catch((error) =>
        setMessage(getApiErrorMessage(error, "Activity could not be loaded")),
      )
      .finally(() => setLoading(false));
  }, [activityId]);
  const update = (key: keyof Form, value: string) =>
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "title" && !activityId ? { slug: slugify(value) } : {}),
    }));
  const list = (value: string) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!safetyAgreementAgreed) {
      setMessage("You must agree to the Host Safety Agreement to publish an activity.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        images: [form.image].filter(Boolean),
        highlights: list(form.highlights),
        included: list(form.included),
        excluded: list(form.excluded),
      };
      let id = activityId;
      if (id) await api.put(`/activity/${id}`, payload);
      else {
        id = (await api.post("/activity", payload)).data.data.id;
      }
      if (!activityId && id && newSlot.date)
        await api.post(`/activity/${id}/slots`, newSlot);
      router.push("/host/activities");
      router.refresh();
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Activity could not be submitted"));
    } finally {
      setSaving(false);
    }
  };
  const addSlot = async () => {
    if (!activityId) return;
    setMessage("");
    try {
      const { data } = await api.post(`/activity/${activityId}/slots`, newSlot);
      setSlots((items) => [...items, data.data]);
      setNewSlot({ ...newSlot, date: futureDate() });
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Slot could not be added"));
    }
  };
  const removeSlot = async (slot: Slot) => {
    if (!activityId || !slot.id) return;
    try {
      await api.delete(`/activity/${activityId}/slots/${slot.id}`);
      setSlots((items) => items.filter((item) => item.id !== slot.id));
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Slot could not be removed"));
    }
  };
  if (loading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="size-8 animate-spin text-emerald-600" />
      </div>
    );
  const field = (
    key: keyof Form,
    label: string,
    type = "text",
    optional = false,
  ) => (
    <label className="text-sm font-bold text-slate-700">
      {label}
      <input
        type={type}
        value={form[key]}
        onChange={(e) => update(key, e.target.value)}
        required={!optional}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.12),transparent_30%),#f8fafc] p-4 sm:p-7">
      <form onSubmit={submit} className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[2rem] bg-slate-950 p-7 text-white">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-emerald-300">
            <Sparkles className="size-4" />
            Experience studio
          </p>
          <h1 className="mt-3 text-3xl font-black">
            {activityId
              ? "Edit and resubmit activity"
              : "Create a hosted local activity"}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Clear inclusions, safety expectations, cancellation terms and real
            dated capacity build traveler confidence.
          </p>
        </header>
        <section className="rounded-[2rem] bg-white/90 p-6 shadow-sm">
          <h2 className="text-xl font-black">Experience basics</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {field("title", "Activity title")}
            {field("slug", "Public URL slug")}
            {field("city", "City")}
            {field("area", "Area / locality")}
            {field("state", "State", "text", true)}
            {field("country", "Country")}
            <label className="text-sm font-bold">
              Category
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4"
              >
                {[
                  "ADVENTURE",
                  "WATER",
                  "HERITAGE",
                  "WELLNESS",
                  "FOOD",
                  "NATURE",
                  "CULTURE",
                  "SPORTS",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold">
              Difficulty
              <select
                value={form.difficulty}
                onChange={(e) => update("difficulty", e.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4"
              >
                {["EASY", "MODERATE", "HIGH"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-5 block text-sm font-bold">
            Description
            <textarea
              required
              minLength={40}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-2xl border border-slate-200 p-4"
            />
          </label>
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white/90 p-6">
            <h2 className="text-xl font-black">Price & group</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {field("price", "Price per guest (₹)", "number")}
              {field("originalPrice", "Original price", "number", true)}
              {field("duration", "Duration")}
              {field("language", "Language")}
              {field("groupSizeMin", "Minimum group", "number")}
              {field("groupSizeMax", "Maximum group", "number")}
              {field("totalSlots", "Display capacity", "number")}
              {field("availableSlots", "Display availability", "number")}
            </div>
          </div>
          <div className="rounded-[2rem] bg-white/90 p-6">
            <h2 className="text-xl font-black">Meeting & media</h2>
            <div className="mt-5 space-y-5">
              {field("meetingPoint", "Meeting point")}
              {field("image", "Activity image URL", "url")}
              <p className="text-xs leading-5 text-slate-500">
                Use a clear, recent image you own or are licensed to publish.
                Private document uploads do not belong here.
              </p>
            </div>
          </div>
        </section>
        <section className="rounded-[2rem] bg-white/90 p-6">
          <h2 className="text-xl font-black">What travelers should know</h2>
          <div className="mt-5 grid gap-5">
            <label className="text-sm font-bold">
              Highlights (comma separated)
              <textarea
                value={form.highlights}
                onChange={(e) => update("highlights", e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-2xl border border-slate-200 p-4"
              />
            </label>
            <label className="text-sm font-bold">
              Included (comma separated)
              <textarea
                value={form.included}
                onChange={(e) => update("included", e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-2xl border border-slate-200 p-4"
              />
            </label>
            <label className="text-sm font-bold">
              Excluded (comma separated)
              <textarea
                value={form.excluded}
                onChange={(e) => update("excluded", e.target.value)}
                rows={2}
                className="mt-2 w-full rounded-2xl border border-slate-200 p-4"
              />
            </label>
            <label className="text-sm font-bold">
              Cancellation policy
              <textarea
                required
                minLength={20}
                maxLength={2000}
                value={form.cancellationPolicy}
                onChange={(e) => update("cancellationPolicy", e.target.value)}
                rows={5}
                className="mt-2 w-full rounded-2xl border border-slate-200 p-4"
              />
            </label>
          </div>
        </section>
        <section className="rounded-[2rem] border border-emerald-100 bg-emerald-50 p-6">
          <h2 className="flex items-center gap-2 text-xl font-black">
            <CalendarPlus className="text-emerald-600" />
            Dated booking slots
          </h2>
          {activityId && slots.length > 0 && (
            <div className="mt-4 space-y-2">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between rounded-2xl bg-white p-3 text-sm"
                >
                  <span className="font-bold">
                    {new Date(slot.date).toLocaleDateString("en-IN")} ·{" "}
                    {slot.startTime} · {slot.bookedSpots ?? 0}/{slot.totalSpots}{" "}
                    booked
                  </span>
                  <button
                    type="button"
                    disabled={Boolean(slot.bookedSpots)}
                    onClick={() => void removeSlot(slot)}
                    className="rounded-xl p-2 text-rose-600 disabled:opacity-30"
                    aria-label="Remove slot"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <DatePicker
              placeholder="Select slot date"
              minDate={futureDate()}
              value={newSlot.date}
              onChange={(val) => setNewSlot({ ...newSlot, date: val })}
              inputClassName="border-emerald-200"
            />
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, startTime: e.target.value })
              }
              className="h-11 rounded-xl border border-emerald-200 px-3"
            />
            <input
              type="number"
              min="1"
              max="100"
              value={newSlot.totalSpots}
              onChange={(e) =>
                setNewSlot({ ...newSlot, totalSpots: Number(e.target.value) })
              }
              className="h-11 rounded-xl border border-emerald-200 px-3"
            />
            {activityId && (
              <button
                type="button"
                onClick={() => void addSlot()}
                className="rounded-xl bg-emerald-700 px-4 text-sm font-black text-white"
              >
                Add slot
              </button>
            )}
          </div>
          {!activityId && (
            <p className="mt-3 text-xs text-emerald-900">
              This first slot will be created after the listing is saved. More
              slots can be added while editing.
            </p>
          )}
        </section>
        {message && (
          <p
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700"
          >
            {message}
          </p>
        )}
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/70 p-5 text-emerald-950 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="size-5 text-emerald-600" />
            Host Safety Accord & Verification Standard
          </div>
          <p className="mt-2 text-xs leading-relaxed text-emerald-900">
            By publishing an experience on Travels Pro, you certify that all safety equipment is certified and maintained, guides hold applicable local accreditations, and passenger safety standards are upheld under the Digital Personal Data Protection Act, 2023.
          </p>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs font-semibold">
            <input
              type="checkbox"
              checked={safetyAgreementAgreed}
              onChange={(e) => setSafetyAgreementAgreed(e.target.checked)}
              className="mt-0.5 size-4 accent-emerald-700 rounded cursor-pointer"
            />
            <span>
              I agree to abide by the{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePolicyModal("HOST_SAFETY_AGREEMENT");
                }}
                className="font-bold underline text-emerald-800 hover:text-emerald-950"
              >
                Host Safety Agreement
              </button>{" "}
              and acknowledge host responsibility for guest safety and emergency readiness.
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-3 rounded-[2rem] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="size-5 text-emerald-600" />
            Every content edit returns the activity to admin review.
          </p>
          <button
            disabled={saving || !safetyAgreementAgreed}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 font-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="size-5 animate-spin" />}
            {saving ? "Submitting…" : "Submit for review"}
          </button>
        </div>
      </form>

      <PolicyModal
        isOpen={Boolean(activePolicyModal)}
        policyType={activePolicyModal || "HOST_SAFETY_AGREEMENT"}
        onClose={() => setActivePolicyModal(null)}
      />
    </div>
  );
}
