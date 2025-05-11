import { Button } from "@/components/ui/button"
import { BillingTable } from "@/components/billing-table"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing & Invoices</h1>
        <Link href="/dashboard/billing/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>
      <BillingTable />
    </div>
  )
}
