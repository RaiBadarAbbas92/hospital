"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { MoreHorizontal, Printer } from "lucide-react"

interface Invoice {
  id: string
  patient_name: string
  invoice_date: string
  total_amount: number
  status: string
  payment_method: string
}

export function InvoicesTable() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices")
      if (!response.ok) throw new Error("Failed to fetch invoices")
      const data = await response.json()
      setInvoices(data)
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast.error("Failed to load invoices")
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.payment_method.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/billing/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/billing/${id}/edit`)
  }

  const handlePrint = (id: string) => {
    router.push(`/dashboard/billing/${id}/print`)
  }

  if (loading) {
    return <div>Loading invoices...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search by patient name or payment method..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.patient_name}</TableCell>
                <TableCell>{format(new Date(invoice.invoice_date), "PPP")}</TableCell>
                <TableCell>${invoice.total_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === "paid"
                        ? "default"
                        : invoice.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{invoice.payment_method}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(invoice.id)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(invoice.id)}>
                        Edit Invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrint(invoice.id)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
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