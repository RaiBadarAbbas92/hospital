import { Button } from "@/components/ui/button"
import { MedicineTable } from "@/components/medicine-table"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MedicinePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medicine Inventory</h1>
        <Link href="/dashboard/medicine/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Medicine
          </Button>
        </Link>
      </div>
      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Current Stock</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <MedicineTable type="stock" />
        </TabsContent>
        <TabsContent value="purchases">
          <MedicineTable type="purchases" />
        </TabsContent>
        <TabsContent value="sales">
          <MedicineTable type="sales" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
