import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
  }

  try {
    const result = await sql`
      SELECT 
        a.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.patient_id,
        u.name as doctor_name,
        d.name as department_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE a.appointment_id = ${params.id}
      LIMIT 1
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!params.id) {
    return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { date, time, type, status, notes } = body

    if (!date || !time || !type || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE appointments
      SET 
        date = ${date},
        time = ${time},
        type = ${type},
        status = ${status},
        notes = ${notes || null},
        updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = ${params.id}
      RETURNING *
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 