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

interface Appointment {
  id: number
  patient_name: string
  doctor_name: string
  department_name: string
  appointment_date: string
  appointment_time: string
  type: string
  status: string
}

export function AppointmentsTable() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const response = await fetch("/api/appointments")
        const data = await response.json()
        setAppointments(data)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        toast.error("Failed to load appointments")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.department_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = async (appointmentId: number) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`)
      if (!response.ok) throw new Error("Failed to fetch appointment details")
      const data = await response.json()
      // TODO: Show appointment details in a modal or navigate to details page
      console.log("Appointment details:", data)
    } catch (error) {
      console.error("Error fetching appointment details:", error)
      toast.error("Failed to load appointment details")
    }
  }

  const handleEditAppointment = (appointmentId: number) => {
    router.push(`/dashboard/appointments/${appointmentId}/edit`)
  }

  const handleCreateLabTest = (appointmentId: number) => {
    router.push(`/dashboard/lab-tests/new?appointmentId=${appointmentId}`)
  }

  const handleCreateInvoice = (appointmentId: number) => {
    router.push(`/dashboard/billing/new?appointmentId=${appointmentId}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]">Loading appointments...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search appointments..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>{appointment.patient_name}</TableCell>
                <TableCell>{appointment.doctor_name}</TableCell>
                <TableCell>{appointment.department_name}</TableCell>
                <TableCell>{appointment.appointment_date}</TableCell>
                <TableCell>{appointment.appointment_time}</TableCell>
                <TableCell>{appointment.type}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      appointment.status === "Completed"
                        ? "default"
                        : appointment.status === "Cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {appointment.status}
                  </Badge>
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
                      <DropdownMenuItem onClick={() => handleViewDetails(appointment.id)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditAppointment(appointment.id)}>
                        Edit appointment
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCreateLabTest(appointment.id)}>
                        Create lab test
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateInvoice(appointment.id)}>
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
