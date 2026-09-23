import type { ReactNode } from "react"

export type SettingsTab = "profile" | "bookings" | "account" | "preferences" | "notifications" | "privacy" | "danger"
export type ProfileSidebarTab = { key: SettingsTab; label: string; icon: ReactNode; color: string }
export type UserProfile = {
  id: string; name: string; email: string; phone: string; location: string; bio: string; avatar: string; joinDate: string
  verified: boolean; bookings: number; reviews: number; posts: number; likes: number; rating: number; dateOfBirth: string
  gender: string; nationality: string; address: string; emergencyContactName: string; emergencyContactPhone: string
  website: string; instagram: string; twitter: string; travelStyle: string; preferredCurrency: string
  preferredLanguage: string; dietaryPreferences: string; passportNumber: string; frequentFlyerNumber: string
}
export type NotificationSettings = {
  emailBooking: boolean; emailPromotions: boolean; emailNewsletter: boolean; emailReviews: boolean
  pushBooking: boolean; pushMessages: boolean; pushDeals: boolean; smsBooking: boolean; smsAlerts: boolean
}
export type PrivacySettings = {
  profileVisibility: "public" | "private" | "friends"
  showEmail: boolean; showPhone: boolean; showLocation: boolean; showActivity: boolean; twoFactorEnabled: boolean; loginAlerts: boolean
}
