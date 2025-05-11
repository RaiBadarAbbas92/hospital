import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await sql`
      SELECT 
        i.*,
        p.first_name as patient_first_name,
        p.last_name as patient_last_name,
        p.patient_id,
        json_agg(
          json_build_object(
            'id', ii.id,
            'description', ii.description,
            'amount', ii.amount
          )
        ) as items
      FROM invoices i
      JOIN patients p ON i.patient_id = p.id
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      WHERE i.invoice_id = ${params.id}
      GROUP BY i.id, p.first_name, p.last_name, p.patient_id
    `

    if (!invoice[0]) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice[0])
  } catch (error) {
    console.error("Error fetching invoice details:", error)
    return NextResponse.json(
      { error: "Failed to fetch invoice details" },
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
    const { status, notes } = body

    const updatedInvoice = await sql`
      UPDATE invoices
      SET 
        status = ${status},
        notes = ${notes},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!updatedInvoice[0]) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(updatedInvoice[0])
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    )
  }
} 