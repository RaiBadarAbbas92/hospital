"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"

const formSchema = z.object({
  patientId: z.string({
    required_error: "Please select a patient",
  }),
  doctorId: z.string({
    required_error: "Please select a doctor",
  }),
  departmentId: z.string({
    required_error: "Please select a department",
  }),
  date: z.string({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  type: z.string({
    required_error: "Please select an appointment type",
  }),
  notes: z.string().optional(),
})

interface Patient {
  id: number
  patient_id: string
  name: string
}

interface Doctor {
  id: number
  name: string
  department: string
  department_id: number
}

interface Department {
  id: number
  name: string
}

export function AppointmentForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      departmentId: "",
      date: "",
      time: "",
      type: "",
      notes: "",
    },
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientsRes, doctorsRes, departmentsRes] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/doctors"),
          fetch("/api/departments"),
        ])

        if (!patientsRes.ok || !doctorsRes.ok || !departmentsRes.ok) {
          throw new Error("Failed to fetch form data")
        }

        const [patientsData, doctorsData, departmentsData] = await Promise.all([
          patientsRes.json(),
          doctorsRes.json(),
          departmentsRes.json(),
        ])

        if (Array.isArray(patientsData)) {
          setPatients(patientsData)
        } else {
          console.error("Invalid patients data format:", patientsData)
          toast.error("Invalid patients data format")
        }

        if (Array.isArray(doctorsData)) {
          console.log("Doctors data:", doctorsData)
          setDoctors(doctorsData)
        } else {
          console.error("Invalid doctors data format:", doctorsData)
          toast.error("Invalid doctors data format")
        }

        if (Array.isArray(departmentsData)) {
          setDepartments(departmentsData)
        } else {
          console.error("Invalid departments data format:", departmentsData)
          toast.error("Invalid departments data format")
        }
      } catch (error) {
        console.error("Error fetching form data:", error)
        toast.error("Failed to load form data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/appointments/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Appointment scheduled successfully")
        router.push("/dashboard/appointments")
      } else {
        toast.error(data.error || "Failed to schedule appointment")
      }
    } catch (error) {
      toast.error("An error occurred while scheduling the appointment")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-[400px]">Loading form data...</div>
  }

  if (patients.length === 0 || doctors.length === 0 || departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <p className="text-muted-foreground">Failed to load form data</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.name} ({patient.patient_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        form.setValue("doctorId", "")
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id.toString()}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        console.log("Selected doctor value:", value)
                        field.onChange(value)
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors
                          .filter(
                            (doctor) =>
                              !form.getValues("departmentId") || 
                              doctor.department_id === Number(form.getValues("departmentId"))
                          )
                          .map((doctor) => {
                            console.log("Available doctor:", doctor)
                            return (
                              <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                {doctor.name}
                              </SelectItem>
                            )
                          })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="New Patient">New Patient</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Consultation">Consultation</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter any additional notes..." className="min-h-20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/dashboard/appointments")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
