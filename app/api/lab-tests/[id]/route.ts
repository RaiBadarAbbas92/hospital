import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const test = await sql`
      SELECT 
        l.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.patient_id,
        u.name as requested_by_name
      FROM lab_tests l
      JOIN patients p ON l.patient_id = p.id
      JOIN users u ON l.requested_by = u.id
      WHERE l.id = ${params.id}
    `

    if (!test[0]) {
      return NextResponse.json({ error: "Lab test not found" }, { status: 404 })
    }

    return NextResponse.json(test[0])
  } catch (error) {
    console.error("Error fetching lab test details:", error)
    return NextResponse.json(
      { error: "Failed to fetch lab test details" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, result: testResult, notes } = body

    const updatedTest = await sql`
      UPDATE lab_tests
      SET 
        status = ${status},
        result = ${testResult},
        notes = ${notes},
        completed_at = CASE 
          WHEN ${status} = 'Completed' THEN CURRENT_TIMESTAMP 
          ELSE completed_at 
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!updatedTest[0]) {
      return NextResponse.json({ error: "Lab test not found" }, { status: 404 })
    }

    return NextResponse.json(updatedTest[0])
  } catch (error) {
    console.error("Error updating lab test:", error)
    return NextResponse.json(
      { error: "Failed to update lab test" },
      { status: 500 }
    )
  }
} 