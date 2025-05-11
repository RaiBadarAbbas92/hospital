import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const medicine = await sql`
      SELECT 
        m.*,
        json_agg(
          json_build_object(
            'id', p.id,
            'purchase_id', p.purchase_id,
            'quantity', p.quantity,
            'purchase_date', p.purchase_date,
            'amount', p.amount,
            'status', p.status
          )
        ) as purchases,
        json_agg(
          json_build_object(
            'id', s.id,
            'sale_id', s.sale_id,
            'quantity', s.quantity,
            'sale_date', s.sale_date,
            'amount', s.amount,
            'patient_name', p.first_name || ' ' || p.last_name as patient_name
          )
        ) as sales
      FROM medicines m
      LEFT JOIN medicine_purchases p ON m.id = p.medicine_id
      LEFT JOIN medicine_sales s ON m.id = s.medicine_id
      LEFT JOIN patients p ON s.patient_id = p.id
      WHERE m.id = ${params.id}
      GROUP BY m.id
    `

    if (!medicine[0]) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json(medicine[0])
  } catch (error) {
    console.error("Error fetching medicine details:", error)
    return NextResponse.json(
      { error: "Failed to fetch medicine details" },
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
    const { quantity, status } = body

    const result = await sql`
      UPDATE medicines
      SET 
        quantity = ${quantity},
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!result[0]) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating medicine:", error)
    return NextResponse.json(
      { error: "Failed to update medicine" },
      { status: 500 }
    )
  }
} 