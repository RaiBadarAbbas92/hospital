import { PatientForm } from "@/components/patient-form"

export default function NewPatientPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Add New Patient</h1>
      <PatientForm />
    </div>
  )
}
