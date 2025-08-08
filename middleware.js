// middleware.js

import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Helper function to verify JWT token locally using the secret
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

// Helper function to check if we should make API call for additional verification
function shouldMakeAPICall(payload, lastVerified = null) {
  if (!payload) return { shouldCall: false, reason: "no_payload" };

  const now = Math.floor(Date.now() / 1000);

  // If we haven't verified via API in the last hour, do it
  if (lastVerified) {
    const oneHour = 60 * 60;
    const lastVerifiedTimestamp = Math.floor(new Date(lastVerified).getTime() / 1000);
    if (now - lastVerifiedTimestamp < oneHour) {
      return { shouldCall: false, reason: "recently_verified" };
    }
  }

  // For user tokens, check if it's been more than 30 minutes since login
  if (payload.role === "user" && payload.login_time) {
    const loginTimestamp = Math.floor(new Date(payload.login_time).getTime() / 1000);
    const thirtyMinutes = 30 * 60;
    if (now - loginTimestamp < thirtyMinutes) {
      return { shouldCall: false, reason: "recent_login" };
    }
  }

  return { shouldCall: true, reason: "periodic_check" };
}

// Helper function to parse auth data from cookies
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

// Helper function to update auth cookie with verification data
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

// Fallback API verification (only when needed)
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

// Main token verification function
async function verifyToken(authState) {
  const token = authState?.token;

  if (!token) {
    return { valid: false, role: null, response: null };
  }

  // Step 1: Verify JWT locally first (fastest)
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

  // Step 2: Extract role and user info from JWT payload
  const payload = jwtResult.payload;
  const userRole = payload.role;
  const userId = payload.id;
  const adminLevel = payload.admin_level || null;

  console.log(
    `[Middleware] JWT valid - User: ${userId}, Role: ${userRole}${adminLevel ? `, Level: ${adminLevel}` : ""}`,
  );

  // Step 3: Check if we need additional API verification
  const apiCheck = shouldMakeAPICall(payload, authState?.tokenVerified);

  if (!apiCheck.shouldCall) {
    console.log(`[Middleware] Skipping API call: ${apiCheck.reason}`);
    return {
      valid: true,
      role: userRole,
      response: null, // No need to update cookie
    };
  }

  // Step 4: Make API call for additional verification (rate limited)
  console.log(`[Middleware] Making API verification: ${apiCheck.reason}`);

  const apiResult = await verifyTokenAPI(token);

  // Update cookie with API verification result
  const nextResponse = NextResponse.next();
  return {
    valid: apiResult.valid,
    role: apiResult.role || userRole, // Fallback to JWT role if API doesn't return role
    response: updateAuthCookie(nextResponse, authState, apiResult.valid, apiResult.role || userRole),
  };
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Get Authentication State
  const authState = await getAuthFromCookies();

  // 2. Verify Token (locally first, then API if needed)
  const tokenVerification = await verifyToken(authState);

  const isAuthenticated = authState?.isAuthenticated && tokenVerification.valid;
  const userRole = tokenVerification.role;
  const isAdmin = isAuthenticated && userRole === "admin";
  const isUser = isAuthenticated && (userRole === "user" || userRole === "admin");

  console.log(`[Middleware] ${pathname} - Authenticated: ${isAuthenticated}, Role: ${userRole}`);

  // Route definitions
  const isAdminPath = pathname.startsWith("/admin");
  const isAuthPath = pathname === "/login" || pathname === "/register";
  const isUserProtectedPath = ["/profile", "/invoices", "/payment"].some((p) => pathname.startsWith(p));
  const isActionPath = /\/(enroll|book)\/?$/.test(pathname);

  // Helper functions for responses
  const createRedirectResponse = (url) => {
    const redirectResponse = NextResponse.redirect(new URL(url, request.url));
    if (tokenVerification.response) {
      tokenVerification.response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
    }
    return redirectResponse;
  };

  const createNextResponse = () => {
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
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return createRedirectResponse(loginUrl.toString());
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
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return createRedirectResponse(loginUrl.toString());
    }
  }

  return createNextResponse();
}

export const config = {
  matcher: ["/((?!_next(?:/static|/image)|favicon\\.ico|image/|.*\\.(?:svg|jpg|jpeg|png|gif|webp|ico)$).*)"],
};
