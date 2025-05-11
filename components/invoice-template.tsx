"use client"

import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface InvoiceItem {
  id: string
  description: string
  amount: number
}

interface InvoiceTemplateProps {
  invoice: {
    id: string
    invoice_id: string
    patient_id: string
    patient_first_name: string
    patient_last_name: string
    date: string
    due_date: string
    amount: number
    status: string
    notes: string | null
    items: InvoiceItem[]
  }
}

export function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  const patientName = `${invoice.patient_first_name} ${invoice.patient_last_name}`
  const totalAmount = invoice.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

  return (
    <div className="invoice-template max-w-4xl mx-auto p-8 bg-white shadow-lg">
      <div className="invoice-header">
        <h1 className="text-3xl font-bold mb-2">INVOICE</h1>
        <p className="text-gray-600">Invoice #{invoice.invoice_id}</p>
      </div>

      <div className="invoice-details grid grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="font-semibold mb-2">Patient Information</h2>
          <p className="text-gray-600">{patientName}</p>
          <p className="text-gray-600">ID: {invoice.patient_id}</p>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Invoice Information</h2>
          <p className="text-gray-600">Date: {format(new Date(invoice.date), "PPP")}</p>
          <p className="text-gray-600">Due Date: {format(new Date(invoice.due_date), "PPP")}</p>
          {invoice.notes && <p className="text-gray-600">Notes: {invoice.notes}</p>}
          <Badge
            variant={
              invoice.status === "Paid"
                ? "default"
                : invoice.status === "Pending"
                ? "secondary"
                : "destructive"
            }
            className="mt-2"
          >
            {invoice.status}
          </Badge>
        </div>
      </div>

      <table className="invoice-table w-full mb-8">
        <thead>
          <tr>
            <th className="text-left p-2">Item</th>
            <th className="text-right p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item) => (
            <tr key={item.id}>
              <td className="p-2">{item.description}</td>
              <td className="text-right p-2">${(item.amount || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="p-2 font-bold">Total</td>
            <td className="text-right p-2 font-bold">${totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div className="invoice-footer">
        <div className="text-center mb-4">
          <p className="text-gray-600">Thank you for choosing our services!</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg">Lunar Studio</p>
          <p className="text-gray-600">© {new Date().getFullYear()} Lunar Studio. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 