"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  FileCheck2,
  Gauge,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";

type Stage = "PICKUP" | "RETURN";
type Status = "DRAFT" | "SUBMITTED" | "ACKNOWLEDGED" | "DISPUTED";
type ChecklistItem = { label: string; completed: boolean };
type Damage = {
  area: string;
  severity: "MINOR" | "MODERATE" | "MAJOR";
  description: string;
};
type Inspection = {
  id: string;
  stage: Stage;
  status: Status;
  odometerKm: number | null;
  fuelOrChargePercent: number | null;
  conditionNotes: string | null;
  checklist: ChecklistItem[] | null;
  damages: Damage[] | null;
  evidenceAssetIds: string[];
  evidenceUrls?: string[];
  submittedAt: string | null;
  acknowledgedAt: string | null;
  disputedAt: string | null;
  disputeReason: string | null;
};

const checklistByStage: Record<Stage, string[]> = {
  PICKUP: [
    "Driving licence and government ID checked",
    "Exterior and interior condition reviewed",
    "Tyres, lights and safety equipment checked",
    "Odometer and fuel/charge confirmed",
    "Keys and listed accessories handed over",
  ],
  RETURN: [
    "Keys and listed accessories returned",
    "Exterior and interior condition reviewed",
    "New damage or no new damage recorded",
    "Odometer and fuel/charge confirmed",
    "Final condition explained to the traveler",
  ],
};

function empty(stage: Stage): Inspection {
  return {
    id: "",
    stage,
    status: "DRAFT",
    odometerKm: null,
    fuelOrChargePercent: null,
    conditionNotes: "",
    checklist: checklistByStage[stage].map((label) => ({
      label,
      completed: false,
    })),
    damages: [],
    evidenceAssetIds: [],
    submittedAt: null,
    acknowledgedAt: null,
    disputedAt: null,
    disputeReason: null,
  };
}

export default function RentalInspectionPanel({
  bookingId,
  mode,
}: {
  bookingId: string;
  mode: "host" | "traveler";
}) {
  const [records, setRecords] = useState<Record<Stage, Inspection>>({
    PICKUP: empty("PICKUP"),
    RETURN: empty("RETURN"),
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      if (mode === "host") {
        const [pickup, returned] = await Promise.all([
          api.get<{ data: Inspection | null }>(
            `/host/rental-bookings/${bookingId}/inspections/PICKUP`,
          ),
          api.get<{ data: Inspection | null }>(
            `/host/rental-bookings/${bookingId}/inspections/RETURN`,
          ),
        ]);
        setRecords({
          PICKUP: pickup.data.data ?? empty("PICKUP"),
          RETURN: returned.data.data ?? empty("RETURN"),
        });
      } else {
        const { data } = await api.get<{ data: Inspection[] }>(
          `/rental-bookings/${bookingId}/inspections`,
        );
        setRecords((current) => ({
          ...current,
          ...Object.fromEntries(data.data.map((item) => [item.stage, item])),
        }));
      }
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, "Condition reports could not be loaded"),
      );
    } finally {
      setLoading(false);
    }
  }, [bookingId, mode]);

  useEffect(() => {
    void load();
  }, [load]);
  const update = (stage: Stage, values: Partial<Inspection>) =>
    setRecords((current) => ({
      ...current,
      [stage]: { ...current[stage], ...values },
    }));

  const upload = async (stage: Stage, files: FileList | null) => {
    if (!files?.length) return;
    setBusy(`${stage}-upload`);
    setMessage("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(
        0,
        12 - records[stage].evidenceAssetIds.length,
      )) {
        const body = new FormData();
        body.append("file", file);
        body.append("purpose", "rental_inspection");
        body.append("bookingId", bookingId);
        const { data } = await api.post<{ assetId: string }>("/upload", body);
        uploaded.push(data.assetId);
      }
      update(stage, {
        evidenceAssetIds: [...records[stage].evidenceAssetIds, ...uploaded],
      });
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Private evidence upload failed"));
    } finally {
      setBusy("");
    }
  };

  const save = async (stage: Stage) => {
    setBusy(`${stage}-save`);
    setMessage("");
    try {
      const item = records[stage];
      const { data } = await api.put<{ data: Inspection }>(
        `/host/rental-bookings/${bookingId}/inspections/${stage}`,
        {
          odometerKm: item.odometerKm,
          fuelOrChargePercent: item.fuelOrChargePercent,
          conditionNotes: item.conditionNotes,
          checklist: item.checklist ?? [],
          damages: item.damages ?? [],
          evidenceAssetIds: item.evidenceAssetIds,
        },
      );
      update(stage, data.data);
      setMessage(
        `${stage === "PICKUP" ? "Pickup" : "Return"} draft saved privately.`,
      );
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, "Inspection draft could not be saved"),
      );
    } finally {
      setBusy("");
    }
  };

  const submit = async (stage: Stage) => {
    if (
      !window.confirm(
        "Submit this condition snapshot? It becomes immutable and the traveler will be asked to review it.",
      )
    )
      return;
    setBusy(`${stage}-submit`);
    setMessage("");
    try {
      const item = records[stage];
      await api.put(`/host/rental-bookings/${bookingId}/inspections/${stage}`, {
        odometerKm: item.odometerKm,
        fuelOrChargePercent: item.fuelOrChargePercent,
        conditionNotes: item.conditionNotes,
        checklist: item.checklist ?? [],
        damages: item.damages ?? [],
        evidenceAssetIds: item.evidenceAssetIds,
      });
      const { data } = await api.post<{ data: Inspection }>(
        `/host/rental-bookings/${bookingId}/inspections/${stage}`,
      );
      update(stage, data.data);
      setMessage("Immutable condition report submitted to the traveler.");
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, "Inspection could not be submitted"),
      );
    } finally {
      setBusy("");
    }
  };

  const respond = async (stage: Stage, action: "ACKNOWLEDGE" | "DISPUTE") => {
    let reason: string | undefined;
    if (action === "DISPUTE") {
      reason = window
        .prompt(
          "Describe the mismatch clearly (at least 10 characters). This opens a permanent dispute record.",
        )
        ?.trim();
      if (!reason || reason.length < 10)
        return setMessage(
          "A dispute reason of at least 10 characters is required.",
        );
    }
    if (
      action === "ACKNOWLEDGE" &&
      !window.confirm(
        "Confirm that this condition report matches the vehicle you received or returned?",
      )
    )
      return;
    setBusy(`${stage}-respond`);
    setMessage("");
    try {
      const { data } = await api.post<{ data: Inspection }>(
        `/rental-bookings/${bookingId}/inspections/${stage}/respond`,
        { action, ...(reason ? { reason } : {}) },
      );
      update(stage, data.data);
      setMessage(
        action === "ACKNOWLEDGE"
          ? "Condition report acknowledged."
          : "Dispute recorded. Do not exchange money outside the platform.",
      );
    } catch (error) {
      setMessage(
        getApiErrorMessage(error, "Your response could not be recorded"),
      );
    } finally {
      setBusy("");
    }
  };

  if (loading)
    return (
      <section className="grid min-h-40 place-items-center rounded-[2rem] bg-white/85">
        <Loader2 className="size-6 animate-spin text-cyan-600" />
      </section>
    );
  if (
    mode === "traveler" &&
    !Object.values(records).some((item) => item.id && item.status !== "DRAFT")
  )
    return (
      <section className="rounded-[2rem] border border-cyan-100 bg-cyan-50 p-6">
        <h2 className="flex items-center gap-2 font-black text-cyan-950">
          <ShieldCheck className="size-5" />
          Vehicle custody protection
        </h2>
        <p className="mt-2 text-sm leading-6 text-cyan-900">
          Your host has not submitted a pickup or return condition report yet.
          Review every submitted snapshot before accepting the vehicle or
          closing the return.
        </p>
      </section>
    );

  return (
    <section className="rounded-[2rem] border border-white bg-white/85 p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
            Dispute-safe custody
          </p>
          <h2 className="mt-2 text-2xl font-black">
            Pickup and return evidence
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Private photos, readings and acknowledgements create an immutable
            handover trail. Never record full identity numbers in notes or
            photos.
          </p>
        </div>
        <FileCheck2 className="size-8 text-cyan-600" />
      </div>
      {message && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-sm font-bold text-cyan-950"
        >
          {message}
        </p>
      )}
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {(["PICKUP", "RETURN"] as Stage[]).map((stage) => {
          const item = records[stage];
          const editable = mode === "host" && item.status === "DRAFT";
          if (mode === "traveler" && (!item.id || item.status === "DRAFT"))
            return null;
          return (
            <article
              key={stage}
              className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black">
                  {stage === "PICKUP" ? "Pickup handover" : "Vehicle return"}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${item.status === "ACKNOWLEDGED" ? "bg-emerald-100 text-emerald-800" : item.status === "DISPUTED" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="text-xs font-black text-slate-600">
                  Odometer (km)
                  <input
                    disabled={!editable}
                    type="number"
                    min="0"
                    value={item.odometerKm ?? ""}
                    onChange={(event) =>
                      update(stage, {
                        odometerKm: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 disabled:bg-slate-100"
                  />
                </label>
                <label className="text-xs font-black text-slate-600">
                  Fuel/charge %
                  <input
                    disabled={!editable}
                    type="number"
                    min="0"
                    max="100"
                    value={item.fuelOrChargePercent ?? ""}
                    onChange={(event) =>
                      update(stage, {
                        fuelOrChargePercent: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 disabled:bg-slate-100"
                  />
                </label>
              </div>
              <label className="mt-4 block text-xs font-black text-slate-600">
                Condition notes
                <textarea
                  disabled={!editable}
                  value={item.conditionNotes ?? ""}
                  onChange={(event) =>
                    update(stage, { conditionNotes: event.target.value })
                  }
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm disabled:bg-slate-100"
                  placeholder="Record existing marks, cleanliness, accessories and overall condition."
                />
              </label>
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black text-slate-600">
                    Damage observations
                  </p>
                  {editable && (
                    <button
                      type="button"
                      onClick={() =>
                        update(stage, {
                          damages: [
                            ...(item.damages ?? []),
                            { area: "", severity: "MINOR", description: "" },
                          ],
                        })
                      }
                      className="text-xs font-black text-cyan-700"
                    >
                      + Add damage
                    </button>
                  )}
                </div>
                {(item.damages ?? []).length === 0 ? (
                  <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                    No damage observations recorded.
                  </p>
                ) : (
                  <div className="mt-2 space-y-3">
                    {(item.damages ?? []).map((damage, index) => (
                      <div
                        key={index}
                        className="grid gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 sm:grid-cols-[1fr_8rem]"
                      >
                        <input
                          disabled={!editable}
                          value={damage.area}
                          onChange={(event) =>
                            update(stage, {
                              damages: item.damages!.map((value, itemIndex) =>
                                itemIndex === index
                                  ? { ...value, area: event.target.value }
                                  : value,
                              ),
                            })
                          }
                          placeholder="Area, e.g. rear bumper"
                          className="h-10 rounded-lg border border-amber-200 bg-white px-3 text-sm disabled:bg-amber-50"
                        />
                        <select
                          disabled={!editable}
                          value={damage.severity}
                          onChange={(event) =>
                            update(stage, {
                              damages: item.damages!.map((value, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...value,
                                      severity: event.target
                                        .value as Damage["severity"],
                                    }
                                  : value,
                              ),
                            })
                          }
                          className="h-10 rounded-lg border border-amber-200 bg-white px-2 text-sm disabled:bg-amber-50"
                        >
                          <option>MINOR</option>
                          <option>MODERATE</option>
                          <option>MAJOR</option>
                        </select>
                        <textarea
                          disabled={!editable}
                          value={damage.description}
                          onChange={(event) =>
                            update(stage, {
                              damages: item.damages!.map((value, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...value,
                                      description: event.target.value,
                                    }
                                  : value,
                              ),
                            })
                          }
                          placeholder="Describe size, location and whether it was pre-existing"
                          rows={2}
                          className="rounded-lg border border-amber-200 bg-white p-3 text-sm disabled:bg-amber-50 sm:col-span-2"
                        />
                        {editable && (
                          <button
                            type="button"
                            onClick={() =>
                              update(stage, {
                                damages: item.damages!.filter(
                                  (_, itemIndex) => itemIndex !== index,
                                ),
                              })
                            }
                            className="text-left text-xs font-black text-rose-700 sm:col-span-2"
                          >
                            Remove observation
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {(item.checklist ?? []).map((check, index) => (
                  <label
                    key={check.label}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <input
                      disabled={!editable}
                      type="checkbox"
                      checked={check.completed}
                      onChange={(event) =>
                        update(stage, {
                          checklist: item.checklist!.map((value, itemIndex) =>
                            itemIndex === index
                              ? { ...value, completed: event.target.checked }
                              : value,
                          ),
                        })
                      }
                      className="mt-1 size-4 accent-cyan-600"
                    />
                    <span>{check.label}</span>
                  </label>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                <p className="flex items-center gap-2 text-sm font-black">
                  <Camera className="size-4 text-cyan-600" />
                  Private condition photos ·{" "}
                  {Math.max(
                    item.evidenceAssetIds.length,
                    item.evidenceUrls?.length ?? 0,
                  )}
                  /12
                </p>
                {item.evidenceUrls?.length ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {item.evidenceUrls.map((url, index) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                      >
                        <img
                          src={url}
                          alt={`${stage.toLowerCase()} condition evidence ${index + 1}`}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                ) : null}
                {editable && (
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    disabled={
                      busy === `${stage}-upload` ||
                      item.evidenceAssetIds.length >= 12
                    }
                    onChange={(event) => void upload(stage, event.target.files)}
                    className="mt-3 block w-full text-xs"
                  />
                )}
                <p className="mt-2 text-xs text-slate-500">
                  At least two photos are required. Viewing links are signed and
                  expire after ten minutes.
                </p>
              </div>
              {item.disputeReason && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                  <p className="flex items-center gap-2 font-black">
                    <AlertTriangle className="size-4" />
                    Traveler dispute
                  </p>
                  <p className="mt-1">{item.disputeReason}</p>
                </div>
              )}
              {editable && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void save(stage)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black disabled:opacity-50"
                  >
                    Save draft
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void submit(stage)}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
                  >
                    {busy.startsWith(stage) ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-4" />
                    )}
                    Submit snapshot
                  </button>
                </div>
              )}
              {mode === "traveler" && item.status === "SUBMITTED" && (
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void respond(stage, "ACKNOWLEDGE")}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white"
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() => void respond(stage, "DISPUTE")}
                    className="rounded-xl border border-rose-300 bg-white px-4 py-2 text-sm font-black text-rose-700"
                  >
                    Report mismatch
                  </button>
                </div>
              )}
              <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <Gauge className="size-4" />
                {item.submittedAt
                  ? `Submitted ${new Date(item.submittedAt).toLocaleString("en-IN")}`
                  : "Draft—not visible to traveler"}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
