import type { LucideIcon } from "lucide-react"
export type CityFact = { title: string; value: string; detail: string; icon: LucideIcon; color: string }
export type WishlistPopup = { slug: string; action: "added" | "removed" } | null
