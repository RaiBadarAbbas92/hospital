import { Button } from "@/components/ui/button"
import { LabTestsTable } from "@/components/lab-tests-table"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function LabPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Laboratory Tests</h1>
        <Link href="/dashboard/lab/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Lab Test
          </Button>
        </Link>
      </div>
      <LabTestsTable />
    </div>
  )
}
