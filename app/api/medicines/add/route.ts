import { sql } from "@/lib/db"
import { generateId } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Generate a unique medicine ID
    const medicineId = generateId("MED")

    // Determine status based on quantity
    const status = data.quantity < 100 ? "Low Stock" : "In Stock"

    // Insert the medicine into the database
    const result = await sql`
      INSERT INTO medicines (
        medicine_id,
        name,
        category,
        supplier,
        quantity,
        unit,
        expiry_date,
        status
      ) VALUES (
        ${medicineId},
        ${data.name},
        ${data.category},
        ${data.supplier},
        ${data.quantity},
        ${data.unit},
        ${data.expiryDate},
        ${status}
      )
      RETURNING id, medicine_id
    `

    return NextResponse.json({
      success: true,
      medicine: result[0],
    })
  } catch (error) {
    console.error("Error adding medicine:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add medicine",
      },
      { status: 500 },
    )
  }
}
