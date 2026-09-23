"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { signOut } from "next-auth/react"
import api, { getApiErrorMessage } from "@/lib/axios"

export type AuthRole = "USER" | "HOST" | "ADMIN"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: AuthRole
  roles: AuthRole[]
  phone?: string
  businessName?: string
  isHostApproved?: boolean
  hasHostApplication?: boolean
  reconsentRequired?: boolean
  pendingPolicies?: Array<{
    id: string
    type: string
    version: string
    title: string
    summary: string | null
  }>
}

export interface AuthDevice {
  id: string
  deviceId: string
  deviceName?: string | null
  browser?: string | null
  os?: string | null
  lastSeenAt?: string
  isCurrent?: boolean
}

export class DeviceLimitError extends Error {
  readonly devices: AuthDevice[]

  constructor(message: string, devices: AuthDevice[]) {
    super(message)
    this.name = "DeviceLimitError"
    this.devices = devices
  }
}

interface SignupPayload {
  name: string
  email: string
  phone: string
  password: string
  accountType: "USER" | "HOST"
  businessName?: string
  agreedToTerms?: boolean
  consentGiven?: boolean
}
interface BecomeHostPayload { businessName: string; phone?: string }

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  replaceDeviceLogin: (email: string, password: string, deviceToLogout: string) => Promise<AuthUser>
  signup: (payload: SignupPayload) => Promise<AuthUser>
  becomeHost: (payload: BecomeHostPayload) => Promise<AuthUser>
  updateUser: (updates: Pick<Partial<AuthUser>, "name" | "email" | "phone" | "businessName">) => AuthUser | null
  logout: () => Promise<void>
  isAuthenticated: boolean
  isHost: boolean
  isHostApplicant: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
type ApiUser = { id: number | string; email: string; name: string; role: AuthRole; phone?: string | null; businessName?: string | null; isHost?: boolean; hasHostApplication?: boolean; isHostApproved?: boolean }

function fromApiUser(user: ApiUser): AuthUser {
  const role = user.role === "ADMIN" ? "ADMIN" : user.role === "HOST" && user.isHost ? "HOST" : "USER"
  return { id: String(user.id), email: user.email, name: user.name, role, roles: role === "HOST" ? ["USER", "HOST"] : [role], phone: user.phone ?? undefined, businessName: user.businessName ?? undefined, hasHostApplication: Boolean(user.hasHostApplication), isHostApproved: Boolean(user.isHostApproved) }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };
    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    void api.get("/auth/me", { headers: { "Cache-Control": "no-store" } })
      .then(({ data }) => {
        if (typeof window !== "undefined") {
          const token = data.token || data.accessToken;
          if (token) {
            localStorage.setItem("accessToken", token);
            localStorage.setItem("token", token);
          }
          if (data.deviceId) {
            localStorage.setItem("deviceId", data.deviceId);
          }
        }
        setUser(fromApiUser(data.user));
      })
      .catch(() => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("deviceId");
        }
        setUser(null);
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password })
      if (typeof window !== "undefined") {
        const token = data.token || data.accessToken;
        if (token) {
          localStorage.setItem("accessToken", token);
          localStorage.setItem("token", token);
        }
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        if (data.deviceId) {
          localStorage.setItem("deviceId", data.deviceId);
        }
      }
      const nextUser = fromApiUser(data.user)
      setUser(nextUser)
      return nextUser
    } catch (error) {
      const payload = (error as { response?: { data?: { error?: string; message?: string; devices?: AuthDevice[] } } }).response?.data
      if (payload?.error === "DEVICE_LIMIT_REACHED" && Array.isArray(payload.devices)) {
        throw new DeviceLimitError(payload.message ?? "Maximum device limit reached", payload.devices)
      }
      throw new Error(getApiErrorMessage(error, "Unable to sign in. Please try again."))
    }
  }

  const replaceDeviceLogin = async (email: string, password: string, deviceToLogout: string) => {
    try {
      const { data } = await api.post("/auth/login/replace-device", { email, password, deviceToLogout })
      if (typeof window !== "undefined") {
        const token = data.token || data.accessToken;
        if (token) {
          localStorage.setItem("accessToken", token);
          localStorage.setItem("token", token);
        }
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }
        if (data.deviceId) {
          localStorage.setItem("deviceId", data.deviceId);
        }
      }
      const nextUser = fromApiUser(data.user)
      setUser(nextUser)
      return nextUser
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Unable to replace that device. Please try again."))
    }
  }

  const signup = async ({ name, email, phone, password, accountType, businessName }: SignupPayload) => {
    try {
      const { data } = await api.post("/auth/register", { name, email, phone, password, role: accountType === "HOST" ? "host" : "user", businessName: accountType === "HOST" ? businessName?.trim() : undefined })
      if (typeof window !== "undefined" && data.deviceId) {
        localStorage.setItem("deviceId", data.deviceId);
      }
      return fromApiUser(data.user)
    } catch (error) { throw new Error(getApiErrorMessage(error, "Failed to create account. Please try again.")) }
  }

  const becomeHost = async ({ businessName, phone }: BecomeHostPayload) => {
    if (!user) throw new Error("Please sign in to apply as a host")
    try {
      const { data } = await api.patch("/auth/me", { businessName: businessName.trim(), phone: phone?.trim() || user.phone, activateHost: true })
      const nextUser = fromApiUser(data.user)
      setUser(nextUser)
      return nextUser
    } catch (error) { throw new Error(getApiErrorMessage(error, "Could not submit your host application.")) }
  }

  const updateUser = (updates: Pick<Partial<AuthUser>, "name" | "email" | "phone" | "businessName">) => {
    if (!user) return null
    const nextUser = { ...user, ...updates }
    setUser(nextUser)
    return nextUser
  }

  const logout = async () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("deviceId");
    }
    await api.post("/auth/logout").catch(() => undefined)
    await signOut({ redirect: false }).catch(() => undefined)
  }

  return <AuthContext.Provider value={{ user, loading, login, replaceDeviceLogin, signup, becomeHost, updateUser, logout, isAuthenticated: Boolean(user), isHost: user?.role === "HOST" && Boolean(user.isHostApproved), isHostApplicant: Boolean(user?.hasHostApplication), isAdmin: user?.role === "ADMIN" }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
