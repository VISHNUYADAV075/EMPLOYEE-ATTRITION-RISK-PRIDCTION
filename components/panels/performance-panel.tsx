"use client"

import { MODEL } from "@/lib/model"
import { COLORS, GRID } from "@/lib/chart-theme"
import { ChartBox } from "@/components/chart-box"
import { fmtNum, humanFeatureName } from "@/lib/format"

export function PerformancePanel() {
  const m = MODEL.metrics
  const cm = m.confusion_matrix // [[TN, FP],[FN, TP]]
  const tn = cm[0][0]
  const fp = cm[0][1]
  const fn = cm[1][0]
  const tp = cm[1][1]

  const roc = MODEL.roc_points

  // top coefficients by magnitude
  const coefs = MODEL.feature_names
    .map((f, i) => ({ f, c: MODEL.coef[i] }))
    .sort((a, b) => Math.abs(b.c) - Math.abs(a.c))
    .slice(0, 12)
    .reverse()

  return (
    <div className="tab-panel">
      <div className="metric-grid">
        <Metric label="Accuracy" value={(m.accuracy * 100).toFixed(1) + "%"} />
        <Metric label="Precision" value={(m.precision * 100).toFixed(1) + "%"} />
        <Metric label="Recall" value={(m.recall * 100).toFixed(1) + "%"} />
        <Metric label="F1 Score" value={(m.f1 * 100).toFixed(1) + "%"} />
        <Metric label="ROC AUC" value={m.auc.toFixed(3)} />
      </div>

      <div className="charts-grid">
        <div className="chart-card span-5">
          <h3>Confusion Matrix</h3>
          <div className="chart-sub">Predictions on the held-out test set</div>
          <div className="cm-grid">
            <div className="cm-cell cm-head" />
            <div className="cm-cell cm-head">Pred: Stay</div>
            <div className="cm-cell cm-head">Pred: Leave</div>
            <div className="cm-cell cm-head" style={{ writingMode: "vertical-rl" }}>
              Actual: Stay
            </div>
            <div className="cm-cell cm-tn">
              <div className="cm-n">{fmtNum(tn)}</div>
              <div className="cm-l">True Neg</div>
            </div>
            <div className="cm-cell cm-fp">
              <div className="cm-n">{fmtNum(fp)}</div>
              <div className="cm-l">False Pos</div>
            </div>
            <div className="cm-cell cm-head" style={{ writingMode: "vertical-rl" }}>
              Actual: Leave
            </div>
            <div className="cm-cell cm-fn">
              <div className="cm-n">{fmtNum(fn)}</div>
              <div className="cm-l">False Neg</div>
            </div>
            <div className="cm-cell cm-tp">
              <div className="cm-n">{fmtNum(tp)}</div>
              <div className="cm-l">True Pos</div>
            </div>
          </div>
        </div>

        <div className="chart-card span-7">
          <h3>ROC Curve</h3>
          <div className="chart-sub">True-positive vs. false-positive rate (AUC = {m.auc.toFixed(3)})</div>
          <div className="chart-wrap">
            <ChartBox
              type="line"
              data={{
                labels: roc.map((p) => p[0].toFixed(3)),
                datasets: [
                  {
                    label: "ROC",
                    data: roc.map((p) => p[1]),
                    borderColor: COLORS.amber,
                    backgroundColor: "rgba(240,169,59,0.12)",
                    fill: true,
                    tension: 0.2,
                    pointRadius: 0,
                    borderWidth: 2,
                  },
                  {
                    label: "Random",
                    data: roc.map((p) => p[0]),
                    borderColor: COLORS.dim,
                    borderDash: [6, 6],
                    pointRadius: 0,
                    fill: false,
                    borderWidth: 1.5,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "top" as const } },
                scales: {
                  x: {
                    title: { display: true, text: "False Positive Rate", color: "#6B7593" },
                    grid: { color: GRID },
                    ticks: { color: "#9BA6C0", maxTicksLimit: 6 },
                  },
                  y: {
                    title: { display: true, text: "True Positive Rate", color: "#6B7593" },
                    grid: { color: GRID },
                    ticks: { color: "#9BA6C0" },
                    min: 0,
                    max: 1,
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card span-7">
          <h3>Feature Importance</h3>
          <div className="chart-sub">Standardized logistic-regression coefficients (top 12 by magnitude)</div>
          <div className="chart-wrap" style={{ minHeight: 360 }}>
            <ChartBox
              type="bar"
              data={{
                labels: coefs.map((c) => humanFeatureName(c.f)),
                datasets: [
                  {
                    label: "Coefficient",
                    data: coefs.map((c) => +c.c.toFixed(3)),
                    backgroundColor: coefs.map((c) => (c.c >= 0 ? COLORS.coral : COLORS.teal)),
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
                  x: { grid: { color: GRID }, ticks: { color: "#9BA6C0" } },
                  y: { grid: { display: false }, ticks: { color: "#9BA6C0" } },
                },
              }}
            />
          </div>
        </div>

        <div className="chart-card span-5">
          <h3>Model Details</h3>
          <div className="chart-sub">Configuration and training summary</div>
          <div className="info-list" style={{ marginTop: 6 }}>
            <Info label="Algorithm" value="Logistic Regression" />
            <Info label="Features" value={fmtNum(MODEL.feature_names.length)} />
            <Info label="Numeric features" value={fmtNum(MODEL.num_cols.length)} />
            <Info label="Categorical features" value={fmtNum(MODEL.cat_cols.length)} />
            <Info label="Training samples" value={fmtNum(m.train_size)} />
            <Info label="Test samples" value={fmtNum(m.test_size)} />
            <Info label="Preprocessing" value="StandardScaler" />
            <Info label="Intercept" value={MODEL.intercept.toFixed(3)} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-card">
      <div className="m-val">{value}</div>
      <div className="m-label">{label}</div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
