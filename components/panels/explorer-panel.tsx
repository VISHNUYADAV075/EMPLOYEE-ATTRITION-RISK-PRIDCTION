"use client"

import { useMemo, useState } from "react"
import type { Employee } from "@/lib/types"
import { fmtNum } from "@/lib/format"

const COLUMNS: { key: string; label: string; numeric?: boolean }[] = [
  { key: "EmployeeID", label: "ID" },
  { key: "Full_Name", label: "Name" },
  { key: "Department", label: "Department" },
  { key: "JobTitle", label: "Job Title" },
  { key: "City", label: "City" },
  { key: "Age", label: "Age", numeric: true },
  { key: "Gender", label: "Gender" },
  { key: "Salary", label: "Salary", numeric: true },
  { key: "YearsAtCompany", label: "Tenure", numeric: true },
  { key: "SatisfactionScore", label: "Satisfaction", numeric: true },
  { key: "PerformanceRating", label: "Perf", numeric: true },
  { key: "Work_Mode", label: "Work Mode" },
  { key: "OverTime", label: "Overtime" },
  { key: "Attrition", label: "Attrition" },
]

const PAGE_SIZE = 25

export function ExplorerPanel({ rows }: { rows: Employee[] }) {
  const [query, setQuery] = useState("")
  const [sortKey, setSortKey] = useState<string>("EmployeeID")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = rows
    if (q) {
      list = rows.filter((r) =>
        COLUMNS.some((c) => {
          const v = r[c.key]
          return v !== null && v !== undefined && String(v).toLowerCase().includes(q)
        }),
      )
    }
    const sorted = [...list].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av === null || av === undefined) return 1
      if (bv === null || bv === undefined) return -1
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av
      }
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })
    return sorted
  }, [rows, query, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setPage(0)
  }

  function exportCsv() {
    const header = COLUMNS.map((c) => c.label).join(",")
    const body = filtered
      .map((r) =>
        COLUMNS.map((c) => {
          const v = r[c.key]
          const s = v === null || v === undefined ? "" : String(v)
          return `"${s.replace(/"/g, '""')}"`
        }).join(","),
      )
      .join("\n")
    const blob = new Blob([header + "\n" + body], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "employees_filtered.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="tab-panel">
      <div className="explorer-toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, department, city, job title…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
          />
        </div>
        <button className="btn" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      <div className="table-wrap">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.key} onClick={() => toggleSort(c.key)}>
                    {c.label}
                    {sortKey === c.key && (
                      <span className="arrow">{sortDir === "asc" ? "▲" : "▼"}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, i) => (
                <tr key={(r.EmployeeID as string) ?? i}>
                  {COLUMNS.map((c) => (
                    <td key={c.key}>{renderCell(r, c.key)}</td>
                  ))}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} style={{ textAlign: "center", padding: 30 }}>
                    No employees match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>
            Showing {fmtNum(pageRows.length)} of {fmtNum(filtered.length)} employees
          </span>
          <div className="pagination">
            <button disabled={safePage === 0} onClick={() => setPage(0)} aria-label="First page">
              «
            </button>
            <button
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            <span>
              Page {safePage + 1} / {pageCount}
            </span>
            <button
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
            <button
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(pageCount - 1)}
              aria-label="Last page"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderCell(r: Employee, key: string) {
  const v = r[key]
  if (key === "Attrition") {
    return v === true ? (
      <span className="badge badge-yes">Left</span>
    ) : (
      <span className="badge badge-no">Active</span>
    )
  }
  if (key === "OverTime") {
    return v === true ? (
      <span className="badge badge-yes">Yes</span>
    ) : (
      <span className="badge badge-no">No</span>
    )
  }
  if (key === "Salary" && typeof v === "number") {
    return "₹" + Math.round(v).toLocaleString("en-IN")
  }
  if (v === null || v === undefined || v === "") return "—"
  if (typeof v === "number") {
    return Number.isInteger(v) ? String(v) : v.toFixed(1)
  }
  return String(v)
}
