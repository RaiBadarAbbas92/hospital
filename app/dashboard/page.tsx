import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/components/overview"
import { RecentPatients } from "@/components/recent-patients"
import { DashboardStats } from "@/components/dashboard-stats"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardStats />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Patient admissions and discharges for the current month</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Recently admitted patients</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentPatients />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
