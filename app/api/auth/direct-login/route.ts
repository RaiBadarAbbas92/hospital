import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
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
    const cookieStore = cookies()
    cookieStore.set({
      name: "auth_token",
      value: "admin-token",
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "strict",
    })

    return NextResponse.json({
      success: true,
      message: "Direct login successful",
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
      },
      { status: 500 },
    )
  }
}
