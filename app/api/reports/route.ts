import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const department = searchParams.get("department")

    // Base date filter for each table
    const patientDateFilter = from && to ? sql`AND created_at BETWEEN ${from} AND ${to}` : sql``
    const appointmentDateFilter = from && to ? sql`AND date BETWEEN ${from} AND ${to}` : sql``
    const invoiceDateFilter = from && to ? sql`AND date BETWEEN ${from} AND ${to}` : sql``
    const deptFilter = department && department !== "all" ? sql`AND d.name = ${department}` : sql``

    // Get patient statistics
    const patientStats = await sql`
      SELECT 
        COUNT(*) as total_patients,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_patients,
        COUNT(CASE WHEN status = 'Admitted' THEN 1 END) as admitted,
        COUNT(CASE WHEN status = 'Discharged' THEN 1 END) as discharged
      FROM patients
      WHERE 1=1 ${patientDateFilter}
    `

    // Get appointment statistics
    const appointmentStats = await sql`
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled,
        COUNT(CASE WHEN status = 'No-show' THEN 1 END) as no_shows
      FROM appointments
      WHERE 1=1 ${appointmentDateFilter}
    `

    // Get revenue statistics
    const revenueStats = await sql`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN status = 'Pending' THEN amount ELSE 0 END), 0) as outstanding,
        COALESCE(AVG(amount), 0) as avg_bill,
        (
          SELECT COALESCE(SUM(amount), 0)
          FROM medicine_purchases
          WHERE 1=1 ${invoiceDateFilter}
        ) as expenses
      FROM invoices
      WHERE 1=1 ${invoiceDateFilter}
    `

    // Get medicine statistics
    const medicineStats = await sql`
      SELECT 
        COALESCE(SUM(quantity * (
          SELECT amount FROM medicine_purchases mp 
          WHERE mp.medicine_id = m.id 
          ORDER BY purchase_date DESC 
          LIMIT 1
        )), 0) as total_stock_value,
        COUNT(CASE WHEN quantity < 10 THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN expiry_date < CURRENT_DATE THEN 1 END) as expired_items,
        (
          SELECT COALESCE(SUM(amount), 0)
          FROM medicine_sales
          WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days'
        ) as monthly_usage
      FROM medicines m
    `

    // Get patient admissions over time
    const patientAdmissions = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count
      FROM patients
      WHERE 1=1 ${patientDateFilter}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `

    // Get appointments by department
    const appointmentsByDept = await sql`
      SELECT 
        d.name as department,
        COUNT(*) as count
      FROM appointments a
      JOIN departments d ON a.department_id = d.id
      WHERE 1=1 ${appointmentDateFilter} ${deptFilter}
      GROUP BY d.name
    `

    // Get revenue by department
    const revenueByDept = await sql`
      SELECT 
        d.name as department,
        COALESCE(SUM(i.amount), 0) as amount
      FROM appointments a
      JOIN departments d ON a.department_id = d.id
      JOIN invoices i ON i.patient_id = a.patient_id
      WHERE 1=1 ${invoiceDateFilter} ${deptFilter}
      GROUP BY d.name
    `

    // Get medicine consumption by category
    const medicineConsumption = await sql`
      SELECT 
        category,
        COUNT(*) as count
      FROM medicines
      GROUP BY category
    `

    return NextResponse.json({
      patients: {
        total: patientStats[0].total_patients,
        new: patientStats[0].new_patients,
        admitted: patientStats[0].admitted,
        discharged: patientStats[0].discharged,
      },
      appointments: {
        total: appointmentStats[0].total_appointments,
        completed: appointmentStats[0].completed,
        cancelled: appointmentStats[0].cancelled,
        noShow: appointmentStats[0].no_shows,
      },
      revenue: {
        total: revenueStats[0].total_revenue,
        outstanding: revenueStats[0].outstanding,
        averageBill: revenueStats[0].avg_bill,
        expenses: revenueStats[0].expenses,
      },
      medicine: {
        totalStockValue: medicineStats[0].total_stock_value,
        lowStockItems: medicineStats[0].low_stock_items,
        expiredItems: medicineStats[0].expired_items,
        monthlyUsage: medicineStats[0].monthly_usage,
      },
      patientAdmissions: patientAdmissions,
      appointmentsByDepartment: appointmentsByDept,
      revenueByDepartment: revenueByDept,
      medicineByCategory: medicineConsumption,
    })
  } catch (error) {
    console.error("Error fetching report data:", error)
    return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 })
  }
} 