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
}

interface SignupPayload {
  name: string
  email: string
  phone: string
  password: string
  accountType: "USER" | "HOST"
  businessName?: string
}

interface BecomeHostPayload {
  businessName: string
  phone?: string
}

interface StoredAccount extends AuthUser {
  password: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string, expectedRole?: AuthRole) => Promise<AuthUser>
  signup: (payload: SignupPayload) => Promise<AuthUser>
  becomeHost: (payload: BecomeHostPayload) => Promise<AuthUser>
  updateUser: (updates: Partial<AuthUser>) => AuthUser | null
  logout: () => Promise<void>
  isAuthenticated: boolean
  isHost: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const SESSION_KEY = "user"
const ACCOUNTS_KEY = "registeredUsers"

function getBootstrapAccounts(): StoredAccount[] {
  return [
    hydrateAccount({
      id: "admin-gethotels-demo",
      email: "admin@gethotels.com",
      name: "GetHotels Admin",
      password: "Admin@123",
      role: "ADMIN",
      roles: ["ADMIN"],
    }),
  ]
}

function normalizeRoles(roles?: AuthRole[], role?: AuthRole) {
  const nextRoles = new Set<AuthRole>(roles ?? [])

  if (role) {
    nextRoles.add(role)
  }

  if (nextRoles.has("HOST")) {
    nextRoles.add("USER")
  }

  if (nextRoles.size === 0) {
    nextRoles.add("USER")
  }

  return Array.from(nextRoles)
}

function sanitizeUser(account: StoredAccount): AuthUser {
  return {
    id: account.id,
    email: account.email,
    name: account.name,
    role: account.role,
    roles: normalizeRoles(account.roles, account.role),
    phone: account.phone,
    businessName: account.businessName,
  }
}

function resolvePrimaryRole(role: AuthRole, isHost: boolean): AuthRole {
  if (role === "ADMIN") {
    return "ADMIN"
  }

  if (role === "HOST") {
    return "HOST"
  }

  if (isHost) {
    return "HOST"
  }

  return "USER"
}

function createAuthUserFromApiUser(apiUser: {
  id: number | string
  email: string
  name: string
  role: AuthRole
  phone?: string | null
  businessName?: string | null
  isHost: boolean
}) {
  const primaryRole = resolvePrimaryRole(apiUser.role, apiUser.isHost)
  const roles = normalizeRoles(
    [apiUser.role, ...(apiUser.isHost ? ["HOST" as const] : [])],
    primaryRole,
  )

  return sanitizeUser(
    hydrateAccount({
      id: String(apiUser.id),
      email: apiUser.email,
      name: apiUser.name,
      role: primaryRole,
      roles,
      phone: apiUser.phone ?? undefined,
      businessName: apiUser.businessName ?? undefined,
    }),
  )
}

function hydrateAccount(raw: Partial<StoredAccount>): StoredAccount {
  const roles = normalizeRoles(raw.roles, raw.role)
  const preferredRole = raw.role && roles.includes(raw.role) ? raw.role : roles[0]

  return {
    id: raw.id ?? crypto.randomUUID(),
    email: raw.email ?? "",
    name: raw.name ?? raw.email?.split("@")[0] ?? "Guest",
    role: preferredRole,
    roles,
    phone: raw.phone,
    businessName: raw.businessName,
    password: raw.password ?? "",
  }
}

function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") {
    return []
  }

  const bootstrapAccounts = getBootstrapAccounts()
  const storedAccounts = localStorage.getItem(ACCOUNTS_KEY)
  if (!storedAccounts) {
    writeAccounts(bootstrapAccounts)
    return bootstrapAccounts
  }

  try {
    const parsedAccounts = JSON.parse(storedAccounts) as Partial<StoredAccount>[]
    const hydratedAccounts = parsedAccounts.map(hydrateAccount)
    const mergedAccounts = [...hydratedAccounts]

    for (const bootstrapAccount of bootstrapAccounts) {
      if (!mergedAccounts.some(account => account.email.toLowerCase() === bootstrapAccount.email.toLowerCase())) {
        mergedAccounts.push(bootstrapAccount)
      }
    }

    if (mergedAccounts.length !== hydratedAccounts.length) {
      writeAccounts(mergedAccounts)
    }

    return mergedAccounts
  } catch (error) {
    console.error("Failed to parse stored accounts:", error)
    localStorage.removeItem(ACCOUNTS_KEY)
    writeAccounts(bootstrapAccounts)
    return bootstrapAccounts
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function persistSession(nextUser: AuthUser | null, setUser: (user: AuthUser | null) => void) {
  setUser(nextUser)

  if (nextUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
    return
  }

  localStorage.removeItem(SESSION_KEY)
}

function loginFromLocalAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const accounts = readAccounts()
  const existingAccount = accounts.find(account => account.email.toLowerCase() === normalizedEmail)

  if (!existingAccount) {
    throw new Error("Account not found. Please sign up first")
  }

  if (existingAccount.password !== password) {
    throw new Error("Incorrect email or password")
  }

  const primaryRole = resolvePrimaryRole(
    existingAccount.roles.includes("ADMIN") || existingAccount.role === "ADMIN" ? "ADMIN" : "USER",
    existingAccount.roles.includes("HOST") || existingAccount.role === "HOST",
  )
  const roles = normalizeRoles(existingAccount.roles, existingAccount.role)
  const nextAccount = hydrateAccount({ ...existingAccount, role: primaryRole, roles })
  const nextAccounts = accounts.map(account => (account.id === nextAccount.id ? nextAccount : account))
  writeAccounts(nextAccounts)
  return sanitizeUser(nextAccount)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const hydrateSession = async () => {
      const storedUser = localStorage.getItem(SESSION_KEY)

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as Partial<AuthUser>
          const hydratedUser = sanitizeUser(hydrateAccount(parsedUser))
          if (!cancelled) {
            setUser(hydratedUser)
          }
          localStorage.setItem(SESSION_KEY, JSON.stringify(hydratedUser))
        } catch (error) {
          console.error("Failed to parse stored user:", error)
          localStorage.removeItem(SESSION_KEY)
        }
      }

      try {
        const { data: payload } = await api.get("/auth/me", {
          headers: { "Cache-Control": "no-store" },
        })
        const nextUser = createAuthUserFromApiUser(payload.user)
        if (!cancelled) {
          persistSession(nextUser, setUser)
        }
      } catch {
        if (!storedUser && !cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void hydrateSession()

    return () => {
      cancelled = true
    }
  }, [])

  const login = async (email: string, password: string, expectedRole?: AuthRole) => {
    try {
      const { data: payload } = await api.post("/auth/login", { email, password, type: expectedRole })
      const nextUser = createAuthUserFromApiUser(payload.user)
      if (expectedRole && !nextUser.roles.includes(expectedRole)) {
        throw new Error(`This account does not have ${expectedRole.toLowerCase()} access`)
      }
      persistSession(nextUser, setUser)
      return nextUser
    } catch (error) {
      const message = getApiErrorMessage(error)
      if (!/Network Error|Failed to fetch|NetworkError|Load failed/i.test(message)) {
        throw new Error(message)
      }

      const nextUser = loginFromLocalAccount(email, password)
      if (expectedRole && !nextUser.roles.includes(expectedRole)) {
        throw new Error(`This account does not have ${expectedRole.toLowerCase()} access`)
      }
      persistSession(nextUser, setUser)
      return nextUser
    }
  }

  const signup = async ({ name, email, phone, password, accountType, businessName }: SignupPayload) => {
    try {
      const { data: payload } = await api.post("/auth/register", {
        name,
        email,
        phone,
        password,
        role: accountType === "HOST" ? "host" : "user",
        businessName: accountType === "HOST" ? businessName?.trim() : undefined,
      })

      const nextUser = createAuthUserFromApiUser(payload.user)
      const fallbackAccount = hydrateAccount({
        id: nextUser.id,
        email: nextUser.email,
        name: nextUser.name,
        password,
        role: nextUser.role,
        roles: nextUser.roles,
        phone: nextUser.phone,
        businessName: nextUser.businessName,
      })
      const accounts = readAccounts()
      const nextAccounts = [
        ...accounts.filter(account => account.email.toLowerCase() !== fallbackAccount.email.toLowerCase()),
        fallbackAccount,
      ]
      writeAccounts(nextAccounts)
      persistSession(nextUser, setUser)
      return nextUser
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create account. Please try again."))
    }
  }

  const becomeHost = async ({ businessName, phone }: BecomeHostPayload) => {
    if (!user) {
      throw new Error("Please log in to activate host access")
    }

    const response = await api.patch("/auth/me", {
        name: user.name,
        email: user.email,
        phone: phone?.trim() || user.phone,
        businessName: businessName.trim(),
        activateHost: true,
      }).catch(() => null)

    if (response) {
      const payload = response.data
      const nextUser = createAuthUserFromApiUser(payload.user)
      persistSession(nextUser, setUser)
      return nextUser
    }

    const accounts = readAccounts()
    const existingAccount = accounts.find(account => account.id === user.id || account.email.toLowerCase() === user.email.toLowerCase())
    const nextAccount = hydrateAccount({
      ...(existingAccount ?? user),
      password: existingAccount?.password ?? "",
      role: "HOST",
      roles: normalizeRoles([...(existingAccount?.roles ?? user.roles), "HOST"], "HOST"),
      businessName: businessName.trim(),
      phone: phone?.trim() || existingAccount?.phone || user.phone,
    })

    const nextAccounts = existingAccount
      ? accounts.map(account => (account.id === existingAccount.id ? nextAccount : account))
      : [...accounts, nextAccount]

    writeAccounts(nextAccounts)
    const nextUser = sanitizeUser(nextAccount)
    persistSession(nextUser, setUser)
    return nextUser
  }

  const updateUser = (updates: Partial<AuthUser>) => {
    if (!user) {
      return null
    }

    const nextUser = sanitizeUser(hydrateAccount({
      ...user,
      ...updates,
      roles: updates.roles ?? user.roles,
      role: updates.role ?? user.role,
    }))
    persistSession(nextUser, setUser)
    return nextUser
  }

  const logout = async () => {
    persistSession(null, setUser)

    await api.post("/auth/logout").catch(() => undefined)
    await signOut({ redirect: false }).catch(() => undefined)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        becomeHost,
        updateUser,
        logout,
        isAuthenticated: !!user,
        isHost: !!user?.roles.includes("HOST"),
        isAdmin: !!user?.roles.includes("ADMIN"),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
