import { sql } from "@/lib/db"
import { generateId } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Generate a unique invoice ID
    const invoiceId = generateId("INV")

    // Start a transaction
    await sql`BEGIN`

    // Insert the invoice into the database
    const invoiceResult = await sql`
      INSERT INTO invoices (
        invoice_id,
        patient_id,
        date,
        due_date,
        amount,
        status
      ) VALUES (
        ${invoiceId},
        ${Number.parseInt(data.patientId)},
        ${data.date},
        ${data.dueDate},
        ${data.totalAmount},
        'Pending'
      )
      RETURNING id
    `

    const invoiceId_db = invoiceResult[0].id

    // Insert each invoice item
    for (const item of data.items) {
      await sql`
        INSERT INTO invoice_items (
          invoice_id,
          description,
          amount
        ) VALUES (
          ${invoiceId_db},
          ${item.description},
          ${item.amount}
        )
      `
    }

    // Commit the transaction
    await sql`COMMIT`

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoiceId_db,
        invoice_id: invoiceId,
      },
    })
  } catch (error) {
    // Rollback the transaction in case of error
    await sql`ROLLBACK`

    console.error("Error adding invoice:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add invoice",
      },
      { status: 500 },
    )
  }
}
