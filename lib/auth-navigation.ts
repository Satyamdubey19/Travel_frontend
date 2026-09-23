export type AuthNavigationUser = {
  role: "USER" | "HOST" | "ADMIN"
  hasHostApplication?: boolean
}

/**
 * Accept only a browser route that this frontend owns. This is a UX guard; the
 * backend and edge middleware still authorize every protected destination.
 */
export function safePostAuthPath(value: string) {
  return value.startsWith("/") &&
    !value.startsWith("//") &&
    value !== "/api" &&
    !value.startsWith("/api/") &&
    !value.startsWith("/_next/")
    ? value
    : ""
}

function isPathWithin(path: string, root: string) {
  return path === root || path.startsWith(`${root}/`)
}

export function resolvePostLoginDestination(
  user: AuthNavigationUser,
  callbackUrl: string,
  hostIntent: boolean,
) {
  const requested = safePostAuthPath(callbackUrl)
  const requestedAdminPath = isPathWithin(requested, "/admin")
  const requestedHostPath = isPathWithin(requested, "/host")
  const requestedHostApplication = requested === "/host/signup"
  const requestedHostVerification = isPathWithin(requested, "/host/kyc")

  if (user.role === "ADMIN") {
    return requested && !requestedHostPath ? requested : "/admin"
  }

  if (user.role === "HOST") {
    return requested && !requestedAdminPath && !requestedHostApplication ? requested : "/host"
  }

  if (user.hasHostApplication && requestedHostVerification) {
    return requested
  }

  if (requested && !requestedAdminPath && !requestedHostPath) {
    return requested
  }

  return hostIntent
    ? user.hasHostApplication
      ? "/host/kyc"
      : "/host/signup"
    : "/"
}
