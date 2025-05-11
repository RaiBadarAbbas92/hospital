import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import * as jose from "jose"

// WARNING: This is for testing only and should be removed in production
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: Request) {
  try {
    // Find the admin user
    const users = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE email = 'admin@hospital.com'
      LIMIT 1
    `

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Admin user not found",
          action: "Please visit /api/auth/seed first to create an admin user",
        },
        { status: 404 },
      )
    }

    const user = users[0]

    // Create a JWT token using jose
    const secret = new TextEncoder().encode(JWT_SECRET)
    const token = await new jose.SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret)

    // Set the token in a cookie
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "strict",
    })

    return NextResponse.json({
      success: true,
      message: "Direct login successful. You are now logged in as admin.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      redirectTo: "/dashboard",
    })
  } catch (error) {
    console.error("Direct login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during direct login",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
