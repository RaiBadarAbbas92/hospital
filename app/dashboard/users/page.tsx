import { Button } from "@/components/ui/button"
import { UsersTable } from "@/components/users-table"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Link href="/dashboard/users/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>
      <UsersTable />
    </div>
  )
}
