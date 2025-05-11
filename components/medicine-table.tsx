"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Medicine {
  id: number
  medicine_id?: string
  name?: string
  category?: string
  supplier?: string
  quantity: number
  unit: string
  expiry_date?: string
  status?: string
  purchase_id?: string
  medicine_name?: string
  purchase_date?: string
  amount?: number
  sale_id?: string
  patient_id?: string
  patient_name?: string
  sale_date?: string
}

export function MedicineTable({ type }: { type: "stock" | "purchases" | "sales" }) {
  const [data, setData] = useState<Medicine[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMedicines() {
      try {
        const response = await fetch(`/api/medicines?type=${type}`)
        const result = await response.json()
        // Ensure we're setting an array
        setData(Array.isArray(result) ? result : [])
      } catch (error) {
        console.error(`Error fetching medicines (${type}):`, error)
        setData([]) // Set empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchMedicines()
  }, [type])

  const filteredData = Array.isArray(data) ? data.filter((item) => {
    const searchFields = [
      item.name?.toLowerCase(),
      item.medicine_name?.toLowerCase(),
      item.medicine_id?.toLowerCase(),
      item.purchase_id?.toLowerCase(),
      item.sale_id?.toLowerCase(),
    ].filter(Boolean)

    return searchFields.some((field) => field?.includes(searchTerm.toLowerCase()))
  }) : []

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]">Loading data...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${type}...`}
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {type === "stock" && (
                <>
                  <TableHead>Medicine ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                </>
              )}
              {type === "purchases" && (
                <>
                  <TableHead>Purchase ID</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </>
              )}
              {type === "sales" && (
                <>
                  <TableHead>Sale ID</TableHead>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Sale Date</TableHead>
                  <TableHead>Amount</TableHead>
                </>
              )}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {type === "stock" && item.medicine_id}
                  {type === "purchases" && item.purchase_id}
                  {type === "sales" && item.sale_id}
                </TableCell>
                {type === "stock" && (
                  <>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "In Stock" ? "default" : "destructive"}>{item.status}</Badge>
                    </TableCell>
                  </>
                )}
                {type === "purchases" && (
                  <>
                    <TableCell>{item.medicine_name}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>${item.amount?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === "Received" ? "default" : "secondary"}>{item.status}</Badge>
                    </TableCell>
                  </>
                )}
                {type === "sales" && (
                  <>
                    <TableCell>{item.medicine_name}</TableCell>
                    <TableCell>{item.patient_name}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>{item.sale_date ? new Date(item.sale_date).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>${item.amount?.toFixed(2)}</TableCell>
                  </>
                )}
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
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      {type === "stock" && (
                        <>
                          <DropdownMenuItem>Update stock</DropdownMenuItem>
                          <DropdownMenuItem>Add to purchase order</DropdownMenuItem>
                        </>
                      )}
                      {type === "purchases" && (
                        <>
                          <DropdownMenuItem>View invoice</DropdownMenuItem>
                          <DropdownMenuItem>Update status</DropdownMenuItem>
                        </>
                      )}
                      {type === "sales" && (
                        <>
                          <DropdownMenuItem>View invoice</DropdownMenuItem>
                          <DropdownMenuItem>Patient details</DropdownMenuItem>
                        </>
                      )}
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
