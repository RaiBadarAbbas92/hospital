import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import { User } from "@/lib/types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface User {
  id: number
  name: string
  email: string
  role: string
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return null
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return payload as User
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}
