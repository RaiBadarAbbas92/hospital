"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Medicine name must be at least 2 characters.",
  }),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  supplier: z.string().min(2, {
    message: "Supplier must be at least 2 characters.",
  }),
  quantity: z.string().transform((val) => Number.parseInt(val)),
  unit: z.string().min(1, {
    message: "Unit is required.",
  }),
  expiryDate: z.string({
    required_error: "Expiry date is required.",
  }),
})

export function MedicineForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      supplier: "",
      quantity: "0",
      unit: "",
      expiryDate: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/medicines/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Medicine added successfully")
        router.push("/dashboard/medicine")
      } else {
        toast.error(data.error || "Failed to add medicine")
      }
    } catch (error) {
      toast.error("An error occurred while adding the medicine")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medicine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Paracetamol 500mg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Analgesic">Analgesic</SelectItem>
                        <SelectItem value="Antibiotic">Antibiotic</SelectItem>
                        <SelectItem value="NSAID">NSAID</SelectItem>
                        <SelectItem value="Antihistamine">Antihistamine</SelectItem>
                        <SelectItem value="PPI">PPI</SelectItem>
                        <SelectItem value="Antidiabetic">Antidiabetic</SelectItem>
                        <SelectItem value="Statin">Statin</SelectItem>
                        <SelectItem value="Bronchodilator">Bronchodilator</SelectItem>
                        <SelectItem value="Antihypertensive">Antihypertensive</SelectItem>
                        <SelectItem value="Antidepressant">Antidepressant</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PharmaCorp">PharmaCorp</SelectItem>
                        <SelectItem value="MediSupply">MediSupply</SelectItem>
                        <SelectItem value="HealthDrugs">HealthDrugs</SelectItem>
                        <SelectItem value="GlobalMeds">GlobalMeds</SelectItem>
                        <SelectItem value="PharmaPlus">PharmaPlus</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Tablets">Tablets</SelectItem>
                        <SelectItem value="Capsules">Capsules</SelectItem>
                        <SelectItem value="Bottles">Bottles</SelectItem>
                        <SelectItem value="Vials">Vials</SelectItem>
                        <SelectItem value="Inhalers">Inhalers</SelectItem>
                        <SelectItem value="Syrup">Syrup</SelectItem>
                        <SelectItem value="Injections">Injections</SelectItem>
                        <SelectItem value="Patches">Patches</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/dashboard/medicine")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Medicine"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
