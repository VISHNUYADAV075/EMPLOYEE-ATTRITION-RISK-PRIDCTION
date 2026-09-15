"use client"

export type TabId =
  | "dashboard"
  | "prediction"
  | "performance"
  | "explorer"
  | "about"

const ICONS: Record<TabId, React.ReactNode> = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  prediction: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 1 0 10 10" />
      <path d="M12 6v6l4 2" />
      <path d="M16 2l4 4-4 4" />
    </svg>
  ),
  performance: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-6 3 4 5-8" />
    </svg>
  ),
  explorer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  about: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
}

const ITEMS: { id: TabId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "prediction", label: "Risk Predictor" },
  { id: "performance", label: "Model Performance" },
  { id: "explorer", label: "Data Explorer" },
  { id: "about", label: "About" },
]

export function Sidebar({
  active,
  onSelect,
  open,
}: {
  active: TabId
  onSelect: (t: TabId) => void
  open: boolean
}) {
  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="brand">
        <div className="brand-mark">WA</div>
        <div className="brand-text">
          <h1>Workforce Attrition</h1>
          <p>Intelligence Suite</p>
        </div>
      </div>
      <nav className="nav">
        <div className="nav-label">Analytics</div>
        {ITEMS.map((it) => (
          <button
            key={it.id}
            className={`nav-item ${active === it.id ? "active" : ""}`}
            onClick={() => onSelect(it.id)}
            aria-current={active === it.id ? "page" : undefined}
          >
            {ICONS[it.id]}
            {it.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <b>People Analytics</b>
        <br />
        Predictive attrition modeling for proactive retention.
      </div>
    </aside>
  )
}
