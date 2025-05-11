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

interface Medicine {
  id: number
  name: string
  description: string
  quantity: number
  unit: string
  price: number
  status: string
}

export function MedicinesTable() {
  const router = useRouter()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMedicines() {
      try {
        const response = await fetch("/api/medicines")
        const data = await response.json()
        setMedicines(data)
      } catch (error) {
        console.error("Error fetching medicines:", error)
        toast.error("Failed to load medicines")
      } finally {
        setLoading(false)
      }
    }

    fetchMedicines()
  }, [])

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewDetails = async (medicineId: number) => {
    try {
      const response = await fetch(`/api/medicines/${medicineId}`)
      if (!response.ok) throw new Error("Failed to fetch medicine details")
      const data = await response.json()
      // TODO: Show medicine details in a modal or navigate to details page
      console.log("Medicine details:", data)
    } catch (error) {
      console.error("Error fetching medicine details:", error)
      toast.error("Failed to load medicine details")
    }
  }

  const handleEditMedicine = (medicineId: number) => {
    router.push(`/dashboard/medicines/${medicineId}/edit`)
  }

  const handlePurchaseMedicine = (medicineId: number) => {
    router.push(`/dashboard/medicines/${medicineId}/purchase`)
  }

  const handleSellMedicine = (medicineId: number) => {
    router.push(`/dashboard/medicines/${medicineId}/sell`)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[400px]">Loading medicines...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search medicines..."
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMedicines.map((medicine) => (
              <TableRow key={medicine.id}>
                <TableCell className="font-medium">{medicine.name}</TableCell>
                <TableCell>{medicine.description}</TableCell>
                <TableCell>{medicine.quantity}</TableCell>
                <TableCell>{medicine.unit}</TableCell>
                <TableCell>${medicine.price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      medicine.status === "In Stock"
                        ? "default"
                        : medicine.status === "Low Stock"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {medicine.status}
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
                      <DropdownMenuItem onClick={() => handleViewDetails(medicine.id)}>
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditMedicine(medicine.id)}>
                        Edit medicine
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handlePurchaseMedicine(medicine.id)}>
                        Purchase medicine
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSellMedicine(medicine.id)}>
                        Sell medicine
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