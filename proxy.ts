import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type SessionRole = "USER" | "HOST" | "ADMIN";

type AuthSession = {
  id?: string;
  role?: SessionRole;
  isHost?: boolean;
  isHostApplicant?: boolean;
};

type AuthSessionResult = {
  session: AuthSession | null;
  setCookies?: string[];
};

const publicPaths = new Set([
  "/login",
  "/signup",
  "/host/signup",
]);

const userOnlyPaths = ["/profile", "/wishlist"];

async function getCurrentAuthSession(req: NextRequest): Promise<AuthSessionResult> {
  const cookieHeader = req.headers.get("cookie") ?? "";
  try {
    const response = await fetch(new URL("/api/auth/me", req.nextUrl.origin), {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as {
        user?: {
          id?: string;
          role?: SessionRole;
          isHost?: boolean;
          hasHostApplication?: boolean;
        };
      };
      const session = payload.user?.id
        ? {
            id: String(payload.user.id),
            role: payload.user.role,
            isHost: payload.user.isHost === true,
            isHostApplicant: payload.user.hasHostApplication === true,
          }
        : null;
      return { session };
    }

    const hasRefreshTokenCookie = Boolean(req.cookies.get("refreshToken")?.value || cookieHeader.includes("refreshToken="));
    if (response.status === 401 && hasRefreshTokenCookie) {
      const refreshResponse = await fetch(new URL("/api/auth/refresh", req.nextUrl.origin), {
        method: "POST",
        headers: {
          cookie: cookieHeader,
          origin: req.nextUrl.origin,
        },
        cache: "no-store",
      });

      if (refreshResponse.ok) {
        const payload = (await refreshResponse.json()) as {
          user?: {
            id?: string;
            role?: SessionRole;
            isHost?: boolean;
            hasHostApplication?: boolean;
          };
        };

        const session = payload.user?.id
          ? {
              id: String(payload.user.id),
              role: payload.user.role,
              isHost: payload.user.isHost === true,
              isHostApplicant: payload.user.hasHostApplication === true,
            }
          : null;

        const setCookies: string[] = typeof refreshResponse.headers.getSetCookie === "function"
          ? refreshResponse.headers.getSetCookie()
          : [refreshResponse.headers.get("set-cookie")].filter(Boolean) as string[];

        return { session, setCookies };
      }
    }

    return { session: null };
  } catch {
    return { session: null };
  }
}

function redirectToLogin(req: NextRequest, hostIntent = false) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  if (hostIntent) {
    url.searchParams.set("intent", "host");
  }
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  if (publicPaths.has(path)) {
    return NextResponse.next();
  }

  // The backend is the single issuer and verifier of the httpOnly session
  // cookie. Do not duplicate its signing secret in the frontend runtime.
  // This server-side check forwards the cookie to the same-origin proxy,
  // automatically renewing expired access tokens when a valid refresh cookie exists.
  const { session, setCookies } = await getCurrentAuthSession(req);

  if (!session) {
    if (path.startsWith("/admin")) return redirectToLogin(req);
    if (path === "/host" || path.startsWith("/host/")) return redirectToLogin(req, true);
    return redirectToLogin(req);
  }

  const response = NextResponse.next();

  if (setCookies && setCookies.length > 0) {
    for (const cookieStr of setCookies) {
      response.headers.append("Set-Cookie", cookieStr);
    }
  }

  if (path.startsWith("/admin") && session.role !== "ADMIN") {
    return redirectToLogin(req);
  }

  if (path.startsWith("/host/kyc") && session.isHost !== true && session.isHostApplicant !== true) {
    const hostUrl = req.nextUrl.clone();
    hostUrl.pathname = "/host";
    hostUrl.search = "";
    const redirectRes = NextResponse.redirect(hostUrl);
    if (setCookies && setCookies.length > 0) {
      for (const cookieStr of setCookies) {
        redirectRes.headers.append("Set-Cookie", cookieStr);
      }
    }
    return redirectRes;
  }

  if (path.startsWith("/host/") && !path.startsWith("/host/kyc") && session.isHost !== true) {
    const destination = req.nextUrl.clone();
    destination.pathname = session.isHostApplicant ? "/host/kyc" : "/host";
    destination.search = "";
    const redirectRes = NextResponse.redirect(destination);
    if (setCookies && setCookies.length > 0) {
      for (const cookieStr of setCookies) {
        redirectRes.headers.append("Set-Cookie", cookieStr);
      }
    }
    return redirectRes;
  }

  if (userOnlyPaths.some((protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`))) {
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/host", "/host/:path*", "/profile", "/profile/:path*", "/wishlist", "/wishlist/:path*"],
};
