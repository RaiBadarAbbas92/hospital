import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // Test user credentials
    const testUser = {
      name: "Test Admin",
      email: "admin@hospital.com",
      password: "admin123",
      role: "admin"
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${testUser.email}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Test user already exists",
        credentials: {
          email: testUser.email,
          password: testUser.password
        }
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(testUser.password, 10)

    // Create test user
    await sql`
      INSERT INTO users (name, email, password, role, created_at)
      VALUES (${testUser.name}, ${testUser.email}, ${hashedPassword}, ${testUser.role}, CURRENT_TIMESTAMP)
    `

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      credentials: {
        email: testUser.email,
        password: testUser.password
      }
    })
  } catch (error) {
    console.error("Error creating test user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create test user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
} 