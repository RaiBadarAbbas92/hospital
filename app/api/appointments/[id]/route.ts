import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

type AppointmentResponse = {
  id: number
  appointment_id: string
  patient_id: number
  doctor_id: number
  department_id: number
  date: string
  time: string
  type: string
  status: string
  notes: string | null
  patient_first_name: string
  patient_last_name: string
  doctor_name: string
  department_name: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!params.id) {
    return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
  }

  try {
    const result = await sql`
      SELECT 
        a.id,
        a.appointment_id,
        a.patient_id,
        a.doctor_id,
        a.department_id,
        a.date,
        a.time,
        a.type,
        a.status,
        a.notes,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        u.name as doctor_name,
        d.name as department_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      LEFT JOIN departments d ON a.department_id = d.id
      WHERE a.appointment_id = ${params.id}
      LIMIT 1
    ` as AppointmentResponse[]

    if (!result?.[0]) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

type UpdateAppointmentBody = {
  date: string
  time: string
  type: string
  status: string
  notes?: string
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  if (!params.id) {
    return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
  }

  try {
    const body = await request.json() as UpdateAppointmentBody
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
    ` as AppointmentResponse[]

    if (!result?.[0]) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 