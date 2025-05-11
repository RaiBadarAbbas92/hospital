import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import * as jose from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Add paths that don't require authentication
const publicPaths = ["/login", "/signup", "/api/auth/login", "/api/auth/signup", "/api/test-db/create-test-user"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const authToken = request.cookies.get("auth_token")

  // If no auth token and trying to access protected route, redirect to signup
  if (!authToken && !pathname.startsWith("/api/")) {
    return NextResponse.redirect(new URL("/signup", request.url))
  }

  // Get the token from the cookies
  const token = request.cookies.get("auth_token")?.value

  // If there's no token, redirect to login
  if (!token) {
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  try {
    // Verify the token using jose instead of jsonwebtoken
    const secret = new TextEncoder().encode(JWT_SECRET)
    await jose.jwtVerify(token, secret)
    return NextResponse.next()
  } catch (error) {
    // If token is invalid, redirect to login
    console.error("Token verification error:", error)
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
