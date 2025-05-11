"use client"

import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

interface ChartData {
  month?: string
  department?: string
  category?: string
  count?: number
  amount?: number
}

interface LineChartProps {
  data: Array<{ month: string; count: number }>
}

interface BarChartProps {
  data: Array<{ department?: string; category?: string; count?: number; amount?: number }>
}

interface PieChartProps {
  data: Array<{ department: string; count: number }>
}

export function LineChart({ data }: LineChartProps) {
  const chartData = {
    labels: data.map((d) => new Date(d.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })),
    datasets: [
      {
        label: "Admissions",
        data: data.map((d) => d.count),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return <Line data={chartData} options={options} height={300} />
}

export function BarChart({ data }: BarChartProps) {
  const chartData = {
    labels: data.map((d) => d.department || d.category || ""),
    datasets: [
      {
        label: "Count",
        data: data.map((d) => d.count || d.amount || 0),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return <Bar data={chartData} options={options} height={300} />
}

export function PieChart({ data }: PieChartProps) {
  const chartData = {
    labels: data.map((d) => d.department),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
      },
    },
  }

  return <Pie data={chartData} options={options} height={300} />
}
