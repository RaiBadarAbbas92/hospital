"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { InvoiceTemplate } from "@/components/invoice-template"
import { toast } from "sonner"
import "@/app/print.css"

export default function PrintInvoicePage() {
  const params = useParams()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInvoice() {
      try {
        console.log("Fetching invoice with ID:", params.id)
        const response = await fetch(`/api/invoices/${params.id}`)
        console.log("API Response status:", response.status)
        const data = await response.json()
        console.log("API Response data:", data)
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch invoice")
        }
        
        setInvoice(data)
      } catch (error) {
        console.error("Error fetching invoice:", error)
        toast.error(error instanceof Error ? error.message : "Failed to load invoice")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [params.id])

  useEffect(() => {
    if (!loading && invoice) {
      window.print()
    }
  }, [loading, invoice])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading invoice...</div>
  }

  if (!invoice) {
    return <div className="flex items-center justify-center h-screen">Invoice not found</div>
  }

  return (
    <>
      <div className="no-print">
        <div className="flex items-center justify-center h-screen">
          <p>Printing invoice...</p>
        </div>
      </div>
      <InvoiceTemplate invoice={invoice} />
    </>
  )
} 