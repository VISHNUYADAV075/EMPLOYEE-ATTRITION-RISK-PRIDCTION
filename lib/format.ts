export function fmtNum(n: number | null | undefined, d = 0): string {
  if (n === null || n === undefined || isNaN(n)) return "—"
  return n.toLocaleString("en-IN", { maximumFractionDigits: d })
}

export function pct(n: number | null | undefined, d = 1): string {
  if (n === null || n === undefined || isNaN(n)) return "—"
  return n.toFixed(d) + "%"
}

export function humanFeatureName(f: string): string {
  const map: Record<string, string> = {
    Age: "Age",
    YearsAtCompany: "Tenure (years)",
    TrainingHoursLastYear: "Training hours",
    SatisfactionScore: "Satisfaction score",
    PerformanceRating: "Performance rating",
    OverTime: "Works overtime",
  }
  if (map[f]) return map[f]
  const parts = f.split("_")
  const cat = parts[0]
  const val = f.slice(cat.length + 1)
  return `${cat.replace("_", " ")}: ${val}`
}
