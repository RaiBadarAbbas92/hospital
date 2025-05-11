import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if users table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) as exists
    `

    const tableExists = tableCheck[0].exists

    if (tableExists) {
      return NextResponse.json({
        success: true,
        message: "Users table already exists",
      })
    }

    // Create users table
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        department_id INTEGER,
        status VARCHAR(50) NOT NULL,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    return NextResponse.json({
      success: true,
      message: "Users table created successfully",
    })
  } catch (error) {
    console.error("Error setting up database:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to set up database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
