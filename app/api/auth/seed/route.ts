import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // Test database connection first
    try {
      await sql`SELECT 1`
      console.log("Database connection successful")
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }

    // Check if admin user exists
    const existingUsers = await sql`
      SELECT id, email FROM users WHERE email = 'admin@hospital.com'
    `

    console.log("Existing users check:", existingUsers)

    if (existingUsers.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
        user: { email: existingUsers[0].email },
      })
    }

    // Hash the password - use a simpler password for testing
    const plainPassword = "password123"
    const hashedPassword = await bcrypt.hash(plainPassword, 10)

    console.log("Password hashed successfully")

    // Insert admin user
    const result = await sql`
      INSERT INTO users (
        name,
        email,
        password,
        role,
        status,
        last_active
      ) VALUES (
        'Admin User',
        'admin@hospital.com',
        ${hashedPassword},
        'Admin',
        'Active',
        CURRENT_TIMESTAMP
      )
      RETURNING id, email
    `

    console.log("User created:", result)

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: { email: "admin@hospital.com" },
      credentials: {
        email: "admin@hospital.com",
        password: plainPassword,
      },
    })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create admin user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
