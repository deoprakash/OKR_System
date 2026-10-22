import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell
} from "recharts";
import { getEmployeeOKRs, listEmployees } from "../lib/api";
import Select from "./ui/Select";
import NavBar from "./NavBar";
import Footer from "./Footer";
import OKRInsightAgent from "./OKRInsightAgent";
import { TrendyAIChatbotIcon } from "./TrendyAIChatbotIcon";

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
const VELOCITY_COLORS = ['#06b6d4', '#3b82f6', '#0ea5e9', '#6366f1', '#14b8a6', '#0284c7'];

// Custom Tooltip for Radar chart
const RadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}>
        {payload.map((entry, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color }}></div>
            <span style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>{entry.name}:</span>
            <span style={{ fontSize: 12, color: '#1e293b', fontWeight: 700 }}>{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function OKRCard({ okr, idx, onSelect }) {
  let latestQ = 1;
  let latestVal = 0;
  for (let q = 1; q <= 4; q++) {
    if (okr[`q${q}_percentage`] != null && okr[`q${q}_percentage`] !== "") {
      latestVal = Number(okr[`q${q}_percentage`]);
      latestQ = q;
    }
  }
  const expected = latestQ * 25;
  const status = latestVal >= expected ? 'On Track' : 'At Risk';
  const statusColor = status === 'On Track' ? 'text-emerald-400' : 'text-rose-400';
  
  return (
    <div 
      className="bg-slate-800 rounded-2xl p-5 border border-slate-700 hover:border-slate-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full"
      onClick={onSelect}
    >
       <div>
         <div className="flex justify-between items-start mb-4 gap-3">
           <h3 className="text-white font-semibold text-sm line-clamp-2 flex-1">{okr.okrDesc || "Untitled OKR"}</h3>
           <span className="bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shrink-0">L{okr.level}</span>
         </div>
         <div className="flex items-end gap-2 mb-3">
           <span className="text-3xl font-bold text-white">{latestVal}%</span>
           <span className={`text-sm font-medium ${statusColor}`}>{status}</span>
         </div>
         <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
           <div className={`h-full rounded-full transition-all ${status === 'On Track' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(100, latestVal)}%` }}></div>
         </div>
       </div>
       <div className="mt-5 flex items-center justify-between border-t border-slate-700 pt-3">
         <span className="text-xs text-slate-400">Q{latestQ} Last Updated</span>
         <span className="text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">View Details &rarr;</span>
       </div>
    </div>
  )
}

export default function NonAdminDashboard({ userId, userName = "Employee" }) {
  const [okrs, setOkrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOkrIndex, setSelectedOkrIndex] = useState("all");
  const [error, setError] = useState("");
  const [agentOpen, setAgentOpen] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [selectedUserName, setSelectedUserName] = useState(userName);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await listEmployees();
        setEmployees(res.data || []);
      } catch (err) {
        console.error("Failed to load employees:", err);
      }
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    async function loadOKRs() {
      if (!selectedUserId) return;
      try {
        setLoading(true);
        const res = await getEmployeeOKRs(selectedUserId);
        setOkrs(res.data || []);
        setSelectedOkrIndex("all");
      } catch (err) {
        console.error("Failed to load OKRs:", err);
        setError("Failed to load OKRs.");
      } finally {
        setLoading(false);
      }
    }
    loadOKRs();
  }, [selectedUserId]);

  const selectedOkr = selectedOkrIndex !== "all" ? okrs[Number(selectedOkrIndex)] : null;

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const data = [
      { name: "Q1", expected: 25 }, 
      { name: "Q2", expected: 50 }, 
      { name: "Q3", expected: 75 }, 
      { name: "Q4", expected: 100 }
    ];
    
    if (selectedOkr) {
      const q1 = selectedOkr.q1_percentage != null && selectedOkr.q1_percentage !== '' ? Number(selectedOkr.q1_percentage) : null;
      const q2 = selectedOkr.q2_percentage != null && selectedOkr.q2_percentage !== '' ? Number(selectedOkr.q2_percentage) : null;
      const q3 = selectedOkr.q3_percentage != null && selectedOkr.q3_percentage !== '' ? Number(selectedOkr.q3_percentage) : null;
      const q4 = selectedOkr.q4_percentage != null && selectedOkr.q4_percentage !== '' ? Number(selectedOkr.q4_percentage) : null;
      
      data[0].progress = q1;
      data[1].progress = q2;
      data[2].progress = q3;
      data[3].progress = q4;
      
      data[0].velocity = q1 !== null ? Math.max(0, q1) : 0;
      data[1].velocity = q2 !== null && q1 !== null ? Math.max(0, q2 - q1) : 0;
      data[2].velocity = q3 !== null && q2 !== null ? Math.max(0, q3 - q2) : 0;
      data[3].velocity = q4 !== null && q3 !== null ? Math.max(0, q4 - q3) : 0;

      // Prediction logic
      let lastQIndex = -1;
      if (q4 !== null) lastQIndex = 3;
      else if (q3 !== null) lastQIndex = 2;
      else if (q2 !== null) lastQIndex = 1;
      else if (q1 !== null) lastQIndex = 0;

      if (selectedOkr.forecastTarget && selectedOkr.forecastValue !== null) {
        const qIndex = parseInt(selectedOkr.forecastTarget.replace('Q', '')) - 1;
        if (qIndex > lastQIndex && qIndex < 4 && lastQIndex >= 0) {
          data[lastQIndex].prediction = data[lastQIndex].progress;
          for (let i = lastQIndex + 1; i <= qIndex; i++) {
            if (i === qIndex) {
              data[i].prediction = selectedOkr.forecastValue;
            } else {
              const steps = qIndex - lastQIndex;
              const diff = selectedOkr.forecastValue - data[lastQIndex].progress;
              data[i].prediction = Number((data[lastQIndex].progress + (diff / steps) * (i - lastQIndex)).toFixed(1));
            }
          }
        }
      } else if (lastQIndex >= 0 && lastQIndex < 3) {
        let totalProgress = data[lastQIndex].progress;
        let avgVelocity = totalProgress / (lastQIndex + 1);
        data[lastQIndex].prediction = totalProgress; 
        for (let i = lastQIndex + 1; i < 4; i++) {
          data[i].prediction = Number(Math.min(100, data[i - 1].prediction + avgVelocity).toFixed(1));
        }
      }
    } else {
      okrs.forEach((okr, idx) => {
        const q1 = okr.q1_percentage != null && okr.q1_percentage !== '' ? Number(okr.q1_percentage) : null;
        const q2 = okr.q2_percentage != null && okr.q2_percentage !== '' ? Number(okr.q2_percentage) : null;
        const q3 = okr.q3_percentage != null && okr.q3_percentage !== '' ? Number(okr.q3_percentage) : null;
        const q4 = okr.q4_percentage != null && okr.q4_percentage !== '' ? Number(okr.q4_percentage) : null;
        
        data[0][`OKR ${idx + 1}`] = q1;
        data[1][`OKR ${idx + 1}`] = q2;
        data[2][`OKR ${idx + 1}`] = q3;
        data[3][`OKR ${idx + 1}`] = q4;

        data[0][`OKR ${idx + 1} Vel`] = q1 !== null ? Math.max(0, q1) : 0;
        data[1][`OKR ${idx + 1} Vel`] = q2 !== null && q1 !== null ? Math.max(0, q2 - q1) : 0;
        data[2][`OKR ${idx + 1} Vel`] = q3 !== null && q2 !== null ? Math.max(0, q3 - q2) : 0;
        data[3][`OKR ${idx + 1} Vel`] = q4 !== null && q3 !== null ? Math.max(0, q4 - q3) : 0;
      });
    }
    return data;
  }, [okrs, selectedOkr]);

  const latestComment = useMemo(() => {
    if (!selectedOkr) return null;
    for (let q = 4; q >= 1; q--) {
      if (selectedOkr[`q${q}_comment`]) {
        return { quarter: `Q${q}`, text: selectedOkr[`q${q}_comment`] };
      }
    }
    return null;
  }, [selectedOkr]);

  // Single OKR metrics
  const singleOkrMetrics = useMemo(() => {
    if (!selectedOkr) return null;
    let latestQ = 1;
    let latestVal = 0;
    for (let q = 1; q <= 4; q++) {
      if (selectedOkr[`q${q}_percentage`] != null && selectedOkr[`q${q}_percentage`] !== "") {
        latestVal = Number(selectedOkr[`q${q}_percentage`]);
        latestQ = q;
      }
    }
    const expected = latestQ * 25;
    const status = latestVal >= expected ? 'On Track' : 'At Risk';
    return { latestVal, status, latestQ };
  }, [selectedOkr]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Loading your OKR workspace...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <NavBar />
      <div
        className="flex-1 py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300"
        style={{ marginRight: agentOpen ? '500px' : '0' }}
      >
        <div className="mx-auto max-w-[1400px]">
          
          {/* Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {selectedUserId === userId ? "My OKR Performance" : `${selectedUserName}'s OKR Performance`}
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Track goals, monitor progress, and review quarterly updates.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-56 relative z-20">
                <Select
                  value={selectedUserId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedUserId(val);
                    const emp = employees.find(emp => emp.userId === val);
                    if (emp) setSelectedUserName(emp.empName);
                  }}
                >
                  {employees.length === 0 && (
                    <option value={userId}>{userName}</option>
                  )}
                  {employees.map(emp => (
                    <option key={emp.userId} value={emp.userId}>
                      {emp.empName} {emp.empLevel ? `(L${emp.empLevel})` : ""}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-full sm:w-56 relative z-20">
                <Select
                  value={selectedOkrIndex}
                  onChange={(e) => setSelectedOkrIndex(e.target.value)}
                >
                  <option value="all">All OKRs Overview</option>
                  {okrs.map((okr, idx) => (
                    <option key={idx} value={idx}>
                      {okr.okrDesc ? (okr.okrDesc.length > 40 ? okr.okrDesc.substring(0, 40) + '...' : okr.okrDesc) : `OKR ${idx + 1}`}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Bottom Row: Dynamic Content based on selection */}
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden mb-8">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 opacity-5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
            
            <div className="relative z-10">
              {selectedOkrIndex === "all" ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">{selectedUserId === userId ? "Your" : `${selectedUserName}'s`} OKRs Portfolio</h2>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[11px] text-slate-400 font-medium">On Track (≥ Q × 25%)</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[11px] text-slate-400 font-medium">At Risk (&lt; Q × 25%)</span></div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-medium mt-0.5">{okrs.length} Active OKRs</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {okrs.map((okr, idx) => (
                      <OKRCard 
                        key={idx} 
                        okr={okr} 
                        idx={idx} 
                        onSelect={() => setSelectedOkrIndex(String(idx))} 
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-6">Single OKR Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-inner">
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Latest Progress</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-white">{singleOkrMetrics?.latestVal}%</span>
                        <span className="text-sm text-slate-400 font-medium">Q{singleOkrMetrics?.latestQ} value</span>
                      </div>
                      <div className="mt-4 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, Number(singleOkrMetrics?.latestVal))}%` }}></div>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-inner flex flex-col justify-center">
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Expected Target</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold text-slate-300">{singleOkrMetrics?.latestQ * 25}%</span>
                        <span className="text-sm text-slate-400 font-medium">by Q{singleOkrMetrics?.latestQ}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-400">Target grows 25% each quarter</p>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-inner flex flex-col justify-center relative overflow-hidden">
                      <div className={`absolute right-0 top-0 w-2 h-full ${singleOkrMetrics?.status === 'On Track' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Current Status</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-extrabold ${singleOkrMetrics?.status === 'On Track' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {singleOkrMetrics?.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-400">
                        {singleOkrMetrics?.status === 'On Track' ? 'Exceeding or meeting expectations' : 'Needs immediate attention'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Main Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Left Panel: OKR Radar / Single Horizontal Bar */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-[420px]">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  {selectedOkrIndex !== "all" ? "Quarterly Progress" : "OKR Radar Overview"}
                </h2>
              </div>
              {selectedOkrIndex !== "all" ? (
                // Single OKR: Horizontal Progress Bars per Quarter
                <div className="flex-1 flex flex-col justify-center gap-4 pt-2">
                  {[1,2,3,4].map(q => {
                    const val = Number(selectedOkr?.[`q${q}_percentage`] || 0);
                    const expected = q * 25;
                    const onTrack = val >= expected;
                    const hasData = selectedOkr?.[`q${q}_percentage`] != null && selectedOkr?.[`q${q}_percentage`] !== '';
                    return (
                      <div key={q}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Q{q}</span>
                          <div className="flex items-center gap-2">
                            {hasData && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${onTrack ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                {onTrack ? 'On Track' : 'At Risk'}
                              </span>
                            )}
                            <span className="text-sm font-bold text-slate-700">{hasData ? `${val}%` : '—'}</span>
                          </div>
                        </div>
                        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-visible">
                          {/* Expected target marker */}
                          <div className="absolute top-0 h-full border-r-2 border-slate-400 border-dashed z-10" style={{ left: `${expected}%` }}></div>
                          {/* Actual progress */}
                          {hasData && (
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${onTrack ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'}`}
                              style={{ width: `${Math.min(100, val)}%` }}
                            ></div>
                          )}
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-slate-400">0%</span>
                          <span className="text-[10px] text-slate-400">Target: {expected}%</span>
                          <span className="text-[10px] text-slate-400">100%</span>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-[10px] text-slate-400 text-center mt-1">Dashed line = quarterly target benchmark</p>
                </div>
              ) : (
                // All OKRs: Heatmap Scorecard
                <div className="flex-1 overflow-y-auto">
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_56px_56px_56px_56px] gap-2 mb-2 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OKR</span>
                    {['Q1','Q2','Q3','Q4'].map(q => (
                      <span key={q} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">{q}</span>
                    ))}
                  </div>
                  {/* Rows */}
                  <div className="space-y-2 px-1">
                    {okrs.map((okr, idx) => {
                      const label = okr.okrDesc
                        ? (okr.okrDesc.length > 28 ? okr.okrDesc.substring(0, 28) + '…' : okr.okrDesc)
                        : `OKR ${idx + 1}`;
                      return (
                        <div
                          key={idx}
                          className="grid grid-cols-[1fr_56px_56px_56px_56px] gap-2 items-center cursor-pointer group"
                          onClick={() => setSelectedOkrIndex(String(idx))}
                        >
                          {/* OKR Label */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[idx % COLORS.length] }}></div>
                            <span className="text-xs font-medium text-slate-700 truncate group-hover:text-blue-600 transition-colors">{label}</span>
                          </div>
                          {/* Quarter cells */}
                          {[1,2,3,4].map(q => {
                            const raw = okr[`q${q}_percentage`];
                            const hasData = raw != null && raw !== '';
                            const val = Number(raw || 0);
                            const expected = q * 25;
                            const onTrack = val >= expected;
                            const close = !onTrack && val >= expected - 10;

                            let cellBg, cellText;
                            if (!hasData) {
                              cellBg = 'bg-slate-100 text-slate-400';
                            } else if (onTrack) {
                              cellBg = 'bg-emerald-100 text-emerald-700';
                            } else if (close) {
                              cellBg = 'bg-amber-100 text-amber-700';
                            } else {
                              cellBg = 'bg-rose-100 text-rose-600';
                            }

                            return (
                              <div key={q} className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold ${cellBg} transition-all`}>
                                {hasData ? `${val}%` : '–'}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-4 px-1 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100"></div><span className="text-[10px] text-slate-500 font-medium">On Track</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-100"></div><span className="text-[10px] text-slate-500 font-medium">Close</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-100"></div><span className="text-[10px] text-slate-500 font-medium">At Risk</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-slate-100"></div><span className="text-[10px] text-slate-500 font-medium">No Data</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Middle Panel: Line/Area Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-[420px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Progress Graph</h2>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  {selectedOkrIndex !== "all" ? (
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Area type="monotone" dataKey="progress" name="Actual Progress %" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="expected" name="Expected Target %" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
                      <Line type="monotone" dataKey="prediction" name="Predicted Progress %" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </ComposedChart>
                  ) : (
                    <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line type="monotone" dataKey="expected" name="Expected Target %" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={false} />
                      {okrs.map((okr, idx) => (
                        <Line key={idx} type="monotone" dataKey={`OKR ${idx + 1}`} stroke={COLORS[idx % COLORS.length]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                      ))}
                    </ComposedChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Panel: Updates & Risks */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col h-[420px] overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="flex justify-between items-center mb-6 mt-2">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Weekly TURN</h2>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {selectedOkrIndex === "all" ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <p className="text-slate-600 font-medium">Select a specific OKR</p>
                    <p className="text-slate-400 text-sm mt-2">Choose an OKR from the dropdown or click a card below to view its detailed weekly updates and status.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${singleOkrMetrics?.status === 'On Track' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <p className={`text-sm font-bold ${singleOkrMetrics?.status === 'On Track' ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {singleOkrMetrics?.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Latest Update</p>
                      {latestComment ? (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 relative">
                          <span className="absolute -top-2.5 right-4 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {latestComment.quarter}
                          </span>
                          <p className="text-sm text-slate-700 leading-relaxed italic">
                            "{latestComment.text}"
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                          No comments available for this OKR.
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Next Steps</p>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        Continue monitoring quarterly progress and update targets accordingly. Review alignment with organizational goals.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>



        </div>
      </div>
      <Footer />
      <OKRInsightAgent
        okrs={okrs}
        userName={userName}
        targetUserName={selectedUserName}
        isOpen={agentOpen}
        onOpen={() => setAgentOpen(true)}
        onClose={() => setAgentOpen(false)}
        isAdmin={false}
      />
    </div>
  );
}
