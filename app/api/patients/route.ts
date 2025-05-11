import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const patients = await sql`
      SELECT 
        id, 
        patient_id, 
        first_name || ' ' || last_name as name, 
        date_of_birth, 
        gender, 
        contact, 
        status,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) as age
      FROM patients
      ORDER BY id DESC
    `

    return NextResponse.json(patients)
  } catch (error) {
    console.error("Error fetching patients:", error)
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 })
  }
}
