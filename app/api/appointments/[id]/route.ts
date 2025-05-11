import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const appointment = await sql`
      SELECT 
        a.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.patient_id,
        u.name as doctor_name,
        d.name as department_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u ON a.doctor_id = u.id
      JOIN departments d ON a.department_id = d.id
      WHERE a.id = ${params.id}
    `

    if (!appointment[0]) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(appointment[0])
  } catch (error) {
    console.error("Error fetching appointment details:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointment details" },
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
    const { date, time, type, status, notes } = body

    const result = await sql`
      UPDATE appointments
      SET 
        date = ${date},
        time = ${time},
        type = ${type},
        status = ${status},
        notes = ${notes},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!result[0]) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    )
  }
} 