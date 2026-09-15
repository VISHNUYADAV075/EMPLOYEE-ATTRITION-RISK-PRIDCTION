"use client"

import useSWR from "swr"
import { useMemo } from "react"
import type { Employee, EmployeeRaw } from "./types"

const fetcher = (url: string): Promise<EmployeeRaw> =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to load employee data")
    return r.json()
  })

export function useEmployees() {
  const { data, error, isLoading } = useSWR<EmployeeRaw>(
    "/employees.json",
    fetcher,
    { revalidateOnFocus: false },
  )

  const rows = useMemo<Employee[]>(() => {
    if (!data) return []
    const { headers, rows: raw } = data
    return raw.map((r) => {
      const o: Record<string, string | number | boolean | null> = {}
      headers.forEach((h, i) => {
        o[h] = r[i]
      })
      return o as Employee
    })
  }, [data])

  return { rows, isLoading, error }
}

export function uniqueSorted(rows: Employee[], field: string): (string | number)[] {
  const s = new Set<string | number>()
  rows.forEach((r) => {
    const v = r[field]
    if (v !== null && v !== undefined && v !== "" && typeof v !== "boolean") {
      s.add(v)
    }
  })
  return Array.from(s).sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") return a - b
    return String(a).localeCompare(String(b))
  })
}

export function groupCount(rows: Employee[], field: string): Record<string, number> {
  const m: Record<string, number> = {}
  rows.forEach((r) => {
    const raw = r[field]
    const v =
      raw === null || raw === undefined || raw === "" ? "Unknown" : String(raw)
    m[v] = (m[v] || 0) + 1
  })
  return m
}
