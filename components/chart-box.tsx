"use client"

import {
  Chart as ChartJS,
  registerables,
  type ChartData,
  type ChartOptions,
  type ChartType,
} from "chart.js"
import { Chart } from "react-chartjs-2"

let registered = false
if (!registered) {
  ChartJS.register(...registerables)
  ChartJS.defaults.color = "#9BA6C0"
  ChartJS.defaults.font.family = "var(--font-inter), sans-serif"
  ChartJS.defaults.font.size = 11.5
  ChartJS.defaults.borderColor = "#1A2440"
  registered = true
}

export function ChartBox<T extends ChartType>({
  type,
  data,
  options,
}: {
  type: T
  data: ChartData<T>
  options?: ChartOptions<T>
}) {
  return <Chart type={type} data={data} options={options} />
}
