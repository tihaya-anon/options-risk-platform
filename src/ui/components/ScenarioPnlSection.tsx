import type { I18nKey } from "../i18n";
import type { ScenarioPoint } from "../positions";

function linePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

export function ScenarioPnlSection({
  scenarios,
  t,
  accentColor,
  neutralColor,
}: {
  scenarios: ScenarioPoint[];
  t: (key: I18nKey) => string;
  accentColor: string;
  neutralColor: string;
}) {
  const width = 760;
  const height = 260;
  const pad = 28;
  const pnlValues = scenarios.map((scenario) => scenario.portfolioPnl);
  const minPnl = Math.min(...pnlValues);
  const maxPnl = Math.max(...pnlValues);
  const zeroY =
    height - pad - ((0 - minPnl) / Math.max(maxPnl - minPnl, 0.0001)) * (height - pad * 2);
  const toX = (index: number) =>
    pad + (index / Math.max(scenarios.length - 1, 1)) * (width - pad * 2);
  const toY = (pnl: number) =>
    height - pad - ((pnl - minPnl) / Math.max(maxPnl - minPnl, 0.0001)) * (height - pad * 2);

  const path = linePath(
    scenarios.map((scenario, index) => ({
      x: toX(index),
      y: toY(scenario.portfolioPnl),
    }))
  );

  return (
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("scenarioTitle")}</h2>
          <p>{t("scenarioDesc")}</p>
        </div>
      </div>

      <div className="scenario-layout">
        <article className="surface-card card">
          <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img">
            <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} className="chart-axis" />
            <line x1={pad} y1={pad} x2={pad} y2={height - pad} className="chart-axis" />
            <line x1={pad} y1={zeroY} x2={width - pad} y2={zeroY} stroke={neutralColor} strokeDasharray="6 6" />
            <path d={path} fill="none" stroke={accentColor} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            {scenarios.map((scenario, index) => (
              <circle
                key={scenario.spotChangePct}
                cx={toX(index)}
                cy={toY(scenario.portfolioPnl)}
                r="4.5"
                fill={accentColor}
                className="chart-dot"
              />
            ))}
          </svg>
          <div className="chart-axis-wrap">
            {scenarios.map((scenario, index) => (
              <div
                key={scenario.spotChangePct}
                className="chart-axis-label"
                style={{ left: `${toX(index)}px` }}
              >
                {(scenario.spotChangePct * 100).toFixed(0)}%
              </div>
            ))}
          </div>
        </article>

        <article className="surface-card card scenario-grid">
          {scenarios.map((scenario) => (
            <div key={scenario.spotChangePct} className="scenario-row">
              <span>
                {t("spotChange")} {(scenario.spotChangePct * 100).toFixed(0)}%
              </span>
              <strong>
                {t("portfolioPnl")} {scenario.portfolioPnl.toFixed(2)}
              </strong>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
