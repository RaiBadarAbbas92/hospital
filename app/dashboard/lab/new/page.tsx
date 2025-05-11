import { LabTestForm } from "@/components/lab-test-form"

export default function NewLabTestPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">New Lab Test</h1>
      <LabTestForm />
    </div>
  )
}
