import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const labTests = await sql`
      SELECT 
        lt.id, 
        lt.test_id, 
        p.patient_id,
        p.first_name || ' ' || p.last_name as patient_name,
        lt.test_name,
        u.name as requested_by,
        lt.request_date,
        lt.status,
        lt.priority
      FROM lab_tests lt
      JOIN patients p ON lt.patient_id = p.id
      JOIN users u ON lt.requested_by = u.id
      ORDER BY lt.request_date DESC
    `

    // Ensure we always return an array
    const labTestsArray = Array.isArray(labTests) ? labTests : []
    return NextResponse.json(labTestsArray)
  } catch (error) {
    console.error("Error fetching lab tests:", error)
    return NextResponse.json([], { status: 500 }) // Return empty array on error
  }
}
