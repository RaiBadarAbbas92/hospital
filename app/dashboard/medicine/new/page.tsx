import { MedicineForm } from "@/components/medicine-form"

export default function NewMedicinePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Add New Medicine</h1>
      <MedicineForm />
    </div>
  )
}
