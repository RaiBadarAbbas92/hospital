"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/date-range-picker"
import { LineChart, BarChart, PieChart } from "@/components/charts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DateRange } from "react-day-picker"

interface ReportData {
  patients: {
    total: number
    new: number
    admitted: number
    discharged: number
  }
  appointments: {
    total: number
    completed: number
    cancelled: number
    noShow: number
  }
  revenue: {
    total: number
    outstanding: number
    averageBill: number
    expenses: number
  }
  medicine: {
    totalStockValue: number
    lowStockItems: number
    expiredItems: number
    monthlyUsage: number
  }
  patientAdmissions: Array<{ month: string; count: number }>
  appointmentsByDepartment: Array<{ department: string; count: number }>
  revenueByDepartment: Array<{ department: string; amount: number }>
  medicineByCategory: Array<{ category: string; count: number }>
}

export function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  })
  const [department, setDepartment] = useState<string>("all")
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDateRangeChange = (range: DateRange) => {
    if (range?.from) {
      setDateRange(range)
    }
  }

  useEffect(() => {
    if (!mounted) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/reports?from=${dateRange.from?.toISOString()}&to=${dateRange.to?.toISOString()}&department=${department}`
        )
        if (!response.ok) throw new Error("Failed to fetch report data")
        const reportData = await response.json()
        setData(reportData)
      } catch (error) {
        console.error("Error fetching report data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange, department, mounted])

  if (!mounted) {
    return null
  }

  if (loading) {
    return <div className="p-8">Loading reports...</div>
  }

  if (!data) {
    return <div className="p-8">Failed to load reports</div>
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <div className="flex gap-4">
          <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="cardiology">Cardiology</SelectItem>
              <SelectItem value="neurology">Neurology</SelectItem>
              <SelectItem value="orthopedics">Orthopedics</SelectItem>
              <SelectItem value="pediatrics">Pediatrics</SelectItem>
              <SelectItem value="oncology">Oncology</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="medicine">Medicine</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.patients.total}</div>
                <p className="text-xs text-muted-foreground">
                  {data.patients.new} new this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.appointments.total}</div>
                <p className="text-xs text-muted-foreground">
                  {data.appointments.completed} completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${data.revenue.total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  ${data.revenue.outstanding.toLocaleString()} outstanding
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medicine Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${data.medicine.totalStockValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {data.medicine.lowStockItems} low stock items
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Admissions</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={data.patientAdmissions} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Appointments by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={data.appointmentsByDepartment} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Admissions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChart data={data.patientAdmissions} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Patients by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={data.appointmentsByDepartment} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Appointments by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChart data={data.appointmentsByDepartment} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span>{data.appointments.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancelled</span>
                    <span>{data.appointments.cancelled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>No Show</span>
                    <span>{data.appointments.noShow}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={data.revenueByDepartment} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span>${data.revenue.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outstanding</span>
                    <span>${data.revenue.outstanding.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Bill</span>
                    <span>${data.revenue.averageBill.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expenses</span>
                    <span>${data.revenue.expenses.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medicine" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Medicine by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChart data={data.medicineByCategory} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Medicine Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Stock Value</span>
                    <span>${data.medicine.totalStockValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Stock Items</span>
                    <span>{data.medicine.lowStockItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expired Items</span>
                    <span>{data.medicine.expiredItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Usage</span>
                    <span>${data.medicine.monthlyUsage.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
