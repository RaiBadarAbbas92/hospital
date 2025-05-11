"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface LabTest {
  id: number
  patient_name: string
  test_name: string
  requested_by: string
  requested_date: string
  status: string
  result: string | null
}

export function LabTestsTable() {
  const router = useRouter()
  const [labTests, setLabTests] = useState<LabTest[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLabTests() {
      try {
        const response = await fetch("/api/lab-tests")
        const data = await response.json()
        setLabTests(data)
      } catch (error) {
        console.error("Error fetching lab tests:", error)
        toast.error("Failed to load lab tests")
      } finally {
        setLoading(false)
      }
    }

    fetchLabTests()
  }, [])

  const filteredLabTests = labTests.filter(
    (test) =>
      test.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.requested_by.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = async (testId: number) => {
    try {
      const response = await fetch(`/api/lab-tests/${testId}`)
      if (!response.ok) throw new Error("Failed to fetch lab test details")
      const data = await response.json()
      // TODO: Show lab test details in a modal or navigate to details page
      console.log("Lab test details:", data)
    } catch (error) {
      console.error("Error fetching lab test details:", error)
      toast.error("Failed to load lab test details")
    }
  }

  const handleEditTest = (testId: number) => {
    router.push(`/dashboard/lab-tests/${testId}/edit`)
  }

  const handleCreateInvoice = (testId: number) => {
    router.push(`/dashboard/billing/new?labTestId=${testId}`)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]">Loading lab tests...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search lab tests..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Test Name</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLabTests.map((test) => (
              <TableRow key={test.id}>
                <TableCell>{test.patient_name}</TableCell>
                <TableCell>{test.test_name}</TableCell>
                <TableCell>{test.requested_by}</TableCell>
                <TableCell>{test.requested_date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      test.status === "Completed"
                        ? "default"
                        : test.status === "Cancelled"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {test.status}
                  </Badge>
                </TableCell>
                <TableCell>{test.result || "Pending"}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(test.id)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditTest(test.id)}>
                        Edit test
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCreateInvoice(test.id)}>
                        Create invoice
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
