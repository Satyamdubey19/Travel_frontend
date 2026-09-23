"use client";

import { useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import api from "@/lib/axios";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationMenu({ enabled }: { enabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const loaded = useRef(false);
  const load = async () => {
    if (!enabled) return;
    try {
      const { data } = await api.get<{ data: NotificationItem[] }>(
        "/notifications",
      );
      setItems(data.data ?? []);
      loaded.current = true;
    } catch {
      setItems([]);
    }
  };
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && enabled && !loaded.current) void load();
  };
  const unread = items.filter((item) => !item.isRead).length;
  const markOne = async (id: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item,
      ),
    );
    await api.patch(`/notifications/${id}`).catch(() => {
      loaded.current = false;
    });
  };
  const markAll = async () => {
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
    await api.patch("/notifications").catch(() => {
      loaded.current = false;
    });
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative flex size-8 items-center justify-center rounded-full text-slate-800 transition hover:bg-slate-100"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell size={17} strokeWidth={2} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-rose-500 text-[9px] font-black text-white">
            {Math.min(unread, 9)}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-[70] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-[0_26px_80px_rgba(15,23,42,.2)] backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <p className="font-black">Notifications</p>
              <p className="text-xs text-slate-400">
                Booking, safety and account updates
              </p>
            </div>
            {unread > 0 && (
              <button
                onClick={() => void markAll()}
                className="flex items-center gap-1 text-xs font-black text-cyan-700"
              >
                <CheckCheck className="size-4" />
                Read all
              </button>
            )}
          </div>
          <div className="max-h-[26rem] overflow-y-auto">
            {!enabled ? (
              <p className="p-6 text-center text-sm text-slate-500">
                Sign in to see notifications.
              </p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => void markOne(item.id)}
                  className={`block w-full border-b border-slate-100 p-4 text-left transition hover:bg-slate-50 ${item.isRead ? "bg-white" : "bg-cyan-50/70"}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-1 size-2 shrink-0 rounded-full ${item.isRead ? "bg-slate-200" : "bg-cyan-500"}`}
                    />
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        {item.message}
                      </p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
