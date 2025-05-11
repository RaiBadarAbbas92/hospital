import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    // Insert the user into the database
    const result = await sql`
      INSERT INTO users (
        name,
        email,
        password,
        role,
        department_id,
        status,
        last_active
      ) VALUES (
        ${data.name},
        ${data.email},
        ${hashedPassword},
        ${data.role},
        ${data.departmentId ? Number.parseInt(data.departmentId) : null},
        'Active',
        CURRENT_TIMESTAMP
      )
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      user: {
        id: result[0].id,
      },
    })
  } catch (error) {
    console.error("Error adding user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add user",
      },
      { status: 500 },
    )
  }
}
