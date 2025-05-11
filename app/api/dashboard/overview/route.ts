import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const overview = await sql`
      WITH months AS (
        SELECT generate_series(1, 7) AS month_num
      ),
      admissions AS (
        SELECT 
          EXTRACT(MONTH FROM created_at) AS month,
          COUNT(*) AS count
        FROM patients
        WHERE created_at >= CURRENT_DATE - INTERVAL '7 months'
        GROUP BY EXTRACT(MONTH FROM created_at)
      ),
      discharges AS (
        SELECT 
          EXTRACT(MONTH FROM updated_at) AS month,
          COUNT(*) AS count
        FROM patients
        WHERE status = 'Discharged' AND updated_at >= CURRENT_DATE - INTERVAL '7 months'
        GROUP BY EXTRACT(MONTH FROM updated_at)
      )
      SELECT 
        TO_CHAR(TO_DATE(m.month_num::text, 'MM'), 'Mon') AS name,
        COALESCE(a.count, 0) AS admissions,
        COALESCE(d.count, 0) AS discharges
      FROM months m
      LEFT JOIN admissions a ON m.month_num = a.month
      LEFT JOIN discharges d ON m.month_num = d.month
      ORDER BY m.month_num
    `

    return NextResponse.json(overview)
  } catch (error) {
    console.error("Error fetching overview data:", error)
    return NextResponse.json({ error: "Failed to fetch overview data" }, { status: 500 })
  }
}
