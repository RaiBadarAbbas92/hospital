import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

type Appointment = {
  id: number
  appointment_id: string
  patient_name: string
  patient_id: string
  doctor_name: string
  department: string
  date: string
  time: string
  type: string
  status: string
}

export async function GET() {
  try {
    const appointments = await sql`
      SELECT 
        a.id, 
        a.appointment_id, 
        p.first_name || ' ' || p.last_name as patient_name,
        p.patient_id as patient_id,
        u.name as doctor_name,
        d.name as department,
        a.date,
        a.time,
        a.type,
        a.status
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN users u ON a.doctor_id = u.id
      LEFT JOIN departments d ON a.department_id = d.id
      ORDER BY a.date DESC, a.time DESC
    ` as Appointment[]

    return NextResponse.json(appointments)
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
