import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import * as jose from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Test database connection
    try {
      await sql`SELECT 1`
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed. Please try again later.",
        },
        { status: 500 },
      )
    }

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
    let passwordMatch = false
    try {
      passwordMatch = await bcrypt.compare(password, user.password)
    } catch (bcryptError) {
      console.error("bcrypt error:", bcryptError)
      return NextResponse.json(
        {
          success: false,
          error: "Authentication error",
        },
        { status: 500 },
      )
    }

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

    // Create a JWT token using jose
    try {
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
    } catch (jwtError) {
      console.error("JWT error:", jwtError)
      return NextResponse.json(
        {
          success: false,
          error: "Error creating authentication token",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
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
