import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import * as jose from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-this-in-production"

export async function POST(request: Request) {
  try {
    const { name, email, password, role = "user" } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Name, email, and password are required",
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUsers = await sql`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const newUser = await sql`
      INSERT INTO users (name, email, password, role, created_at)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, CURRENT_TIMESTAMP)
      RETURNING id, name, email, role
    `

    if (newUser.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user",
        },
        { status: 500 }
      )
    }

    const user = newUser[0]

    // Create JWT token
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during signup",
      },
      { status: 500 }
    )
  }
} 