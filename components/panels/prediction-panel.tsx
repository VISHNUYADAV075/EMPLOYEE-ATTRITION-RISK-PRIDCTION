"use client"

import { useMemo, useState } from "react"
import type { Employee, PredictionInput } from "@/lib/types"
import { uniqueSorted } from "@/lib/use-employees"
import { MODEL } from "@/lib/model"
import { predict } from "@/lib/predict"
import { humanFeatureName } from "@/lib/format"

function firstOf(vals: (string | number)[], fallback: string): string {
  return vals.length ? String(vals[0]) : fallback
}

export function PredictionPanel({ rows }: { rows: Employee[] }) {
  const opts = useMemo(
    () => ({
      Department: uniqueSorted(rows, "Department").map(String),
      Work_Mode: uniqueSorted(rows, "Work_Mode").map(String),
      Marital_Status: uniqueSorted(rows, "Marital_Status").map(String),
      EducationLevel: uniqueSorted(rows, "EducationLevel").map(String),
      Gender: uniqueSorted(rows, "Gender").map(String),
      City: uniqueSorted(rows, "City").map(String),
    }),
    [rows],
  )

  const [form, setForm] = useState<PredictionInput>({
    Age: 32,
    YearsAtCompany: 4,
    TrainingHoursLastYear: 20,
    SatisfactionScore: 6,
    PerformanceRating: 3,
    OverTime: false,
    Department: firstOf(opts.Department, "Engineering"),
    Work_Mode: firstOf(opts.Work_Mode, "On-site"),
    Marital_Status: firstOf(opts.Marital_Status, "Single"),
    EducationLevel: firstOf(opts.EducationLevel, "Bachelor"),
    Gender: firstOf(opts.Gender, "Male"),
    City: firstOf(opts.City, "Mumbai"),
  })

  const [result, setResult] = useState<{
    prob: number
    contributions: { feature: string; contribution: number }[]
  } | null>(null)

  function upd<K extends keyof PredictionInput>(key: K, val: PredictionInput[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function run() {
    setResult(predict(form))
  }

  const verdict = result
    ? result.prob >= 0.5
      ? { cls: "risk-high", label: "High Risk" }
      : result.prob >= 0.3
        ? { cls: "risk-medium", label: "Moderate Risk" }
        : { cls: "risk-low", label: "Low Risk" }
    : null

  const topFactors = useMemo(() => {
    if (!result) return []
    return [...result.contributions]
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 8)
  }, [result])

  const maxAbs = topFactors.reduce((m, f) => Math.max(m, Math.abs(f.contribution)), 0.0001)

  return (
    <div className="tab-panel">
      <div className="pred-layout">
        {/* Form */}
        <div className="form-card">
          <h3>Employee Profile</h3>
          <p className="desc">
            Adjust the attributes below and score this profile against the trained model.
          </p>
          <div className="form-grid">
            <RangeField
              label="Age"
              min={18}
              max={65}
              value={form.Age}
              onChange={(v) => upd("Age", v)}
            />
            <RangeField
              label="Years at Company"
              min={0}
              max={30}
              value={form.YearsAtCompany}
              onChange={(v) => upd("YearsAtCompany", v)}
            />
            <RangeField
              label="Training Hours (last year)"
              min={0}
              max={100}
              value={form.TrainingHoursLastYear}
              onChange={(v) => upd("TrainingHoursLastYear", v)}
            />
            <RangeField
              label="Satisfaction Score"
              min={1}
              max={10}
              value={form.SatisfactionScore}
              onChange={(v) => upd("SatisfactionScore", v)}
            />
            <RangeField
              label="Performance Rating"
              min={1}
              max={5}
              value={form.PerformanceRating}
              onChange={(v) => upd("PerformanceRating", v)}
            />

            <SelectField
              label="Overtime"
              value={form.OverTime ? "yes" : "no"}
              options={["no", "yes"]}
              labels={{ no: "No", yes: "Yes" }}
              onChange={(v) => upd("OverTime", v === "yes")}
            />

            <SelectField
              label="Department"
              value={form.Department}
              options={opts.Department}
              onChange={(v) => upd("Department", v)}
            />
            <SelectField
              label="Work Mode"
              value={form.Work_Mode}
              options={opts.Work_Mode}
              onChange={(v) => upd("Work_Mode", v)}
            />
            <SelectField
              label="Marital Status"
              value={form.Marital_Status}
              options={opts.Marital_Status}
              onChange={(v) => upd("Marital_Status", v)}
            />
            <SelectField
              label="Education Level"
              value={form.EducationLevel}
              options={opts.EducationLevel}
              onChange={(v) => upd("EducationLevel", v)}
            />
            <SelectField
              label="Gender"
              value={form.Gender}
              options={opts.Gender}
              onChange={(v) => upd("Gender", v)}
            />
            <SelectField
              label="City"
              value={form.City}
              options={opts.City}
              onChange={(v) => upd("City", v)}
            />
          </div>
          <button className="predict-btn" onClick={run}>
            Predict Attrition Risk
          </button>
        </div>

        {/* Result */}
        <div className="result-card">
          {!result || !verdict ? (
            <div className="result-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round" />
                <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p>
                Configure an employee profile and click <b>Predict</b> to see their
                <br />
                attrition risk and the factors driving it.
              </p>
            </div>
          ) : (
            <>
              <div className="gauge-wrap">
                <div className="gauge-label">Predicted Attrition Risk</div>
                <div className={`gauge-verdict ${verdict.cls}`}>{verdict.label}</div>
                <div className="gauge-prob">
                  Probability of leaving: <b>{(result.prob * 100).toFixed(1)}%</b>
                </div>
                <div className="gauge-track">
                  <div className="gauge-needle" style={{ left: `${Math.min(100, Math.max(0, result.prob * 100))}%` }} />
                </div>
                <div className="gauge-scale">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="factors-title">Top Contributing Factors</div>
              {topFactors.map((f) => {
                const positive = f.contribution >= 0
                const w = (Math.abs(f.contribution) / maxAbs) * 50
                return (
                  <div className="factor-row" key={f.feature}>
                    <div className="factor-name">{humanFeatureName(f.feature)}</div>
                    <div className="factor-bar-track">
                      <div className="factor-mid" />
                      <div
                        className={`factor-bar-fill ${positive ? "pos" : "neg"}`}
                        style={
                          positive
                            ? { left: "50%", width: `${w}%` }
                            : { right: "50%", width: `${w}%` }
                        }
                      />
                    </div>
                    <div className="factor-val">
                      {positive ? "+" : "−"}
                      {Math.abs(f.contribution).toFixed(2)}
                    </div>
                  </div>
                )
              })}
              <p style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 14 }}>
                Positive (coral) factors push risk up; negative (teal) factors reduce it. Values are
                standardized log-odds contributions.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function RangeField({
  label,
  min,
  max,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <div className="range-row">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="range-val">{value}</span>
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  labels?: Record<string, string>
  onChange: (v: string) => void
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {labels?.[o] ?? o}
          </option>
        ))}
      </select>
    </div>
  )
}
