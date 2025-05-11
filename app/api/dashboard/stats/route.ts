import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [patientCount, todayAppointments, activeStaff, todayLabTests] = await Promise.all([
      sql`SELECT COUNT(*) FROM patients`,
      sql`SELECT COUNT(*) FROM appointments WHERE date = CURRENT_DATE`,
      sql`SELECT COUNT(*) FROM users WHERE status = 'Active'`,
      sql`SELECT COUNT(*) FROM lab_tests WHERE request_date = CURRENT_DATE`,
    ])

    return NextResponse.json({
      patientCount: patientCount[0].count,
      todayAppointments: todayAppointments[0].count,
      activeStaff: activeStaff[0].count,
      todayLabTests: todayLabTests[0].count,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
