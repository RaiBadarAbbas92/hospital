import { sql } from "@/lib/db"
import { generateId } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

type AppointmentInput = {
  patientId: string | number
  doctorId: string | number
  departmentId: string | number
  date: string
  time: string
  type: string
  notes?: string
}

type AppointmentResponse = {
  id: number
  appointment_id: string
}

export async function POST(request: Request) {
  try {
    const data = await request.json() as AppointmentInput

    // Validate required fields
    if (!data.patientId || !data.doctorId || !data.departmentId || !data.date || !data.time || !data.type) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Convert IDs to numbers
    const patientId = Number(data.patientId)
    const doctorId = Number(data.doctorId)
    const departmentId = Number(data.departmentId)

    // Validate numeric IDs
    if (isNaN(patientId) || isNaN(doctorId) || isNaN(departmentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID values" },
        { status: 400 }
      )
    }

    // Generate appointment ID
    const appointmentId = generateId("APT")

    // Insert appointment
    const result = await sql`
      INSERT INTO appointments (
        appointment_id,
        patient_id,
        doctor_id,
        department_id,
        date,
        time,
        type,
        notes,
        status
      ) VALUES (
        ${appointmentId},
        ${patientId},
        ${doctorId},
        ${departmentId},
        ${data.date},
        ${data.time},
        ${data.type},
        ${data.notes || null},
        'Scheduled'
      )
      RETURNING id, appointment_id
    ` as AppointmentResponse[]

    if (!result?.[0]) {
      return NextResponse.json(
        { success: false, error: "Failed to create appointment" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      appointment: result[0]
    })
  } catch (error) {
    console.error("Error adding appointment:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
