"use client"

import { useState } from "react"
import { useEmployees } from "@/lib/use-employees"
import { fmtNum } from "@/lib/format"
import { Sidebar, type TabId } from "./sidebar"
import { DashboardPanel } from "./panels/dashboard-panel"
import { PredictionPanel } from "./panels/prediction-panel"
import { PerformancePanel } from "./panels/performance-panel"
import { ExplorerPanel } from "./panels/explorer-panel"
import { AboutPanel } from "./panels/about-panel"

const TAB_META: Record<TabId, { title: string; sub: string }> = {
  dashboard: {
    title: "Workforce Overview",
    sub: "Attrition signals across the organization",
  },
  prediction: {
    title: "Attrition Risk Predictor",
    sub: "Score an individual employee's likelihood of leaving",
  },
  performance: {
    title: "Model Performance",
    sub: "How the logistic-regression classifier scores on held-out data",
  },
  explorer: {
    title: "Data Explorer",
    sub: "Browse, search and sort the full employee dataset",
  },
  about: {
    title: "About This Project",
    sub: "Methodology, features and responsible-use notes",
  },
}

export function AttritionApp() {
  const [tab, setTab] = useState<TabId>("dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)
  const { rows, isLoading, error } = useEmployees()

  const meta = TAB_META[tab]

  function selectTab(t: TabId) {
    setTab(t)
    setMobileOpen(false)
  }

  return (
    <div id="app">
      <Sidebar active={tab} onSelect={selectTab} open={mobileOpen} />
      <div
        className={`sidebar-scrim ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <main className="main">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              className="menu-btn"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle navigation"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h2>{meta.title}</h2>
              <div className="sub">{meta.sub}</div>
            </div>
          </div>
          <div className="topbar-right">
            <span className="pill">
              <span className="dot" />
              {isLoading ? "Loading data" : `${fmtNum(rows.length)} records`}
            </span>
            <span className="pill">Logistic Regression v1</span>
          </div>
        </header>

        <div className="content">
          {error ? (
            <div className="loading-wrap">
              <p>Could not load employee data. Please refresh the page.</p>
            </div>
          ) : isLoading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <p>Loading workforce dataset…</p>
            </div>
          ) : (
            <>
              {tab === "dashboard" && <DashboardPanel rows={rows} />}
              {tab === "prediction" && <PredictionPanel rows={rows} />}
              {tab === "performance" && <PerformancePanel />}
              {tab === "explorer" && <ExplorerPanel rows={rows} />}
              {tab === "about" && <AboutPanel rows={rows} />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
