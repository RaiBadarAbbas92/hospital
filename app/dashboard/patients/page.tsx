import { Button } from "@/components/ui/button"
import { PatientsTable } from "@/components/patients-table"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function PatientsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Patients</h1>
        <Link href="/dashboard/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </Link>
      </div>
      <PatientsTable />
    </div>
  )
}
