"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface OverviewData {
  name: string
  admissions: number
  discharges: number
}

export function Overview() {
  const [data, setData] = useState<OverviewData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOverviewData() {
      try {
        const response = await fetch("/api/dashboard/overview")
        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error("Error fetching overview data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOverviewData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-[350px]">Loading chart data...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip />
        <Bar dataKey="admissions" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        <Bar dataKey="discharges" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
