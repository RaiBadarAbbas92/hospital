import { sql } from "@/lib/db"
import { generateId } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Generate a unique test ID
    const testId = generateId("LAB")

    // Insert the lab test into the database
    const result = await sql`
      INSERT INTO lab_tests (
        test_id,
        patient_id,
        test_name,
        requested_by,
        request_date,
        status,
        priority,
        result
      ) VALUES (
        ${testId},
        ${Number.parseInt(data.patientId)},
        ${data.testName},
        ${Number.parseInt(data.requestedBy)},
        ${data.requestDate},
        'Pending',
        ${data.priority},
        ${null}
      )
      RETURNING id, test_id
    `

    return NextResponse.json({
      success: true,
      labTest: result[0],
    })
  } catch (error) {
    console.error("Error adding lab test:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add lab test",
      },
      { status: 500 },
    )
  }
}
