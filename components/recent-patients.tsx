"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Patient {
  id: number
  patient_id: string
  name: string
  date_admitted: string
  status: string
}

export function RecentPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentPatients() {
      try {
        const response = await fetch("/api/dashboard/recent-patients")
        const data = await response.json()
        setPatients(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching recent patients:", error)
        setPatients([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecentPatients()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-[200px]">Loading recent patients...</div>
  }

  if (patients.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No recent patients found
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {patients.map((patient) => (
        <div key={patient.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{patient.name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(patient.date_admitted).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto">
            <Badge variant={patient.status === "Admitted" ? "default" : "secondary"}>{patient.status}</Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
