import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

// Force this route to be dynamic and not statically optimized
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Find the user by email
    const users = await sql`
      SELECT id, name, email, password, role
      FROM users
      WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    const user = users[0]

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    // Update last active timestamp
    try {
      await sql`
        UPDATE users
        SET last_active = CURRENT_TIMESTAMP
        WHERE id = ${user.id}
      `
    } catch (updateError) {
      console.error("Error updating last active:", updateError)
      // Continue with login even if this fails
    }

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // Set the auth token cookie
    response.cookies.set({
      name: "auth_token",
      value: "user-token",
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "strict",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during login",
      },
      { status: 500 },
    )
  }
}
