import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { createTables } from "./schema"

// Check for DATABASE_URL with a more detailed error message
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set. Please check your .env.local file and make sure it's being loaded correctly.")
  console.error("If you're building the application, make sure the environment variables are properly configured in next.config.mjs.")

  // Use a fallback for development purposes only
  if (process.env.NODE_ENV === 'development') {
    console.warn("Using fallback DATABASE_URL for development. This should not be used in production.")
    process.env.DATABASE_URL = "postgresql://neondb_owner:npg_onlcg5WSZeB6@ep-dark-cake-a4lphxbt-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
  } else {
    throw new Error("DATABASE_URL environment variable is not set")
  }
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
