// middleware.js

import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Admin subdomain helpers
// ---------------------------------------------------------------------------

// True when the request came in on admin.website.com (vs website.com)
function isAdminHost(host) {
  return host.startsWith("admin.");
}

// Converts the raw incoming pathname into the "canonical" /admin/... form
// we use for all internal logic, regardless of which host it arrived on.
//   admin.website.com/dashboard  -> /admin/dashboard
//   admin.website.com/admin/x    -> /admin/x   (avoid double prefix)
//   website.com/admin/dashboard  -> /admin/dashboard (unchanged)
function toCanonicalPath(pathname, onAdminHost) {
  if (!onAdminHost) return pathname;
  if (pathname.startsWith("/admin")) return pathname;
  return pathname === "/" ? "/admin" : `/admin${pathname}`;
}

// Converts a canonical /admin/... path back into whatever path makes sense
// for the host the request actually came in on. Used when building
// redirect/rewrite targets.
//   onAdminHost=true,  "/admin/login"     -> "/login"
//   onAdminHost=false, "/admin/login"     -> "/admin/login"
function toHostPath(canonicalPath, onAdminHost) {
  if (!onAdminHost) return canonicalPath;
  if (!canonicalPath.startsWith("/admin")) return canonicalPath;
  const stripped = canonicalPath.slice("/admin".length);
  return stripped === "" ? "/" : stripped;
}

// ---------------------------------------------------------------------------
// JWT / auth helpers (unchanged from your original logic)
// ---------------------------------------------------------------------------

async function verifyJWTLocally(token) {
  if (!token) return { valid: false, payload: null };

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      valid: true,
      payload: payload,
    };
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return { valid: false, payload: null };
  }
}

function shouldMakeAPICall(payload, lastVerified = null) {
  if (!payload) return { shouldCall: false, reason: "no_payload" };

  const now = Math.floor(Date.now() / 1000);

  if (lastVerified) {
    const oneHour = 60 * 60;
    const lastVerifiedTimestamp = Math.floor(
      new Date(lastVerified).getTime() / 1000,
    );
    if (now - lastVerifiedTimestamp < oneHour) {
      return { shouldCall: false, reason: "recently_verified" };
    }
  }

  if (payload.role === "user" && payload.login_time) {
    const loginTimestamp = Math.floor(
      new Date(payload.login_time).getTime() / 1000,
    );
    const thirtyMinutes = 30 * 60;
    if (now - loginTimestamp < thirtyMinutes) {
      return { shouldCall: false, reason: "recent_login" };
    }
  }

  return { shouldCall: true, reason: "periodic_check" };
}

async function getAuthFromCookies() {
  const cookieStore = await cookies();
  try {
    const authCookie = cookieStore.get("auth-storage");

    if (!authCookie || !authCookie.value) {
      return null;
    }

    const parsed = JSON.parse(authCookie.value);
    return {
      isAuthenticated: parsed.state?.isAuthenticated || false,
      user: parsed.state?.user || null,
      admin: parsed.state?.admin || null,
      token: parsed.state?.token || null,
      userType: parsed.state?.userType || null,
      tokenVerified: parsed.state?.tokenVerified || null,
      tokenValid: parsed.state?.tokenValid || false,
      userRole: parsed.state?.userRole || null,
    };
  } catch (error) {
    console.error("Error parsing auth cookie:", error);
    return null;
  }
}

function updateAuthCookie(response, authState, tokenValid, userRole) {
  const updatedState = {
    ...authState,
    tokenVerified: new Date().toISOString(),
    tokenValid,
    userRole,
  };

  const authCookie = { state: updatedState };

  response.cookies.set("auth-storage", JSON.stringify(authCookie), {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

async function verifyTokenAPI(token) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${apiUrl}/auth/verify?token=${token}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("API Token verification failed:", response.status);
      return { valid: false, role: null };
    }

    const data = await response.json();
    return {
      valid: data.valid || false,
      role: data.role || null,
    };
  } catch (error) {
    console.error("API Token verification error:", error);
    return { valid: false, role: null };
  }
}

async function verifyToken(authState) {
  const token = authState?.token;

  if (!token) {
    return { valid: false, role: null, response: null };
  }

  const jwtResult = await verifyJWTLocally(token);

  if (!jwtResult.valid) {
    console.log("[Middleware] JWT locally invalid");
    const nextResponse = NextResponse.next();
    return {
      valid: false,
      role: null,
      response: updateAuthCookie(nextResponse, authState, false, null),
    };
  }

  const payload = jwtResult.payload;
  const userRole = payload.role;
  const userId = payload.id;
  const adminLevel = payload.admin_level || null;

  console.log(
    `[Middleware] JWT valid - User: ${userId}, Role: ${userRole}${adminLevel ? `, Level: ${adminLevel}` : ""}`,
  );

  const apiCheck = shouldMakeAPICall(payload, authState?.tokenVerified);

  if (!apiCheck.shouldCall) {
    console.log(`[Middleware] Skipping API call: ${apiCheck.reason}`);
    return {
      valid: true,
      role: userRole,
      response: null,
    };
  }

  console.log(`[Middleware] Making API verification: ${apiCheck.reason}`);

  const apiResult = await verifyTokenAPI(token);

  const nextResponse = NextResponse.next();
  return {
    valid: apiResult.valid,
    role: apiResult.role || userRole,
    response: updateAuthCookie(
      nextResponse,
      authState,
      apiResult.valid,
      apiResult.role || userRole,
    ),
  };
}

// ---------------------------------------------------------------------------
// Main middleware
// ---------------------------------------------------------------------------

export async function middleware(request) {
  const host = request.headers.get("host") || "";
  const onAdminHost = isAdminHost(host);

  const rawPathname = request.nextUrl.pathname;
  // All logic below works against the canonical /admin/... path,
  // regardless of whether we're on admin.website.com or website.com/admin/...
  const pathname = toCanonicalPath(rawPathname, onAdminHost);
  const needsRewrite = onAdminHost && pathname !== rawPathname;

  // 1. Get Authentication State
  const authState = await getAuthFromCookies();

  // 2. Verify Token (locally first, then API if needed)
  const tokenVerification = await verifyToken(authState);

  const isAuthenticated = authState?.isAuthenticated && tokenVerification.valid;
  const userRole = tokenVerification.role;
  const isAdmin =
    isAuthenticated &&
    (userRole === "admin" ||
      userRole === "superadmin" ||
      authState?.userType === "admin");
  const isUser =
    isAuthenticated && (userRole === "user" || userRole === "admin");

  console.log(
    `[Middleware] host=${host} rawPath=${rawPathname} canonicalPath=${pathname} - Authenticated: ${isAuthenticated}, Role: ${userRole}`,
  );

  // Route definitions (all evaluated against the canonical path)
  const isAdminPath = pathname.startsWith("/admin");
  const isAuthPath = pathname === "/login" || pathname === "/register";
  const isUserProtectedPath = ["/profile", "/invoices", "/payment"].some((p) =>
    pathname.startsWith(p),
  );
  const isActionPath = /\/(enroll|book)\/?$/.test(pathname);

  // Builds a URL for redirect/rewrite targets. Takes a canonical path
  // (e.g. "/admin/login") and converts it to whatever the *current host*
  // expects (e.g. "/login" if we're already on admin.website.com).
  const buildUrl = (canonicalPath) => {
    const hostPath = toHostPath(canonicalPath, onAdminHost);
    return new URL(hostPath, request.url);
  };

  const createRedirectResponse = (canonicalPathOrUrl) => {
    const target =
      typeof canonicalPathOrUrl === "string"
        ? buildUrl(canonicalPathOrUrl)
        : canonicalPathOrUrl;
    const redirectResponse = NextResponse.redirect(target);
    if (tokenVerification.response) {
      tokenVerification.response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
    }
    return redirectResponse;
  };

  // Replaces NextResponse.next() — also handles rewriting admin-host
  // requests to their /admin/... equivalent path.
  const createNextResponse = () => {
    if (needsRewrite) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = pathname; // canonical /admin/... path
      const rewriteResponse = NextResponse.rewrite(rewriteUrl);
      if (tokenVerification.response) {
        tokenVerification.response.cookies.getAll().forEach((cookie) => {
          rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
        });
      }
      return rewriteResponse;
    }
    return tokenVerification.response || NextResponse.next();
  };

  // Route handling logic
  if (isAdminPath) {
    if (pathname.startsWith("/admin/login")) {
      if (isAdmin) {
        return createRedirectResponse("/admin/dashboard");
      }
      return createNextResponse();
    }

    if (!isAdmin) {
      const loginUrl = buildUrl("/admin/login");
      loginUrl.searchParams.set("redirect", toHostPath(pathname, onAdminHost));
      return createRedirectResponse(loginUrl);
    }
  }

  if (isAuthPath) {
    if (isAuthenticated) {
      if (isAdmin) {
        return createRedirectResponse("/admin/dashboard");
      }
      if (isUser) {
        return createRedirectResponse("/profile");
      }
    }
  }

  if (isUserProtectedPath || isActionPath) {
    if (!isAuthenticated) {
      const loginUrl = buildUrl("/login");
      loginUrl.searchParams.set("redirect", toHostPath(pathname, onAdminHost));
      return createRedirectResponse(loginUrl);
    }
  }

  return createNextResponse();
}

export const config = {
  matcher: [
    "/((?!_next(?:/static|/image)|favicon\\.ico|image/|.*\\.(?:svg|jpg|jpeg|png|gif|webp|ico)$).*)",
  ],
};
