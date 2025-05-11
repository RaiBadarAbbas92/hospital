import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    const hashedPassword = await bcrypt.hash("doctor123", 10)
    
    // Get department IDs
    const departments = await sql`
      SELECT id, name FROM departments
    `

    const departmentMap = departments.reduce((acc: any, dept: any) => {
      acc[dept.name] = dept.id
      return acc
    }, {})

    // Insert multiple doctors
    await sql`
      INSERT INTO users (
        name,
        email,
        password,
        role,
        department_id,
        status
      ) VALUES 
      ('Dr. John Smith', 'doctor1@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Cardiology']}, 'Active'),
      ('Dr. Sarah Johnson', 'doctor2@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Neurology']}, 'Active'),
      ('Dr. Michael Brown', 'doctor3@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Orthopedics']}, 'Active'),
      ('Dr. Emily Davis', 'doctor4@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Pediatrics']}, 'Active'),
      ('Dr. Robert Wilson', 'doctor5@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Gynecology']}, 'Active'),
      ('Dr. James Anderson', 'doctor6@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Cardiology']}, 'Active'),
      ('Dr. Lisa Martinez', 'doctor7@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Neurology']}, 'Active'),
      ('Dr. David Thompson', 'doctor8@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Orthopedics']}, 'Active'),
      ('Dr. Maria Garcia', 'doctor9@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Pediatrics']}, 'Active'),
      ('Dr. William Lee', 'doctor10@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Gynecology']}, 'Active'),
      ('Dr. Jennifer White', 'doctor11@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Cardiology']}, 'Active'),
      ('Dr. Thomas Clark', 'doctor12@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Neurology']}, 'Active'),
      ('Dr. Patricia Moore', 'doctor13@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Orthopedics']}, 'Active'),
      ('Dr. Richard Taylor', 'doctor14@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Pediatrics']}, 'Active'),
      ('Dr. Susan Hall', 'doctor15@hospital.com', ${hashedPassword}, 'Doctor', ${departmentMap['Gynecology']}, 'Active')
    `

    return NextResponse.json({ success: true, message: "Doctors added successfully" })
  } catch (error) {
    console.error("Error adding doctors:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add doctors" },
      { status: 500 }
    )
  }
} 