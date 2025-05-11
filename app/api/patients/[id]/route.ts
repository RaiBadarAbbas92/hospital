import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const patient = await sql`
      SELECT 
        p.*,
        json_agg(
          json_build_object(
            'id', a.id,
            'appointment_id', a.appointment_id,
            'date', a.date,
            'time', a.time,
            'type', a.type,
            'status', a.status,
            'doctor_name', u.name as doctor_name,
            'department', d.name as department
          )
        ) as appointments,
        json_agg(
          json_build_object(
            'id', l.id,
            'test_id', l.test_id,
            'test_name', l.test_name,
            'request_date', l.request_date,
            'status', l.status,
            'result', l.result
          )
        ) as lab_tests,
        json_agg(
          json_build_object(
            'id', i.id,
            'invoice_id', i.invoice_id,
            'date', i.date,
            'amount', i.amount,
            'status', i.status
          )
        ) as invoices
      FROM patients p
      LEFT JOIN appointments a ON p.id = a.patient_id
      LEFT JOIN users u ON a.doctor_id = u.id
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN lab_tests l ON p.id = l.patient_id
      LEFT JOIN invoices i ON p.id = i.patient_id
      WHERE p.id = ${params.id}
      GROUP BY p.id
    `

    if (!patient[0]) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(patient[0])
  } catch (error) {
    console.error("Error fetching patient details:", error)
    return NextResponse.json(
      { error: "Failed to fetch patient details" },
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
    const { first_name, last_name, date_of_birth, gender, address, contact, email, emergency_contact, blood_group, allergies, medical_history, status } = body

    const result = await sql`
      UPDATE patients
      SET 
        first_name = ${first_name},
        last_name = ${last_name},
        date_of_birth = ${date_of_birth},
        gender = ${gender},
        address = ${address},
        contact = ${contact},
        email = ${email},
        emergency_contact = ${emergency_contact},
        blood_group = ${blood_group},
        allergies = ${allergies},
        medical_history = ${medical_history},
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!result[0]) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json(
      { error: "Failed to update patient" },
      { status: 500 }
    )
  }
} 