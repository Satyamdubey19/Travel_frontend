'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header/Header'
import Footer from '@/components/layout/Footer/Footer'
import ToggleSwitch from '@/components/ui/ToggleSwitch'
import SectionCard from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  MessageSquare,
  Camera,
  Edit2,
  Save,
  X,
  Clock,
  Briefcase,
  Settings,
  LogOut,
  Copy,
  CheckCircle,
  Shield,
  Bell,
  Globe,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  CreditCard,
  Download,
  Trash2,
  Link2,
  ChevronRight,
  Plane,
  Languages,
  Moon,
  Sun,
  Wallet,
  AlertTriangle,
  Star,
  Menu,
  BadgeCheck,
  MapPinned,
  Sparkles,
} from 'lucide-react'
import api, { getApiErrorMessage } from '@/lib/axios'
import type {
  NotificationSettings,
  PrivacySettings,
  ProfileSidebarTab,
  SettingsTab,
  UserProfile,
} from '@/types/page-types'

const sidebarTabs: ProfileSidebarTab[] = [
  { key: 'profile', label: 'Profile', icon: <User size={20} />, color: 'text-blue-600' },
  { key: 'bookings', label: 'My Bookings', icon: <Briefcase size={20} />, color: 'text-blue-600' },
  { key: 'account', label: 'Account', icon: <Settings size={20} />, color: 'text-indigo-600' },
  { key: 'preferences', label: 'Preferences', icon: <Globe size={20} />, color: 'text-purple-600' },
  { key: 'notifications', label: 'Notifications', icon: <Bell size={20} />, color: 'text-green-600' },
  { key: 'privacy', label: 'Privacy & Security', icon: <Shield size={20} />, color: 'text-amber-600' },
  { key: 'danger', label: 'Danger Zone', icon: <AlertTriangle size={20} />, color: 'text-red-600' },
]

const defaultProfile: UserProfile = {
  id: 'guest',
  name: 'Traveler',
  email: 'traveler@getTours.com',
  phone: '',
  location: 'Dehradun, India',
  bio: 'Travel enthusiast building memorable stays with GetTours.',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Traveler',
  joinDate: new Date().toISOString().slice(0, 10),
  verified: true,
  bookings: 24,
  reviews: 18,
  posts: 12,
  likes: 456,
  rating: 4.8,
  dateOfBirth: '1992-03-15',
  gender: 'Male',
  nationality: 'Indian',
  address: 'Dehradun, Uttarakhand, India',
  emergencyContactName: '',
  emergencyContactPhone: '',
  website: '',
  instagram: '',
  twitter: '',
  travelStyle: 'Adventure',
  preferredCurrency: 'INR',
  preferredLanguage: 'English',
  dietaryPreferences: 'No restrictions',
  passportNumber: 'Not added',
  frequentFlyerNumber: 'Not added',
}

const getProfileStorageKey = (userId?: string) => `userProfile:${userId ?? 'guest'}`

const createProfileFromSession = (
  sessionUser: { id: string; name: string; email: string; phone?: string } | null,
  savedProfile?: Partial<UserProfile>,
): UserProfile => {
  const name = sessionUser?.name || savedProfile?.name || defaultProfile.name

  return {
    ...defaultProfile,
    ...savedProfile,
    id: sessionUser?.id ?? savedProfile?.id ?? defaultProfile.id,
    name,
    email: sessionUser?.email ?? savedProfile?.email ?? defaultProfile.email,
    phone: sessionUser?.phone ?? savedProfile?.phone ?? defaultProfile.phone,
    avatar: savedProfile?.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    verified: Boolean(sessionUser) || (savedProfile?.verified ?? defaultProfile.verified),
  }
}

const getInitials = (name: string) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'GH'
}

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, isAuthenticated, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile)

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailBooking: true,
    emailPromotions: false,
    emailNewsletter: true,
    emailReviews: true,
    pushBooking: true,
    pushMessages: true,
    pushDeals: false,
    smsBooking: true,
    smsAlerts: false,
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showActivity: true,
    twoFactorEnabled: false,
    loginAlerts: true,
  })

  const [isEditMode, setIsEditMode] = useState(false)
  const [editedProfile, setEditedProfile] = useState(userProfile)
  const [isSaving, setIsSaving] = useState(false)
  const [showCopied, setShowCopied] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [savedToast, setSavedToast] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (authLoading) return

    setIsMounted(true)

    const profileKey = getProfileStorageKey(authUser?.id)
    const legacyProfile = localStorage.getItem('userProfile')
    const savedProfile = localStorage.getItem(profileKey) ?? legacyProfile
    const parsedProfile = savedProfile ? JSON.parse(savedProfile) as Partial<UserProfile> : undefined
    const nextProfile = createProfileFromSession(authUser, parsedProfile)
    setUserProfile(nextProfile)
    setEditedProfile(nextProfile)
    localStorage.setItem(profileKey, JSON.stringify(nextProfile))

    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications))
    const savedPrivacy = localStorage.getItem('privacySettings')
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy))
  }, [authLoading, authUser])


  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await api.patch('/auth/me', editedProfile)

      setUserProfile(editedProfile)
      localStorage.setItem(getProfileStorageKey(authUser?.id), JSON.stringify(editedProfile))
      updateUser({
        name: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone || undefined,
      })
      setIsEditMode(false)
      showSavedToast()
    } catch (error) {
      alert(getApiErrorMessage(error, 'Failed to save profile'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications))
    showSavedToast()
  }

  const handleSavePrivacy = () => {
    localStorage.setItem('privacySettings', JSON.stringify(privacy))
    showSavedToast()
  }

  const showSavedToast = () => {
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(userProfile.id)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  const profile = isMounted ? userProfile : null

  if (authLoading || !profile) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-slate-50 px-4 py-20">
          <Card className="mx-auto max-w-md rounded-2xl border-0 bg-white shadow-sm ring-1 ring-slate-200">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <User size={22} />
              </div>
              <h1 className="text-xl font-bold text-slate-950">Loading your profile</h1>
              <p className="mt-2 text-sm text-slate-500">Checking your session and account details.</p>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] px-4 py-20">
          <Card className="mx-auto max-w-lg rounded-2xl border-0 bg-white shadow-xl shadow-slate-200/70 ring-1 ring-slate-200">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Lock size={24} />
              </div>
              <h1 className="text-2xl font-bold text-slate-950">Sign in to view your profile</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your profile, bookings, wishlist, and preferences are connected to your secure session.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild className="h-10 rounded-xl bg-slate-950 text-white hover:bg-slate-800">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild variant="outline" className="h-10 rounded-xl bg-white">
                  <Link href="/signup">Create account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  const profileCompletionItems = [
    { label: 'Identity', done: profile.verified },
    { label: 'Phone', done: Boolean(profile.phone) },
    { label: 'Address', done: Boolean(profile.address) },
    { label: 'Emergency', done: Boolean(profile.emergencyContactName && profile.emergencyContactPhone) },
    { label: 'Preferences', done: Boolean(profile.travelStyle && profile.preferredCurrency) },
  ]
  const completedProfileItems = profileCompletionItems.filter((item) => item.done).length
  const completionPercent = Math.round((completedProfileItems / profileCompletionItems.length) * 100)
  const upcomingTrips = [
    { title: 'Mountain View Suite', date: 'May 12-14', city: profile.location || 'Dehradun', status: 'Ready' },
    { title: 'Rishikesh River Tour', date: 'Jun 03', city: 'Rishikesh', status: 'Wishlist' },
  ]
  const profileInitials = getInitials(profile.name)
  const showInitialsAvatar = !profile.avatar || profile.avatar.includes('dicebear')

  const renderProfileTab = () => (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white py-0 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative">
                {showInitialsAvatar ? (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-slate-950 text-3xl font-black tracking-tight text-white shadow-[0_18px_35px_rgba(15,23,42,0.16)]">
                    {profileInitials}
                  </div>
                ) : (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-24 w-24 rounded-2xl border border-slate-200 bg-white object-cover shadow-sm"
                  />
                )}
                <button className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50">
                  <Camera size={15} />
                </button>
                {profile.verified && (
                  <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-xl bg-emerald-500 text-white ring-4 ring-white">
                    <CheckCircle size={16} />
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    <Sparkles size={14} />
                    Traveler profile
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <BadgeCheck size={14} />
                    Verified
                  </span>
                </div>
                <h2 className="truncate text-3xl font-black tracking-tight text-slate-950 sm:text-[2.6rem]">{profile.name}</h2>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Mail size={15} />{profile.email}</span>
                  <span className="flex items-center gap-1.5"><MapPinned size={15} />{profile.location}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={15} />Joined {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setIsEditMode(!isEditMode)
                  setEditedProfile(profile)
                }}
                className="h-10 rounded-xl bg-slate-950 px-4 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                {isEditMode ? <><X size={16} /> Cancel</> : <><Edit2 size={16} /> Edit profile</>}
              </Button>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-4">
              {[
                { label: 'Bookings', value: profile.bookings, icon: Briefcase, color: 'bg-blue-50 text-blue-700' },
                { label: 'Reviews', value: profile.reviews, icon: MessageSquare, color: 'bg-emerald-50 text-emerald-700' },
                { label: 'Posts', value: profile.posts, icon: Camera, color: 'bg-violet-50 text-violet-700' },
                { label: 'Rating', value: profile.rating, icon: Star, color: 'bg-amber-50 text-amber-700' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className={`flex size-10 items-center justify-center rounded-xl ${item.color}`}>
                      <item.icon size={18} />
                    </div>
                    <span className="text-2xl font-black text-slate-950">{item.value}</span>
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Profile strength</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-950">{completionPercent}% complete</h3>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-blue-700">
                  <Shield size={22} />
                </div>
              </div>
              <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700" style={{ width: `${completionPercent}%` }} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {profileCompletionItems.map((item) => (
                  <div key={item.label} className={`rounded-full px-3 py-1.5 text-xs font-bold ${item.done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {item.done ? 'Done' : 'Add'} Â· {item.label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
            <CardContent className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Upcoming activity</p>
              <div className="mt-4 space-y-3">
                {upcomingTrips.map((trip) => (
                  <div key={trip.title} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 transition hover:bg-white">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <Plane size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-950">{trip.title}</p>
                      <p className="text-xs text-slate-500">{trip.city} Â· {trip.date}</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600">{trip.status}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { title: 'Travel wallet', value: '2 saved cards', note: `Preferred currency: ${profile.preferredCurrency}`, icon: Wallet, color: 'bg-emerald-50 text-emerald-700' },
          { title: 'Trip preferences', value: profile.travelStyle, note: `${profile.preferredLanguage} support enabled`, icon: Languages, color: 'bg-violet-50 text-violet-700' },
          { title: 'Booking readiness', value: profile.phone ? 'Ready' : 'Needs phone', note: profile.phone ? 'Contact details are available.' : 'Add phone to speed up checkout.', icon: CreditCard, color: 'bg-sky-50 text-sky-700' },
        ].map((item) => (
          <Card key={item.title} className="rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${item.color}`}>
                  <item.icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{item.title}</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{item.value}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-500">{item.note}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personal Information */}
      <SectionCard title="Personal Information" description="Your basic personal details">
        {!isEditMode ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: profile.name, icon: <User size={16} className="text-blue-600" /> },
              { label: 'Email', value: profile.email, icon: <Mail size={16} className="text-blue-600" /> },
              { label: 'Phone', value: profile.phone, icon: <Phone size={16} className="text-green-600" /> },
              { label: 'Date of Birth', value: new Date(profile.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), icon: <Calendar size={16} className="text-purple-600" /> },
              { label: 'Gender', value: profile.gender, icon: <User size={16} className="text-indigo-600" /> },
              { label: 'Nationality', value: profile.nationality, icon: <Globe size={16} className="text-amber-600" /> },
              { label: 'Location', value: profile.location, icon: <MapPin size={16} className="text-red-600" /> },
              { label: 'Address', value: profile.address, icon: <MapPin size={16} className="text-slate-600" /> },
            ].map((field) => (
              <div key={field.label} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  {field.icon}
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{field.label}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{field.value}</p>
              </div>
            ))}
            <div className="sm:col-span-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bio</span>
              <p className="text-sm text-slate-800 mt-1 leading-relaxed">{profile.bio}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name' as const, type: 'text' },
                { label: 'Email', key: 'email' as const, type: 'email' },
                { label: 'Phone', key: 'phone' as const, type: 'tel' },
                { label: 'Date of Birth', key: 'dateOfBirth' as const, type: 'date' },
                { label: 'Location', key: 'location' as const, type: 'text' },
                { label: 'Nationality', key: 'nationality' as const, type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    value={editedProfile[field.key]}
                    onChange={e => setEditedProfile({ ...editedProfile, [field.key]: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender</label>
                <select
                  value={editedProfile.gender}
                  onChange={e => setEditedProfile({ ...editedProfile, gender: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition bg-white"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Address</label>
                <input
                  type="text"
                  value={editedProfile.address}
                  onChange={e => setEditedProfile({ ...editedProfile, address: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bio</label>
              <textarea
                value={editedProfile.bio}
                onChange={e => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                maxLength={200}
                rows={3}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition resize-none"
              />
              <p className="text-xs text-slate-400 mt-1">{editedProfile.bio.length}/200</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-60"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setIsEditMode(false); setEditedProfile(profile) }}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* Emergency Contact */}
      <SectionCard title="Emergency Contact" description="Contact person in case of emergencies during travel">
        {!isEditMode ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact Name</span>
              <p className="text-sm font-semibold text-slate-900 mt-1">{profile.emergencyContactName}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Contact Phone</span>
              <p className="text-sm font-semibold text-slate-900 mt-1">{profile.emergencyContactPhone}</p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Name</label>
              <input
                type="text"
                value={editedProfile.emergencyContactName}
                onChange={e => setEditedProfile({ ...editedProfile, emergencyContactName: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Phone</label>
              <input
                type="tel"
                value={editedProfile.emergencyContactPhone}
                onChange={e => setEditedProfile({ ...editedProfile, emergencyContactPhone: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>
        )}
      </SectionCard>

      {/* Social Links */}
      <SectionCard title="Social & Web" description="Your online presence">
        {!isEditMode ? (
          <div className="space-y-3">
            {[
              { label: 'Website', value: profile.website, icon: <Globe size={16} className="text-blue-600" /> },
              { label: 'Instagram', value: profile.instagram, icon: <Camera size={16} className="text-pink-600" /> },
              { label: 'Twitter', value: profile.twitter, icon: <MessageSquare size={16} className="text-sky-500" /> },
            ].map(link => (
              <div key={link.label} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                {link.icon}
                <div>
                  <span className="text-xs text-slate-500">{link.label}</span>
                  <p className="text-sm font-medium text-slate-900">{link.value}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Website', key: 'website' as const },
              { label: 'Instagram', key: 'instagram' as const },
              { label: 'Twitter', key: 'twitter' as const },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.label}</label>
                <input
                  type="text"
                  value={editedProfile[field.key]}
                  onChange={e => setEditedProfile({ ...editedProfile, [field.key]: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Activity */}
      <SectionCard title="Your Activity" description="Quick overview of your engagement">
        <div className="space-y-3">
          {[
            { label: 'Active Bookings', sub: 'Current reservations', count: profile.bookings, icon: <Briefcase size={18} />, color: 'blue', href: '#' },
            { label: 'Reviews Written', sub: 'Share your experience', count: profile.reviews, icon: <MessageSquare size={18} />, color: 'green', href: '#' },
            { label: 'Contest Posts', sub: 'Your travel stories', count: profile.posts, icon: <Clock size={18} />, color: 'purple', href: '/posts' },
            { label: 'Likes Received', sub: 'Community engagement', count: profile.likes, icon: <Heart size={18} />, color: 'red', href: '#' },
          ].map(item => (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.label === 'Active Bookings' ? (e) => { e.preventDefault(); setActiveTab('bookings') } : undefined}
              className={`flex items-center justify-between p-4 bg-${item.color}-50 rounded-xl border border-${item.color}-100 hover:shadow-sm transition group`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${item.color}-100 rounded-lg text-${item.color}-600`}>{item.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-${item.color}-600 font-bold`}>{item.count}</span>
                <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition" />
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </div>
  )

  const renderAccountTab = () => (
    <div>
      {/* User ID */}
      <SectionCard title="User ID" description="Your unique account identifier">
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Account ID</p>
            <code className="font-mono text-sm font-bold text-slate-900">{profile.id}</code>
          </div>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition"
          >
            {showCopied ? <><CheckCircle size={14} className="text-green-600" /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
      </SectionCard>

      {/* Change Password */}
      <SectionCard title="Change Password" description="Update your account password">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition pr-10"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>
          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500">Passwords do not match</p>
          )}
          <button
            onClick={() => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); showSavedToast() }}
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Update Password
          </button>
        </div>
      </SectionCard>

      {/* Connected Accounts */}
      <SectionCard title="Connected Accounts" description="Linked social and third-party services">
        <div className="space-y-3">
          {[
            { name: 'Google', email: 'alex.johnson@gmail.com', connected: true, color: 'bg-red-50 border-red-100' },
            { name: 'Facebook', email: 'Not connected', connected: false, color: 'bg-blue-50 border-blue-100' },
            { name: 'Apple', email: 'Not connected', connected: false, color: 'bg-slate-50 border-slate-200' },
          ].map(account => (
            <div key={account.name} className={`flex items-center justify-between p-4 rounded-xl border ${account.color}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                  <Link2 size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{account.name}</p>
                  <p className="text-xs text-slate-500">{account.email}</p>
                </div>
              </div>
              <button className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${account.connected ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                {account.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Travel Documents */}
      <SectionCard title="Travel Documents" description="Passport and frequent flyer details">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={16} className="text-amber-600" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Passport</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{profile.passportNumber}</p>
          </div>
          <div className="p-4 bg-sky-50 rounded-xl border border-sky-100">
            <div className="flex items-center gap-2 mb-1">
              <Plane size={16} className="text-sky-600" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Frequent Flyer</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">{profile.frequentFlyerNumber}</p>
          </div>
        </div>
      </SectionCard>

      {/* Sessions */}
      <SectionCard title="Active Sessions" description="Devices currently logged into your account">
        <div className="space-y-3">
          {[
            { device: 'Chrome on Windows', location: 'New York, USA', current: true, lastActive: 'Now' },
            { device: 'Safari on iPhone', location: 'New York, USA', current: false, lastActive: '2 hours ago' },
            { device: 'Firefox on MacBook', location: 'Boston, USA', current: false, lastActive: '3 days ago' },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-slate-400" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {session.device}
                    {session.current && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">THIS DEVICE</span>}
                  </p>
                  <p className="text-xs text-slate-500">{session.location} â€¢ {session.lastActive}</p>
                </div>
              </div>
              {!session.current && (
                <button className="text-xs font-semibold text-red-600 hover:text-red-700 transition">Revoke</button>
              )}
            </div>
          ))}
        </div>
        <button className="mt-4 text-sm font-semibold text-red-600 hover:text-red-700 transition">
          Log out of all other sessions
        </button>
      </SectionCard>
    </div>
  )

  const renderPreferencesTab = () => (
    <div>
      {/* Travel Preferences */}
      <SectionCard title="Travel Preferences" description="Help us personalize your experience">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Travel Style</label>
            <select
              value={userProfile.travelStyle}
              onChange={e => { const u = { ...userProfile, travelStyle: e.target.value }; setUserProfile(u); localStorage.setItem('userProfile', JSON.stringify(u)) }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition bg-white"
            >
              {['Adventure', 'Luxury', 'Budget', 'Family', 'Solo', 'Romantic', 'Cultural', 'Eco-friendly'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dietary Preferences</label>
            <select
              value={userProfile.dietaryPreferences}
              onChange={e => { const u = { ...userProfile, dietaryPreferences: e.target.value }; setUserProfile(u); localStorage.setItem('userProfile', JSON.stringify(u)) }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition bg-white"
            >
              {['No restrictions', 'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-free', 'Nut allergy'].map(d => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Language & Region */}
      <SectionCard title="Language & Region" description="Set your preferred language and currency">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Language</label>
            <select
              value={userProfile.preferredLanguage}
              onChange={e => { const u = { ...userProfile, preferredLanguage: e.target.value }; setUserProfile(u); localStorage.setItem('userProfile', JSON.stringify(u)) }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition bg-white"
            >
              {['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Japanese', 'Korean', 'Chinese', 'Arabic', 'Hindi'].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Currency</label>
            <select
              value={userProfile.preferredCurrency}
              onChange={e => { const u = { ...userProfile, preferredCurrency: e.target.value }; setUserProfile(u); localStorage.setItem('userProfile', JSON.stringify(u)) }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition bg-white"
            >
              {['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD', 'SGD', 'AED'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Appearance */}
      <SectionCard title="Appearance" description="Customize how the app looks">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon size={20} className="text-indigo-600" /> : <Sun size={20} className="text-amber-500" />}
            <div>
              <p className="text-sm font-semibold text-slate-900">Dark Mode</p>
              <p className="text-xs text-slate-500">Switch between light and dark theme</p>
            </div>
          </div>
          <ToggleSwitch enabled={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </div>
      </SectionCard>

      {/* Payment Methods */}
      <SectionCard title="Payment Methods" description="Saved cards and wallets for quick checkout">
        <div className="space-y-3">
          {[
            { type: 'Visa', last4: '4242', expiry: '12/26', default: true },
            { type: 'Mastercard', last4: '8888', expiry: '03/25', default: false },
          ].map((card, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                  <CreditCard size={18} className="text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {card.type} â€¢â€¢â€¢â€¢ {card.last4}
                    {card.default && <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">DEFAULT</span>}
                  </p>
                  <p className="text-xs text-slate-500">Expires {card.expiry}</p>
                </div>
              </div>
              <button className="text-xs font-semibold text-red-600 hover:text-red-700 transition">Remove</button>
            </div>
          ))}
          <button className="w-full p-3 border-2 border-dashed border-slate-300 rounded-xl text-sm font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2">
            <Wallet size={16} />
            Add Payment Method
          </button>
        </div>
      </SectionCard>
    </div>
  )

  const renderNotificationsTab = () => (
    <div>
      {/* Email Notifications */}
      <SectionCard title="Email Notifications" description="Choose what emails you receive">
        <div className="space-y-4">
          {[
            { key: 'emailBooking' as const, label: 'Booking Confirmations', desc: 'Receive confirmation emails for bookings' },
            { key: 'emailPromotions' as const, label: 'Promotions & Offers', desc: 'Special deals and limited-time offers' },
            { key: 'emailNewsletter' as const, label: 'Newsletter', desc: 'Travel tips, guides, and inspiration' },
            { key: 'emailReviews' as const, label: 'Review Reminders', desc: 'Reminders to review your stays' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <ToggleSwitch enabled={notifications[item.key]} onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Push Notifications */}
      <SectionCard title="Push Notifications" description="Notifications on your device">
        <div className="space-y-4">
          {[
            { key: 'pushBooking' as const, label: 'Booking Updates', desc: 'Real-time booking status changes' },
            { key: 'pushMessages' as const, label: 'Messages', desc: 'New messages from hosts and travelers' },
            { key: 'pushDeals' as const, label: 'Flash Deals', desc: 'Time-sensitive offers and discounts' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <ToggleSwitch enabled={notifications[item.key]} onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* SMS Notifications */}
      <SectionCard title="SMS Notifications" description="Text message alerts">
        <div className="space-y-4">
          {[
            { key: 'smsBooking' as const, label: 'Booking Alerts', desc: 'SMS confirmations for bookings' },
            { key: 'smsAlerts' as const, label: 'Security Alerts', desc: 'Login and unusual activity alerts' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <ToggleSwitch enabled={notifications[item.key]} onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} />
            </div>
          ))}
        </div>
      </SectionCard>

      <button
        onClick={handleSaveNotifications}
        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        Save Notification Preferences
      </button>
    </div>
  )

  const renderPrivacyTab = () => (
    <div>
      {/* Profile Visibility */}
      <SectionCard title="Profile Visibility" description="Control who can see your profile">
        <div className="space-y-3">
          {(['public', 'friends', 'private'] as const).map(vis => (
            <label
              key={vis}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${privacy.profileVisibility === vis ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-100 hover:border-slate-300'}`}
            >
              <input
                type="radio"
                name="visibility"
                checked={privacy.profileVisibility === vis}
                onChange={() => setPrivacy({ ...privacy, profileVisibility: vis })}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 capitalize">{vis}</p>
                <p className="text-xs text-slate-500">
                  {vis === 'public' && 'Anyone can see your profile and activity'}
                  {vis === 'friends' && 'Only people you connect with can see your profile'}
                  {vis === 'private' && 'Your profile is hidden from everyone'}
                </p>
              </div>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* Information Visibility */}
      <SectionCard title="Information Visibility" description="Choose what information others can see">
        <div className="space-y-4">
          {[
            { key: 'showEmail' as const, label: 'Show Email Address', desc: 'Display your email on your public profile' },
            { key: 'showPhone' as const, label: 'Show Phone Number', desc: 'Display your phone on your public profile' },
            { key: 'showLocation' as const, label: 'Show Location', desc: 'Display your city on your public profile' },
            { key: 'showActivity' as const, label: 'Show Activity', desc: 'Display your bookings, reviews, and posts count' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <ToggleSwitch enabled={privacy[item.key]} onChange={() => setPrivacy({ ...privacy, [item.key]: !privacy[item.key] })} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Two-Factor Authentication */}
      <SectionCard title="Two-Factor Authentication" description="Add an extra layer of security to your account">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <Lock size={20} className={privacy.twoFactorEnabled ? 'text-green-600' : 'text-slate-400'} />
            <div>
              <p className="text-sm font-semibold text-slate-900">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500">{privacy.twoFactorEnabled ? 'Your account is protected with 2FA' : 'Enable 2FA for enhanced security'}</p>
            </div>
          </div>
          <ToggleSwitch enabled={privacy.twoFactorEnabled} onChange={() => setPrivacy({ ...privacy, twoFactorEnabled: !privacy.twoFactorEnabled })} />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-3">
            <Bell size={20} className={privacy.loginAlerts ? 'text-blue-600' : 'text-slate-400'} />
            <div>
              <p className="text-sm font-semibold text-slate-900">Login Alerts</p>
              <p className="text-xs text-slate-500">Get notified when someone logs into your account</p>
            </div>
          </div>
          <ToggleSwitch enabled={privacy.loginAlerts} onChange={() => setPrivacy({ ...privacy, loginAlerts: !privacy.loginAlerts })} />
        </div>
      </SectionCard>

      <button
        onClick={handleSavePrivacy}
        className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
      >
        Save Privacy Settings
      </button>
    </div>
  )

  const renderDangerTab = () => (
    <div>
      {/* Download Data */}
      <SectionCard title="Download Your Data" description="Export a copy of all your personal data">
        <p className="text-sm text-slate-600 mb-4">
          You can request a download of all the data we have on file for your account. This includes your profile information, booking history, reviews, and activity logs. The export will be prepared as a JSON file.
        </p>
        <button className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <Download size={16} />
          Request Data Export
        </button>
      </SectionCard>

      {/* Deactivate Account */}
      <SectionCard title="Deactivate Account" description="Temporarily disable your account">
        <p className="text-sm text-slate-600 mb-4">
          Deactivating your account will hide your profile and suspend all active bookings. You can reactivate at any time by logging in again.
        </p>
        <button className="px-5 py-2.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-200 transition flex items-center gap-2">
          <AlertTriangle size={16} />
          Deactivate Account
        </button>
      </SectionCard>

      {/* Delete Account */}
      <div className="bg-white rounded-2xl border-2 border-red-200 p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
            <Trash2 size={20} />
            Delete Account Permanently
          </h3>
          <p className="text-sm text-slate-500 mt-1">This action is irreversible. All your data will be permanently deleted.</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-4">
          <p className="text-sm text-red-700 font-medium mb-2">Deleting your account will:</p>
          <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
            <li>Remove all your personal information</li>
            <li>Cancel all active bookings</li>
            <li>Delete all reviews and posts</li>
            <li>Remove your payment methods</li>
            <li>Revoke all connected accounts</li>
          </ul>
        </div>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete My Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              Type <code className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">DELETE</code> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3 py-2.5 border-2 border-red-200 rounded-lg text-sm focus:outline-none focus:border-red-500 transition"
            />
            <div className="flex gap-3">
              <button
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm Deletion
              </button>
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText('') }}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogOut size={20} className="text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Log Out</p>
              <p className="text-xs text-slate-500">Sign out of your account on this device</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition">
            Log Out
          </button>
        </div>
      </div>
    </div>
  )

  const renderBookingsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-slate-950">My Bookings</h2>
      </div>
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-10 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Briefcase size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-950">Trip bookings moved</h3>
          <p className="mt-2 text-sm text-slate-500">
            Tour, activity, and rental bookings are managed from the dedicated bookings page.
          </p>
          <Button asChild className="mt-5 rounded-xl bg-slate-950 text-white hover:bg-blue-700">
            <Link href="/my-bookings">Open My Bookings</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab()
      case 'bookings': return renderBookingsTab()
      case 'account': return renderAccountTab()
      case 'preferences': return renderPreferencesTab()
      case 'notifications': return renderNotificationsTab()
      case 'privacy': return renderPrivacyTab()
      case 'danger': return renderDangerTab()
    }
  }

  return (
    <>
      <Header />

      {/* Saved Toast */}
      {savedToast && (
        <div className="fixed top-20 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-[slideIn_0.3s_ease]">
          <CheckCircle size={18} />
          Settings saved successfully!
        </div>
      )}

      <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4fb_45%,#ffffff_100%)]">
        <div className="container mx-auto max-w-7xl px-4 py-7 sm:px-6">
          <section className="mb-5 animate-fade-in-up rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.05)] backdrop-blur sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-700">
                  <BadgeCheck size={14} />
                  Verified traveler
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Profile</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Manage your personal details, preferences, privacy, and booking readiness in one simple workspace.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => { setActiveTab('profile'); setIsEditMode(true); setEditedProfile(profile) }}
                  className="h-10 rounded-xl bg-slate-950 px-4 text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  <Edit2 size={16} />
                  Edit profile
                </Button>
                <Button asChild variant="outline" className="h-10 rounded-xl border-slate-200 bg-white px-4 text-slate-800 transition hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">
                  <Link href="/tours">
                    <Plane size={16} />
                    Plan trip
                  </Link>
                </Button>
              </div>
            </div>
          </section>
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              {/* Mobile Tab Selector */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mb-3 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm lg:hidden"
              >
                <div className="flex items-center gap-3">
                  {sidebarTabs.find(t => t.key === activeTab)?.icon}
                  <span className="text-sm font-semibold text-slate-900">{sidebarTabs.find(t => t.key === activeTab)?.label}</span>
                </div>
                <Menu size={20} className="text-slate-400" />
              </button>

              <nav className={`overflow-hidden rounded-2xl border border-slate-200 bg-white/95 shadow-sm lg:sticky lg:top-24 lg:block ${mobileMenuOpen ? 'block' : 'hidden'}`}>
                {sidebarTabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveTab(tab.key); setMobileMenuOpen(false) }}
                    className={`flex w-full items-center gap-3 border-l-[3px] px-4 py-3.5 text-sm font-semibold transition ${
                      activeTab === tab.key
                        ? `${tab.color} border-current bg-slate-50`
                        : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className={activeTab === tab.key ? tab.color : 'text-slate-400'}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Verified Badge (sidebar) */}
              {profile.verified && (
                <div className="mt-4 hidden rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm lg:block">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} className="text-green-600" />
                    <h4 className="text-sm font-bold text-slate-900">Verified Member</h4>
                  </div>
                  <p className="text-xs text-slate-600">Your identity has been verified. Enjoy premium features.</p>
                </div>
              )}

              {/* User ID (sidebar) */}
                <div className="mt-4 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">User ID</p>
                <div className="flex items-center justify-between">
                  <code className="text-xs font-mono font-bold text-slate-700">{profile.id}</code>
                  <button onClick={handleCopyId} className="text-slate-400 hover:text-blue-600 transition">
                    {showCopied ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}




