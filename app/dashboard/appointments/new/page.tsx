import { AppointmentForm } from "@/components/appointment-form"

export default function NewAppointmentPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Schedule New Appointment</h1>
      <AppointmentForm />
    </div>
  )
}
