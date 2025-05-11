import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { createTables } from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create a SQL client with the connection string from environment variables
export const sql = neon(process.env.DATABASE_URL)

// Create a drizzle client
export const db = drizzle(sql)

// Initialize database tables
createTables().catch((error) => {
  console.error("Error initializing database tables:", error)
})

// Helper function to generate unique IDs
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")
  return `${prefix}-${timestamp}${random}`
}
