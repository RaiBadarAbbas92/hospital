import { Button } from "@/components/ui/button"
import { AppointmentsTable } from "@/components/appointments-table"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function AppointmentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Link href="/dashboard/appointments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </Link>
      </div>
      <AppointmentsTable />
    </div>
  )
}
