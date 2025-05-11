import { InvoiceForm } from "@/components/invoice-form"

export default function NewInvoicePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Create New Invoice</h1>
      <InvoiceForm />
    </div>
  )
}
