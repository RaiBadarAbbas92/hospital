import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const recentPatients = await sql`
      SELECT 
        id,
        patient_id,
        first_name || ' ' || last_name as name,
        created_at as date_admitted,
        status
      FROM patients
      ORDER BY created_at DESC
      LIMIT 5
    `

    if (!recentPatients || recentPatients.length === 0) {
      return NextResponse.json([])
    }

    return NextResponse.json(recentPatients)
  } catch (error) {
    console.error("Error fetching recent patients:", error)
    return NextResponse.json([])
  }
}
