import { sql } from "@/lib/db"

async function fixDatabase() {
  try {
    // Drop all tables in the correct order
    console.log("Dropping existing tables...")
    await sql`DROP TABLE IF EXISTS medicine_sales CASCADE`
    await sql`DROP TABLE IF EXISTS medicine_purchases CASCADE`
    await sql`DROP TABLE IF EXISTS medicines CASCADE`
    await sql`DROP TABLE IF EXISTS appointments CASCADE`
    await sql`DROP TABLE IF EXISTS patients CASCADE`
    await sql`DROP TABLE IF EXISTS users CASCADE`
    await sql`DROP TABLE IF EXISTS departments CASCADE`

    console.log("Creating tables...")
    
    // Create departments table
    await sql`
      CREATE TABLE departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create users table
    await sql`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        department_id INTEGER REFERENCES departments(id),
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP WITH TIME ZONE
      )
    `

    // Create patients table
    await sql`
      CREATE TABLE patients (
        id SERIAL PRIMARY KEY,
        patient_id VARCHAR(20) UNIQUE NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(10) NOT NULL,
        address TEXT,
        contact VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        emergency_contact VARCHAR(20),
        blood_group VARCHAR(5),
        allergies TEXT,
        medical_history TEXT,
        status VARCHAR(20) DEFAULT 'Admitted',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create medicines table
    await sql`
      CREATE TABLE medicines (
        id SERIAL PRIMARY KEY,
        medicine_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        supplier VARCHAR(255),
        quantity INTEGER NOT NULL DEFAULT 0,
        unit VARCHAR(50) NOT NULL,
        expiry_date DATE,
        status VARCHAR(20) DEFAULT 'In Stock',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create medicine purchases table
    await sql`
      CREATE TABLE medicine_purchases (
        id SERIAL PRIMARY KEY,
        purchase_id VARCHAR(20) UNIQUE NOT NULL,
        medicine_id INTEGER REFERENCES medicines(id),
        supplier VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit VARCHAR(50) NOT NULL,
        purchase_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create medicine sales table
    await sql`
      CREATE TABLE medicine_sales (
        id SERIAL PRIMARY KEY,
        sale_id VARCHAR(20) UNIQUE NOT NULL,
        medicine_id INTEGER REFERENCES medicines(id),
        patient_id INTEGER REFERENCES patients(id),
        quantity INTEGER NOT NULL,
        unit VARCHAR(50) NOT NULL,
        sale_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create appointments table
    await sql`
      CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        appointment_id VARCHAR(20) UNIQUE NOT NULL,
        patient_id INTEGER REFERENCES patients(id),
        doctor_id INTEGER REFERENCES users(id),
        department_id INTEGER REFERENCES departments(id),
        date DATE NOT NULL,
        time TIME NOT NULL,
        type VARCHAR(50) NOT NULL,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'Scheduled',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create lab tests table
    await sql`
      CREATE TABLE lab_tests (
        id SERIAL PRIMARY KEY,
        test_id VARCHAR(20) UNIQUE NOT NULL,
        patient_id INTEGER REFERENCES patients(id),
        test_name VARCHAR(255) NOT NULL,
        requested_by INTEGER REFERENCES users(id),
        request_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        priority VARCHAR(20) DEFAULT 'Normal',
        notes TEXT,
        result TEXT,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("Database schema fixed successfully!")
  } catch (error) {
    console.error("Error fixing database:", error)
    throw error
  }
}

// Run the fix
fixDatabase().catch(console.error) 