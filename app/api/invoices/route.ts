import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const invoices = await sql`
      SELECT 
        i.id, 
        i.invoice_id, 
        p.patient_id,
        p.first_name || ' ' || p.last_name as patient_name,
        i.date,
        i.due_date,
        CAST(i.amount AS FLOAT) as amount,
        i.status
      FROM invoices i
      JOIN patients p ON i.patient_id = p.id
      ORDER BY i.date DESC
    `

    // Ensure we always return an array
    const invoicesArray = Array.isArray(invoices) ? invoices : []
    return NextResponse.json(invoicesArray)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json([], { status: 500 }) // Return empty array on error
  }
}
