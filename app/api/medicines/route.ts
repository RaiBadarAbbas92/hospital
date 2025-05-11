import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "stock"

  try {
    let medicines

    if (type === "stock") {
      medicines = await sql`
        SELECT * FROM medicines
        ORDER BY id DESC
      `
    } else if (type === "purchases") {
      medicines = await sql`
        SELECT 
          mp.id,
          mp.purchase_id,
          m.medicine_id,
          m.name as medicine_name,
          mp.supplier,
          mp.quantity,
          mp.unit,
          mp.purchase_date,
          mp.amount,
          mp.status
        FROM medicine_purchases mp
        JOIN medicines m ON mp.medicine_id = m.id
        ORDER BY mp.purchase_date DESC
      `
    } else if (type === "sales") {
      medicines = await sql`
        SELECT 
          ms.id,
          ms.sale_id,
          m.medicine_id,
          m.name as medicine_name,
          p.patient_id,
          p.first_name || ' ' || p.last_name as patient_name,
          ms.quantity,
          ms.unit,
          ms.sale_date,
          ms.amount
        FROM medicine_sales ms
        JOIN medicines m ON ms.medicine_id = m.id
        JOIN patients p ON ms.patient_id = p.id
        ORDER BY ms.sale_date DESC
      `
    }

    // Ensure medicines is always an array
    const medicinesArray = Array.isArray(medicines) ? medicines : []
    return NextResponse.json(medicinesArray)
  } catch (error) {
    console.error(`Error fetching medicines (${type}):`, error)
    return NextResponse.json({ error: `Failed to fetch medicines (${type})` }, { status: 500 })
  }
}
