/**
 * insightEngine.js
 * Client-side insight engine.
 * Runs deterministic rule-based checks on OKR data BEFORE calling the LLM.
 * This gives instant local insights and enriches the LLM prompt.
 */

const QUARTER_TARGETS = { 1: 25, 2: 50, 3: 75, 4: 100 };

/**
 * Get the latest updated quarter and value for an OKR.
 */
export function getLatestQuarter(okr) {
  let latestQ = null;
  let latestVal = 0;
  for (let q = 1; q <= 4; q++) {
    const val = okr[`q${q}_percentage`];
    if (val != null && val !== "") {
      latestQ = q;
      latestVal = Number(val);
    }
  }
  return { latestQ, latestVal };
}

/**
 * Compute status for a single OKR.
 * Returns: 'on_track' | 'at_risk' | 'critical' | 'no_data'
 */
export function getOKRStatus(okr) {
  const { latestQ, latestVal } = getLatestQuarter(okr);
  if (latestQ === null) return "no_data";
  const expected = QUARTER_TARGETS[latestQ];
  if (latestVal >= expected) return "on_track";
  if (latestVal >= expected - 10) return "at_risk";
  return "critical";
}

/**
 * Run instant, deterministic local insights on OKR data.
 * Returns array of insight objects before any LLM call.
 * @param {Array} okrs
 * @returns {Array<{type, title, message}>}
 */
export function runLocalInsights(okrs) {
  if (!okrs || !okrs.length) return [];
  const insights = [];

  const criticalOkrs = okrs.filter(o => getOKRStatus(o) === "critical");
  const atRiskOkrs   = okrs.filter(o => getOKRStatus(o) === "at_risk");
  const onTrackOkrs  = okrs.filter(o => getOKRStatus(o) === "on_track");
  const noDataOkrs   = okrs.filter(o => getOKRStatus(o) === "no_data");

  // Warnings
  criticalOkrs.forEach(okr => {
    const { latestQ, latestVal } = getLatestQuarter(okr);
    const expected = QUARTER_TARGETS[latestQ];
    insights.push({
      type: "warning",
      title: "Critical: OKR Behind Target",
      message: `"${okr.okrDesc || "OKR"}" is at ${latestVal}% in Q${latestQ}, significantly below the ${expected}% target.`,
    });
  });

  // Alerts
  atRiskOkrs.forEach(okr => {
    const { latestQ, latestVal } = getLatestQuarter(okr);
    const expected = QUARTER_TARGETS[latestQ];
    insights.push({
      type: "alert",
      title: "At Risk: Close to Target",
      message: `"${okr.okrDesc || "OKR"}" is at ${latestVal}% vs the ${expected}% Q${latestQ} target — needs attention.`,
    });
  });

  // Positive insight
  if (onTrackOkrs.length > 0) {
    const best = onTrackOkrs.reduce((a, b) => {
      return getLatestQuarter(a).latestVal >= getLatestQuarter(b).latestVal ? a : b;
    });
    const { latestQ, latestVal } = getLatestQuarter(best);
    insights.push({
      type: "insight",
      title: "Strong Performance",
      message: `"${best.okrDesc || "OKR"}" leads at ${latestVal}% in Q${latestQ}, exceeding its quarterly benchmark.`,
    });
  }

  // No data suggestion
  if (noDataOkrs.length > 0) {
    insights.push({
      type: "suggestion",
      title: "OKRs Without Updates",
      message: `${noDataOkrs.length} OKR${noDataOkrs.length > 1 ? "s have" : " has"} no quarterly data. Ask your manager to record progress.`,
    });
  }

  // Overall summary insight
  const total = okrs.length;
  const pct = Math.round((onTrackOkrs.length / total) * 100);
  if (total >= 2) {
    insights.push({
      type: pct >= 60 ? "insight" : "alert",
      title: "Overall Portfolio Health",
      message: `${onTrackOkrs.length} of ${total} OKRs (${pct}%) are on track this period.`,
    });
  }

  return insights;
}

/**
 * Quick-action suggestion chips shown in chat UI.
 */
export const QUICK_ACTIONS = [
  { id: "key-results", label: "🎯 Key Results", prompt: "What are the exact real Key Results for this employee's OKRs? Please fetch and list them." },
  { id: "manager", label: "👔 Reporting Manager", prompt: "Who is the reporting manager / senior for this employee?" },
  { id: "quarterly-values", label: "📈 Q1-Q4 Values", prompt: "What are the exact Q1, Q2, Q3, and Q4 percentage values and comments for this employee's OKRs?" },
  { id: "status",   label: "📊 OKR Status",          prompt: "Give me a quick summary of the overall OKR performance status." },
  { id: "risk",     label: "⚠️ What's at risk?",      prompt: "Which OKRs are at risk or behind target and why?" },
  { id: "best",     label: "🏆 Best performing OKR",  prompt: "Which OKR is performing the best?" },
  { id: "improve",  label: "💡 How to improve?",      prompt: "What concrete actions can be taken to improve at-risk OKRs?" },
];
