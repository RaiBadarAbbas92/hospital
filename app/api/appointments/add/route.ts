import { sql } from "@/lib/db"
import { generateId } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Received appointment data:", data)

    // Validate IDs
    const patientId = Number(data.patientId)
    const doctorId = Number(data.doctorId)
    const departmentId = Number(data.departmentId)

    console.log("Parsed IDs:", { patientId, doctorId, departmentId })

    if (isNaN(patientId) || isNaN(doctorId) || isNaN(departmentId)) {
      console.log("Invalid IDs detected:", { patientId, doctorId, departmentId })
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID values provided",
        },
        { status: 400 },
      )
    }

    // Generate a unique appointment ID
    const appointmentId = generateId("APT")

    // Insert the appointment into the database
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
    `

    return NextResponse.json({
      success: true,
      appointment: result[0],
    })
  } catch (error) {
    console.error("Error adding appointment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add appointment",
      },
      { status: 500 },
    )
  }
}
