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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const formSchema = z.object({
  patientId: z.string({
    required_error: "Please select a patient",
  }),
  testName: z.string().min(2, {
    message: "Test name must be at least 2 characters.",
  }),
  requestedBy: z.string({
    required_error: "Please select a doctor",
  }),
  requestDate: z.string({
    required_error: "Please select a date",
  }),
  priority: z.enum(["Normal", "Urgent"]),
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
}

export function LabTestForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      testName: "",
      requestedBy: "",
      requestDate: new Date().toISOString().split("T")[0],
      priority: "Normal",
      notes: "",
    },
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([fetch("/api/patients"), fetch("/api/doctors")])

        const [patientsData, doctorsData] = await Promise.all([patientsRes.json(), doctorsRes.json()])

        setPatients(patientsData)
        setDoctors(doctorsData)
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
      const response = await fetch("/api/lab-tests/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Lab test created successfully")
        router.push("/dashboard/lab")
      } else {
        toast.error(data.error || "Failed to create lab test")
      }
    } catch (error) {
      toast.error("An error occurred while creating the lab test")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-[400px]">Loading form data...</div>
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
                name="testName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Test Name</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select test" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Complete Blood Count">Complete Blood Count</SelectItem>
                        <SelectItem value="Lipid Profile">Lipid Profile</SelectItem>
                        <SelectItem value="Liver Function Test">Liver Function Test</SelectItem>
                        <SelectItem value="Thyroid Function Test">Thyroid Function Test</SelectItem>
                        <SelectItem value="Urinalysis">Urinalysis</SelectItem>
                        <SelectItem value="Blood Glucose">Blood Glucose</SelectItem>
                        <SelectItem value="Electrolyte Panel">Electrolyte Panel</SelectItem>
                        <SelectItem value="Kidney Function Test">Kidney Function Test</SelectItem>
                        <SelectItem value="HbA1c">HbA1c</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requestedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested By</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            {doctor.name}
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
                name="requestDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Normal" />
                          </FormControl>
                          <FormLabel className="font-normal">Normal</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Urgent" />
                          </FormControl>
                          <FormLabel className="font-normal">Urgent</FormLabel>
                        </FormItem>
                      </RadioGroup>
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
          <Button variant="outline" type="button" onClick={() => router.push("/dashboard/lab")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Lab Test"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
