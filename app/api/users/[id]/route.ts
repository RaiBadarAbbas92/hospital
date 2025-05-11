import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await sql`
      SELECT 
        u.*,
        d.name as department_name,
        json_agg(
          json_build_object(
            'id', a.id,
            'appointment_id', a.appointment_id,
            'date', a.date,
            'time', a.time,
            'type', a.type,
            'status', a.status,
            'patient_name', p.first_name || ' ' || p.last_name as patient_name
          )
        ) as appointments,
        json_agg(
          json_build_object(
            'id', l.id,
            'test_id', l.test_id,
            'test_name', l.test_name,
            'request_date', l.request_date,
            'status', l.status
          )
        ) as lab_tests
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      LEFT JOIN appointments a ON u.id = a.doctor_id
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN lab_tests l ON u.id = l.requested_by
      WHERE u.id = ${params.id}
      GROUP BY u.id, d.name
    `

    if (!user[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user[0])
  } catch (error) {
    console.error("Error fetching user details:", error)
    return NextResponse.json(
      { error: "Failed to fetch user details" },
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
    const { name, email, role, department_id, status } = body

    const updatedUser = await sql`
      UPDATE users
      SET 
        name = ${name},
        email = ${email},
        role = ${role},
        department_id = ${department_id},
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!updatedUser[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(updatedUser[0])
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const updatedUser = await sql`
      UPDATE users
      SET 
        password = ${hashedPassword},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING id, name, email, role
    `

    if (!updatedUser[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(updatedUser[0])
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
} 