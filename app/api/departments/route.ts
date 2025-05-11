import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const departments = await sql`
      SELECT id, name
      FROM departments
      ORDER BY name
    `

    return NextResponse.json(departments)
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}
