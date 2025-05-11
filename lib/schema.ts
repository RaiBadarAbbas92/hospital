import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function createTables() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS users (
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

    await sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name = 'department_id'
        ) THEN
          ALTER TABLE users ADD COLUMN department_id INTEGER REFERENCES departments(id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'users' 
          AND column_name = 'status'
        ) THEN
          ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'Active';
        END IF;
      END $$;
    `

    await sql`
      CREATE TABLE IF NOT EXISTS medicines (
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

    await sql`
      CREATE TABLE IF NOT EXISTS medicine_purchases (
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

    await sql`
      CREATE TABLE IF NOT EXISTS medicine_sales (
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

    await sql`
      CREATE TABLE IF NOT EXISTS patients (
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

    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
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

    await sql`
      CREATE TABLE IF NOT EXISTS lab_tests (
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

    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_id VARCHAR(20) UNIQUE NOT NULL,
        patient_id INTEGER REFERENCES patients(id),
        date DATE NOT NULL,
        due_date DATE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES invoices(id),
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Insert default departments if they don't exist
    await sql`
      INSERT INTO departments (name, description)
      SELECT 'Cardiology', 'Heart and cardiovascular care'
      WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Cardiology')
    `

    await sql`
      INSERT INTO departments (name, description)
      SELECT 'Neurology', 'Brain and nervous system care'
      WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Neurology')
    `

    await sql`
      INSERT INTO departments (name, description)
      SELECT 'Orthopedics', 'Bone and joint care'
      WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Orthopedics')
    `

    await sql`
      INSERT INTO departments (name, description)
      SELECT 'Pediatrics', 'Child healthcare'
      WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Pediatrics')
    `

    await sql`
      INSERT INTO departments (name, description)
      SELECT 'Gynecology', 'Women''s health care'
      WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Gynecology')
    `

    // Insert default doctors if none exist
    const hasDoctors = await sql`
      SELECT EXISTS (
        SELECT 1 FROM users WHERE role = 'Doctor'
      ) as has_doctors
    `

    if (!hasDoctors[0].has_doctors) {
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
    }

    // Insert default patient if none exists
    const hasPatients = await sql`
      SELECT EXISTS (
        SELECT 1 FROM patients
      ) as has_patients
    `

    if (!hasPatients[0].has_patients) {
      await sql`
        INSERT INTO patients (
          patient_id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          address,
          contact,
          email,
          emergency_contact,
          status
        ) VALUES (
          'P-001',
          'Jane',
          'Doe',
          '1990-01-01',
          'Female',
          '123 Main St',
          '1234567890',
          'jane.doe@example.com',
          '9876543210',
          'Admitted'
        )
      `
    }

    console.log("Database tables created successfully")
  } catch (error) {
    console.error("Error creating database tables:", error)
    throw error
  }
} 