import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // First check if the required columns exist
    const tableInfo = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `
    
    const hasStatusColumn = tableInfo.some((col: any) => col.column_name === 'status')
    const hasDepartmentIdColumn = tableInfo.some((col: any) => col.column_name === 'department_id')

    if (!hasDepartmentIdColumn) {
      return NextResponse.json(
        { error: "Database schema is missing required columns" },
        { status: 500 }
      )
    }

    // Modify query based on available columns
    const doctors = await sql`
      SELECT 
        u.id, 
        u.name,
        u.role,
        u.department_id,
        d.name as department
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      WHERE u.role = 'Doctor'
      ${hasStatusColumn ? sql`AND u.status = 'Active'` : sql``}
      ORDER BY u.name
    `

    return NextResponse.json(doctors)
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return NextResponse.json(
      { error: "Failed to fetch doctors", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
