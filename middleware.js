// middleware.js

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Helper function to parse auth data from cookies.
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
    };
  } catch (error) {
    console.error("Error parsing auth cookie:", error);
    return null;
  }
}

// Helper function to verify token with your FastAPI backend
async function verifyToken(token) {
  if (!token) {
    return { valid: false, role: null };
  }
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
      console.error("Token verification failed:", response.status);
      return { valid: false, role: null };
    }

    const data = await response.json();
    return {
      valid: data.valid || false,
      role: data.role || null,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return { valid: false, role: null };
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Get Authentication State (FIXED: Now properly awaiting the async function)
  const authState = await getAuthFromCookies();

  // Token verification remains asynchronous because it involves a network request.
  const tokenVerification = await verifyToken(authState?.token);

  const isAuthenticated = authState?.isAuthenticated && tokenVerification.valid;
  const userRole = tokenVerification.role;
  const isAdmin = isAuthenticated && userRole === "admin";
  const isUser =
    isAuthenticated && (userRole === "user" || userRole === "admin");

  console.log(`[Middleware] ${pathname} - Authenticated: ${isAuthenticated}`);

  // Define route groups
  const isAdminPath = pathname.startsWith("/admin");
  const isAuthPath = pathname === "/login" || pathname === "/register";
  const isUserProtectedPath = ["/profile", "/invoices", "/payment"].some((p) =>
    pathname.startsWith(p)
  );
  const isActionPath = /\/(enroll|book)\/?$/.test(pathname);

  // 2. Handle Admin Routes
  if (isAdminPath) {
    // If trying to access the admin login page
    if (pathname.startsWith("/admin/login")) {
      // If already a logged-in admin, redirect to dashboard
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      // Otherwise, allow access to the login page
      return NextResponse.next();
    }

    // For all other admin pages, require admin authentication
    if (!isAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Handle Auth Routes (Login, Register)
  if (isAuthPath) {
    // If an authenticated user tries to access login/register, redirect them
    if (isAuthenticated) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      if (isUser) {
        return NextResponse.redirect(new URL("/profile", request.url));
      }
    }
  }

  // 4. Handle User Protected Routes (Profile, etc.) & Action Routes (enroll, book)
  if (isUserProtectedPath || isActionPath) {
    // If not authenticated, redirect to the general login page
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Handle Logout
  if (pathname.startsWith("/logout")) {
    return NextResponse.next();
  }

  // 6. For all other routes (public pages), allow access
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    "/((?!_next(?:/static|/image)|favicon\\.ico|image/|.*\\.(?:svg|jpg|jpeg|png|gif|webp|ico)$).*)",
  ],
};
