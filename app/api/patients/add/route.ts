import { sql } from "@/lib/db"
import { generateId } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Generate a unique patient ID
    const patientId = generateId("P")

    // Insert the patient into the database
    const result = await sql`
      INSERT INTO patients (
        patient_id, 
        first_name, 
        last_name, 
        date_of_birth, 
        gender, 
        address, 
        contact, 
        email, 
        emergency_contact, 
        blood_group, 
        allergies, 
        medical_history,
        status
      ) VALUES (
        ${patientId},
        ${data.firstName},
        ${data.lastName},
        ${data.dateOfBirth},
        ${data.gender},
        ${data.address},
        ${data.contact},
        ${data.email || null},
        ${data.emergencyContact},
        ${data.bloodGroup || null},
        ${data.allergies || null},
        ${data.hasMedicalHistory ? data.medicalHistory : null},
        'Admitted'
      )
      RETURNING id, patient_id
    `

    return NextResponse.json({
      success: true,
      patient: result[0],
    })
  } catch (error) {
    console.error("Error adding patient:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add patient",
      },
      { status: 500 },
    )
  }
}
