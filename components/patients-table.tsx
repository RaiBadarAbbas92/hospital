"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Patient {
  id: number
  patient_id: string
  name: string
  age: number
  gender: string
  contact: string
  status: string
}

export function PatientsTable() {
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPatients() {
      try {
        const response = await fetch("/api/patients")
        const data = await response.json()
        setPatients(data)
      } catch (error) {
        console.error("Error fetching patients:", error)
        toast.error("Failed to load patients")
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = async (patientId: number) => {
    try {
      const response = await fetch(`/api/patients/${patientId}`)
      if (!response.ok) throw new Error("Failed to fetch patient details")
      const data = await response.json()
      // TODO: Show patient details in a modal or navigate to details page
      console.log("Patient details:", data)
    } catch (error) {
      console.error("Error fetching patient details:", error)
      toast.error("Failed to load patient details")
    }
  }

  const handleEditPatient = (patientId: number) => {
    router.push(`/dashboard/patients/${patientId}/edit`)
  }

  const handleMedicalHistory = (patientId: number) => {
    router.push(`/dashboard/patients/${patientId}/history`)
  }

  const handleCreateAppointment = (patientId: number) => {
    router.push(`/dashboard/appointments/new?patientId=${patientId}`)
  }

  const handleCreateInvoice = (patientId: number) => {
    router.push(`/dashboard/billing/new?patientId=${patientId}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]">Loading patients...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.patient_id}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.age}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{patient.contact}</TableCell>
                <TableCell>
                  <Badge variant={patient.status === "Admitted" ? "default" : "secondary"}>{patient.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(patient.id)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditPatient(patient.id)}>
                        Edit patient
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMedicalHistory(patient.id)}>
                        Medical history
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCreateAppointment(patient.id)}>
                        Create appointment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateInvoice(patient.id)}>
                        Create invoice
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
