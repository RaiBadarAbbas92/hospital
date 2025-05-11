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

interface Invoice {
  id: number
  invoice_id: string
  patient_id: string
  patient_name: string
  date: string
  due_date: string
  amount: number | string
  status: string
}

export function BillingTable() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const response = await fetch("/api/invoices")
        const result = await response.json()
        setInvoices(Array.isArray(result) ? result : [])
      } catch (error) {
        console.error("Error fetching invoices:", error)
        setInvoices([])
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  const filteredInvoices = Array.isArray(invoices) ? invoices.filter(
    (invoice) =>
      invoice?.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice?.invoice_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice?.patient_id?.toLowerCase().includes(searchTerm.toLowerCase()),
  ) : []

  const handlePrint = (id: string) => {
    router.push(`/dashboard/billing/${id}/print`)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]">Loading invoices...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoices..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_id}</TableCell>
                <TableCell>{invoice.patient_name}</TableCell>
                <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                <TableCell>${Number(invoice.amount).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      invoice.status === "Paid" ? "default" : invoice.status === "Pending" ? "secondary" : "destructive"
                    }
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
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
                      <DropdownMenuItem>View invoice</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrint(invoice.invoice_id)}>
                        Print invoice
                      </DropdownMenuItem>
                      {invoice.status !== "Paid" && <DropdownMenuItem>Mark as paid</DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Patient details</DropdownMenuItem>
                      <DropdownMenuItem>Send reminder</DropdownMenuItem>
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
