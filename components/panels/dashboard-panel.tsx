"use client"

import { useMemo, useState } from "react"
import type { Employee } from "@/lib/types"
import { uniqueSorted } from "@/lib/use-employees"
import { fmtNum, pct } from "@/lib/format"
import { COLORS, PALETTE, GRID } from "@/lib/chart-theme"
import { ChartBox } from "@/components/chart-box"

interface Filters {
  department: string
  gender: string
  workMode: string
  overtime: string
  ageBand: string
}

const EMPTY: Filters = {
  department: "",
  gender: "",
  workMode: "",
  overtime: "",
  ageBand: "",
}

function ageBand(age: number | null): string {
  if (age === null) return "Unknown"
  if (age < 25) return "Under 25"
  if (age < 35) return "25–34"
  if (age < 45) return "35–44"
  if (age < 55) return "45–54"
  return "55+"
}

const AGE_ORDER = ["Under 25", "25–34", "35–44", "45–54", "55+"]

export function DashboardPanel({ rows }: { rows: Employee[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY)

  const departments = useMemo(() => uniqueSorted(rows, "Department"), [rows])
  const genders = useMemo(() => uniqueSorted(rows, "Gender"), [rows])
  const workModes = useMemo(() => uniqueSorted(rows, "Work_Mode"), [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filters.department && r.Department !== filters.department) return false
      if (filters.gender && r.Gender !== filters.gender) return false
      if (filters.workMode && r.Work_Mode !== filters.workMode) return false
      if (filters.overtime) {
        const want = filters.overtime === "yes"
        if (Boolean(r.OverTime) !== want) return false
      }
      if (filters.ageBand && ageBand(r.Age) !== filters.ageBand) return false
      return true
    })
  }, [rows, filters])

  const stats = useMemo(() => computeStats(filtered), [filtered])

  function set<K extends keyof Filters>(key: K, val: Filters[K]) {
    setFilters((f) => ({ ...f, [key]: val }))
  }

  const gridChart = {
    grid: { color: GRID },
    ticks: { color: "#9BA6C0" },
  }

  return (
    <div className="tab-panel">
      {/* KPIs */}
      <div className="kpi-grid">
        <Kpi label="Employees" value={fmtNum(stats.total)} meta="in current view" accent={COLORS.blue} />
        <Kpi
          label="Attrition Rate"
          value={pct(stats.attritionRate)}
          meta={`${fmtNum(stats.left)} left`}
          accent={COLORS.coral}
        />
        <Kpi label="Active" value={fmtNum(stats.active)} meta="currently retained" accent={COLORS.teal} />
        <Kpi label="Avg Age" value={stats.avgAge.toFixed(1)} meta="years" accent={COLORS.violet} />
        <Kpi
          label="Avg Tenure"
          value={stats.avgTenure.toFixed(1)}
          meta="years at company"
          accent={COLORS.amber}
        />
        <Kpi
          label="Overtime Share"
          value={pct(stats.overtimeShare)}
          meta="work overtime"
          accent={COLORS.blue}
        />
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="filter-group">
          <label htmlFor="f-dept">Department</label>
          <select id="f-dept" value={filters.department} onChange={(e) => set("department", e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={String(d)} value={String(d)}>
                {String(d)}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="f-gender">Gender</label>
          <select id="f-gender" value={filters.gender} onChange={(e) => set("gender", e.target.value)}>
            <option value="">All</option>
            {genders.map((g) => (
              <option key={String(g)} value={String(g)}>
                {String(g)}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="f-mode">Work Mode</label>
          <select id="f-mode" value={filters.workMode} onChange={(e) => set("workMode", e.target.value)}>
            <option value="">All modes</option>
            {workModes.map((w) => (
              <option key={String(w)} value={String(w)}>
                {String(w)}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="f-ot">Overtime</label>
          <select id="f-ot" value={filters.overtime} onChange={(e) => set("overtime", e.target.value)}>
            <option value="">All</option>
            <option value="yes">Works overtime</option>
            <option value="no">No overtime</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="f-age">Age Band</label>
          <select id="f-age" value={filters.ageBand} onChange={(e) => set("ageBand", e.target.value)}>
            <option value="">All ages</option>
            {AGE_ORDER.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-actions">
          <span className="filter-count">
            <b>{fmtNum(stats.total)}</b> of {fmtNum(rows.length)} match
          </span>
          <button className="btn btn-ghost" onClick={() => setFilters(EMPTY)}>
            Reset
          </button>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card span-5">
          <h3>Attrition by Department</h3>
          <div className="chart-sub">Share of employees who left, per department</div>
          <div className="chart-wrap">
            <ChartBox
              type="bar"
              data={{
                labels: stats.deptLabels,
                datasets: [
                  {
                    label: "Attrition rate",
                    data: stats.deptRates,
                    backgroundColor: COLORS.coral,
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                indexAxis: "y" as const,
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ...gridChart, ticks: { color: "#9BA6C0", callback: (v) => v + "%" } },
                  y: { grid: { display: false }, ticks: { color: "#9BA6C0" } },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card span-7">
          <h3>Headcount &amp; Attrition by Age Band</h3>
          <div className="chart-sub">Active vs. left employees across age groups</div>
          <div className="chart-wrap">
            <ChartBox
              type="bar"
              data={{
                labels: stats.ageLabels,
                datasets: [
                  {
                    label: "Active",
                    data: stats.ageActive,
                    backgroundColor: COLORS.teal,
                    borderRadius: 4,
                  },
                  {
                    label: "Left",
                    data: stats.ageLeft,
                    backgroundColor: COLORS.coral,
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" as const } },
                scales: {
                  x: { stacked: true, grid: { display: false }, ticks: { color: "#9BA6C0" } },
                  y: { stacked: true, ...gridChart },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card span-4">
          <h3>Overtime vs. Attrition</h3>
          <div className="chart-sub">Attrition rate by overtime status</div>
          <div className="chart-wrap">
            <ChartBox
              type="doughnut"
              data={{
                labels: ["Overtime · Left", "Overtime · Stayed", "No OT · Left", "No OT · Stayed"],
                datasets: [
                  {
                    data: stats.overtimeSplit,
                    backgroundColor: [COLORS.coral, COLORS.teal, "#8a4a44", "#1f6b62"],
                    borderColor: "#121A2E",
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "bottom" as const, labels: { boxWidth: 12, padding: 10 } } },
                cutout: "58%",
              }}
            />
          </div>
        </div>

        <div className="chart-card span-4">
          <h3>Attrition by Work Mode</h3>
          <div className="chart-sub">On-site, hybrid and remote</div>
          <div className="chart-wrap">
            <ChartBox
              type="bar"
              data={{
                labels: stats.modeLabels,
                datasets: [
                  {
                    label: "Attrition rate",
                    data: stats.modeRates,
                    backgroundColor: stats.modeLabels.map((_, i) => PALETTE[i % PALETTE.length]),
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: "#9BA6C0" } },
                  y: { ...gridChart, ticks: { color: "#9BA6C0", callback: (v) => v + "%" } },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card span-4">
          <h3>Satisfaction Distribution</h3>
          <div className="chart-sub">Self-reported satisfaction score</div>
          <div className="chart-wrap">
            <ChartBox
              type="bar"
              data={{
                labels: stats.satLabels,
                datasets: [
                  {
                    label: "Employees",
                    data: stats.satCounts,
                    backgroundColor: COLORS.violet,
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: "#9BA6C0" } },
                  y: { ...gridChart },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card span-6">
          <h3>Tenure vs. Attrition</h3>
          <div className="chart-sub">Attrition rate by years at company</div>
          <div className="chart-wrap">
            <ChartBox
              type="line"
              data={{
                labels: stats.tenureLabels,
                datasets: [
                  {
                    label: "Attrition rate",
                    data: stats.tenureRates,
                    borderColor: COLORS.amber,
                    backgroundColor: "rgba(240,169,59,0.12)",
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                    pointBackgroundColor: COLORS.amber,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: "#9BA6C0" } },
                  y: { ...gridChart, ticks: { color: "#9BA6C0", callback: (v) => v + "%" } },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card span-6">
          <h3>Salary by Attrition Status</h3>
          <div className="chart-sub">Average salary of retained vs. departed employees per department</div>
          <div className="chart-wrap">
            <ChartBox
              type="bar"
              data={{
                labels: stats.salaryDeptLabels,
                datasets: [
                  {
                    label: "Stayed",
                    data: stats.salaryStayed,
                    backgroundColor: COLORS.teal,
                    borderRadius: 4,
                  },
                  {
                    label: "Left",
                    data: stats.salaryLeft,
                    backgroundColor: COLORS.coral,
                    borderRadius: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" as const } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: "#9BA6C0" } },
                  y: {
                    ...gridChart,
                    ticks: { color: "#9BA6C0", callback: (v) => "₹" + Number(v).toLocaleString("en-IN") },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  meta,
  accent,
}: {
  label: string
  value: string
  meta: string
  accent: string
}) {
  return (
    <div className="kpi-card" style={{ ["--kpi-accent" as string]: accent }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-meta">{meta}</div>
    </div>
  )
}

function rate(left: number, total: number): number {
  return total === 0 ? 0 : (left / total) * 100
}

function computeStats(rows: Employee[]) {
  const total = rows.length
  const left = rows.filter((r) => r.Attrition === true).length
  const active = total - left
  const attritionRate = rate(left, total)

  const ages = rows.map((r) => r.Age).filter((a): a is number => typeof a === "number")
  const avgAge = ages.length ? ages.reduce((a, b) => a + b, 0) / ages.length : 0
  const tenures = rows.map((r) => r.YearsAtCompany).filter((a): a is number => typeof a === "number")
  const avgTenure = tenures.length ? tenures.reduce((a, b) => a + b, 0) / tenures.length : 0
  const otCount = rows.filter((r) => r.OverTime === true).length
  const overtimeShare = rate(otCount, total)

  // by department
  const deptMap = new Map<string, { total: number; left: number }>()
  rows.forEach((r) => {
    const d = r.Department || "Unknown"
    const e = deptMap.get(d) || { total: 0, left: 0 }
    e.total++
    if (r.Attrition === true) e.left++
    deptMap.set(d, e)
  })
  const deptEntries = Array.from(deptMap.entries())
    .map(([k, v]) => ({ k, r: rate(v.left, v.total) }))
    .sort((a, b) => b.r - a.r)
  const deptLabels = deptEntries.map((d) => d.k)
  const deptRates = deptEntries.map((d) => +d.r.toFixed(1))

  // age bands
  const ageLabels = AGE_ORDER
  const ageActive = AGE_ORDER.map(
    (band) => rows.filter((r) => bandOf(r) === band && r.Attrition !== true).length,
  )
  const ageLeft = AGE_ORDER.map(
    (band) => rows.filter((r) => bandOf(r) === band && r.Attrition === true).length,
  )

  // overtime split
  const otLeft = rows.filter((r) => r.OverTime === true && r.Attrition === true).length
  const otStay = rows.filter((r) => r.OverTime === true && r.Attrition !== true).length
  const noLeft = rows.filter((r) => r.OverTime !== true && r.Attrition === true).length
  const noStay = rows.filter((r) => r.OverTime !== true && r.Attrition !== true).length
  const overtimeSplit = [otLeft, otStay, noLeft, noStay]

  // work mode
  const modeMap = new Map<string, { total: number; left: number }>()
  rows.forEach((r) => {
    const m = r.Work_Mode || "Unknown"
    const e = modeMap.get(m) || { total: 0, left: 0 }
    e.total++
    if (r.Attrition === true) e.left++
    modeMap.set(m, e)
  })
  const modeEntries = Array.from(modeMap.entries())
  const modeLabels = modeEntries.map((m) => m[0])
  const modeRates = modeEntries.map((m) => +rate(m[1].left, m[1].total).toFixed(1))

  // satisfaction
  const satMap = new Map<number, number>()
  rows.forEach((r) => {
    const s = typeof r.SatisfactionScore === "number" ? Math.round(r.SatisfactionScore) : null
    if (s !== null) satMap.set(s, (satMap.get(s) || 0) + 1)
  })
  const satKeys = Array.from(satMap.keys()).sort((a, b) => a - b)
  const satLabels = satKeys.map((s) => String(s))
  const satCounts = satKeys.map((s) => satMap.get(s) || 0)

  // tenure buckets
  const tenureBuckets = [0, 1, 2, 3, 4, 5, 6, 8, 10, 15]
  const tenureLabels: string[] = []
  const tenureRates: number[] = []
  for (let i = 0; i < tenureBuckets.length; i++) {
    const lo = tenureBuckets[i]
    const hi = tenureBuckets[i + 1] ?? Infinity
    const inBucket = rows.filter(
      (r) => typeof r.YearsAtCompany === "number" && r.YearsAtCompany >= lo && r.YearsAtCompany < hi,
    )
    if (inBucket.length === 0) continue
    const l = inBucket.filter((r) => r.Attrition === true).length
    tenureLabels.push(hi === Infinity ? `${lo}+` : `${lo}`)
    tenureRates.push(+rate(l, inBucket.length).toFixed(1))
  }

  // salary by dept & status (top departments)
  const salaryDeptLabels = deptLabels.slice(0, 6)
  const salaryStayed = salaryDeptLabels.map((d) => avgSalary(rows, d, false))
  const salaryLeft = salaryDeptLabels.map((d) => avgSalary(rows, d, true))

  return {
    total,
    left,
    active,
    attritionRate,
    avgAge,
    avgTenure,
    overtimeShare,
    deptLabels,
    deptRates,
    ageLabels,
    ageActive,
    ageLeft,
    overtimeSplit,
    modeLabels,
    modeRates,
    satLabels,
    satCounts,
    tenureLabels,
    tenureRates,
    salaryDeptLabels,
    salaryStayed,
    salaryLeft,
  }
}

function bandOf(r: Employee): string {
  const age = typeof r.Age === "number" ? r.Age : null
  if (age === null) return "Unknown"
  if (age < 25) return "Under 25"
  if (age < 35) return "25–34"
  if (age < 45) return "35–44"
  if (age < 55) return "45–54"
  return "55+"
}

function avgSalary(rows: Employee[], dept: string, left: boolean): number {
  const set = rows.filter(
    (r) => r.Department === dept && r.Attrition === left && typeof r.Salary === "number",
  )
  if (set.length === 0) return 0
  return Math.round(set.reduce((a, b) => a + (b.Salary as number), 0) / set.length)
}
