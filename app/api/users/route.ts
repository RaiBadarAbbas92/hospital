import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const users = await sql`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        d.name as department,
        u.status,
        u.last_active
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY u.id
    `

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
