"use client"

import type { Employee } from "@/lib/types"
import { MODEL } from "@/lib/model"
import { fmtNum } from "@/lib/format"

export function AboutPanel({ rows }: { rows: Employee[] }) {
  const m = MODEL.metrics
  return (
    <div className="tab-panel">
      <div className="about-grid">
        <div>
          <div className="about-card">
            <h3>Workforce Attrition Intelligence</h3>
            <p>
              This suite helps People &amp; Culture teams understand <b>why</b> employees leave and
              <b> who</b> is most at risk, so retention efforts can be targeted before resignations
              happen. It combines an interactive analytics dashboard, an individual risk predictor,
              and a full data explorer over a workforce of{" "}
              <b>{fmtNum(rows.length)}</b> employees.
            </p>
            <p>
              The predictor is powered by a <b>logistic-regression</b> classifier trained on
              historical employee records. Each feature is standardized, and the model outputs a
              calibrated probability of attrition along with the individual factors driving that
              score.
            </p>

            <h3 style={{ marginTop: 22 }}>Methodology</h3>
            <ul>
              <li>
                <b>Features:</b> {fmtNum(MODEL.feature_names.length)} inputs spanning demographics
                (age, gender, marital status), role context (department, job title, work mode),
                engagement (satisfaction, training hours, overtime) and compensation.
              </li>
              <li>
                <b>Preprocessing:</b> numeric features scaled with <code>StandardScaler</code>;
                categorical features one-hot encoded.
              </li>
              <li>
                <b>Model:</b> logistic regression trained on{" "}
                {fmtNum(m.train_size)} samples and evaluated on {fmtNum(m.test_size)} held-out
                samples.
              </li>
              <li>
                <b>Scoring:</b> the risk gauge shows the predicted probability; contribution bars
                decompose the log-odds so you can see which attributes raised or lowered risk.
              </li>
            </ul>

            <div className="callout">
              <b>Performance snapshot —</b> Accuracy {(m.accuracy * 100).toFixed(1)}%, Precision{" "}
              {(m.precision * 100).toFixed(1)}%, Recall {(m.recall * 100).toFixed(1)}%, ROC AUC{" "}
              {m.auc.toFixed(3)}. See the Model Performance tab for the confusion matrix, ROC curve
              and feature importances.
            </div>

            <div className="callout coral">
              <b>Responsible use —</b> Predictions are decision-support, not verdicts. Scores are
              probabilistic and reflect historical patterns that may encode bias. Never use this
              tool as the sole basis for employment decisions; pair it with human judgment and fair,
              transparent HR practices.
            </div>
          </div>
        </div>

        <div className="about-side">
          <div className="about-card">
            <h3>At a Glance</h3>
            <div className="info-list">
              <Row label="Employees" value={fmtNum(rows.length)} />
              <Row label="Model" value="Logistic Regression" />
              <Row label="Features" value={fmtNum(MODEL.feature_names.length)} />
              <Row label="Accuracy" value={(m.accuracy * 100).toFixed(1) + "%"} />
              <Row label="ROC AUC" value={m.auc.toFixed(3)} />
            </div>
          </div>

          <div className="about-card">
            <h3>Built With</h3>
            <div>
              <span className="tag">Next.js</span>
              <span className="tag">React 19</span>
              <span className="tag">TypeScript</span>
              <span className="tag">Chart.js</span>
              <span className="tag">SWR</span>
              <span className="tag">Logistic Regression</span>
            </div>
          </div>

          <div className="about-card">
            <h3>How to Use</h3>
            <ul style={{ marginBottom: 0 }}>
              <li>Filter the dashboard to segment the workforce.</li>
              <li>Score a profile in the Risk Predictor.</li>
              <li>Inspect model quality under Model Performance.</li>
              <li>Search and export records in Data Explorer.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
