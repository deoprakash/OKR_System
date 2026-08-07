import React, { useEffect, useState } from "react";
import { getAnalyticsEmployees, getAnalyticsOKRs, searchAnalytics } from "../lib/api";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { SkeletonCard } from "../components/ui/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-card-md px-4 py-3 text-sm">
      <p className="font-semibold text-neutral-700 mb-1">{label}</p>
      <p className="text-brand-primary font-bold">{payload[0]?.value ?? 0}%</p>
    </div>
  );
};

const Analytics = () => {
  const [employees, setEmployees] = useState([]);
  const [okrOptions, setOkrOptions] = useState([]);
  const [years, setYears] = useState([]);
  const [allOkrs, setAllOkrs] = useState([]);
  const [filters, setFilters] = useState({ userId: "", year: "", selectedOKR: "ALL" });
  const [employee, setEmployee] = useState(null);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadEmployees(); }, []);

  async function loadOKRs(userId) {
    if (!userId) { setYears([]); setAllOkrs([]); setOkrOptions([]); return; }
    try {
      const data = await getAnalyticsOKRs(userId);
      setYears(["ALL", ...(data.years || [])]);
      setAllOkrs(data.okrs || []);
      setOkrOptions([]);
      setFilters(prev => ({ ...prev, year: "", selectedOKR: "ALL" }));
    } catch (err) { console.error(err); }
  }

  useEffect(() => { loadOKRs(filters.userId); }, [filters.userId]);

  async function loadEmployees() {
    try { const data = await getAnalyticsEmployees(); setEmployees(data); }
    catch (error) { console.error(error); }
  }

  async function handleSearch() {
    if (!filters.userId) { alert("Please select an employee."); return; }
    try {
      setLoading(true); setEmployee(null); setPerformances([]);
      const result = await searchAnalytics(filters.userId, filters.year, filters.selectedOKR);
      setEmployee(result.employee || null);
      setPerformances(result.performances || []);
    } catch (error) {
      console.error(error); setEmployee(null); setPerformances([]);
      alert(error.message);
    } finally { setLoading(false); }
  }

  function handleReset() {
    setFilters({ userId: "", year: "", selectedOKR: "ALL" });
    setEmployee(null); setPerformances([]);
  }

  const grouped = performances.reduce((acc, item) => {
    if (!acc[item.okrYear]) acc[item.okrYear] = [];
    acc[item.okrYear].push(item);
    return acc;
  }, {});

  const EMP_META = employee ? [
    { label: 'User ID', value: employee.userId },
    { label: 'Name', value: employee.empName },
    { label: 'Designation', value: employee.empDesignation },
    { label: 'Level', value: `Level ${employee.empLevel}` },
    { label: 'Email', value: employee.emailId },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <NavBar />
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Analytics Dashboard</h1>
            <p className="text-sm text-neutral-500">Track objective performance and historical progression across the organization.</p>
          </div>

          {/* Filter card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 mb-6">
            <h2 className="text-sm font-semibold text-neutral-700 mb-4">Search Parameters</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              <Select
                label="Employee"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              >
                <option value="">Select Employee</option>
                {employees.filter(emp => emp.userId).map(emp => (
                  <option key={emp.userId} value={emp.userId}>{emp.empName}</option>
                ))}
              </Select>

              <Select
                label="Year"
                value={filters.year}
                onChange={(e) => {
                  const y = e.target.value;
                  setFilters(prev => ({ ...prev, year: y, selectedOKR: "ALL" }));
                  if (y === "ALL") setOkrOptions(allOkrs);
                  else if (y) setOkrOptions(allOkrs.filter(o => o.okrYear === y));
                  else setOkrOptions([]);
                }}
              >
                <option value="">Select Year</option>
                {years.map(y => <option key={y} value={y}>{y === "ALL" ? "All Years" : y}</option>)}
              </Select>

              <Select
                label="Objective"
                value={filters.selectedOKR}
                onChange={(e) => setFilters({ ...filters, selectedOKR: e.target.value })}
              >
                <option value="ALL">Show All</option>
                {okrOptions.map(o => <option key={o.okrId} value={o.okrId}>{o.okrDesc}</option>)}
              </Select>
            </div>

            <div className="flex items-center gap-3 justify-end border-t border-neutral-100 pt-4">
              <Button variant="ghost" size="sm" onClick={handleReset} disabled={loading}>
                Reset
              </Button>
              <Button variant="primary" size="sm" onClick={handleSearch} disabled={!filters.userId || loading} loading={loading}>
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>

          {/* Employee profile strip */}
          <AnimatePresence>
            {employee && !loading && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6"
              >
                {EMP_META.map((m, i) => (
                  <div key={i} className="bg-white rounded-xl border border-neutral-200 shadow-card px-4 py-3">
                    <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">{m.label}</p>
                    <p className="font-semibold text-neutral-800 text-sm truncate" title={m.value}>{m.value}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {/* Empty state */}
          {!loading && !employee && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-card">
              <EmptyState
                icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                title="No data to display"
                description="Select an employee and click Generate Report to view OKR performance analytics."
              />
            </div>
          )}

          {/* Results */}
          {!loading && Object.entries(grouped).sort((a, b) => Number(b[0]) - Number(a[0])).map(([year, okrs]) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-light text-brand-primary font-bold text-sm border border-brand-border">
                  {year}
                </div>
                <h2 className="text-lg font-bold text-neutral-900">Annual Review</h2>
                <Badge variant="blue">{okrs.length} objective{okrs.length > 1 ? 's' : ''}</Badge>
              </div>

              <div className="space-y-5">
                {okrs.map((perf, index) => {
                  const avg = ((Number(perf.q1_percentage || 0) + Number(perf.q2_percentage || 0) + Number(perf.q3_percentage || 0) + Number(perf.q4_percentage || 0)) / 4).toFixed(1);
                  const chartData = [
                    { quarter: "Q1", percentage: perf.q1_percentage },
                    { quarter: "Q2", percentage: perf.q2_percentage },
                    { quarter: "Q3", percentage: perf.q3_percentage },
                    { quarter: "Q4", percentage: perf.q4_percentage },
                  ];
                  const avgNum = parseFloat(avg);
                  const avgColor = avgNum >= 75 ? 'text-success' : avgNum >= 50 ? 'text-warning' : 'text-danger';

                  return (
                    <div key={perf.okrId} className="bg-white rounded-2xl border border-neutral-200 shadow-card overflow-hidden">
                      {/* Card header */}
                      <div className="flex items-start justify-between px-6 py-5 border-b border-neutral-100">
                        <div>
                          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">Objective {index + 1}</p>
                          <h3 className="text-base font-bold text-neutral-900 max-w-xl">{perf.okrDesc}</h3>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-1">Avg Completion</p>
                          <p className={`text-3xl font-bold ${avgColor}`}>{avg}%</p>
                        </div>
                      </div>

                      {/* Chart */}
                      <div className="px-6 py-5 bg-neutral-50/50 border-b border-neutral-100">
                        <ResponsiveContainer width="100%" height={240}>
                          <LineChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                            <XAxis dataKey="quarter" axisLine={false} tickLine={false} dy={10} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 600 }} />
                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} dx={-5} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="percentage" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#2563EB' }}>
                              <LabelList dataKey="percentage" position="top" offset={10} fill="#64748B" fontSize={11} fontWeight="600" />
                            </Line>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Q insights */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-100">
                        {[1, 2, 3, 4].map(qNum => {
                          const comment = perf[`q${qNum}_comment`];
                          const pct = perf[`q${qNum}_percentage`];
                          return (
                            <div key={qNum} className="bg-white px-5 py-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-neutral-700">Q{qNum} Insights</span>
                                {pct != null && (
                                  <span className={`text-xs font-bold ${pct >= 75 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-danger'}`}>
                                    {pct}%
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-neutral-500 leading-relaxed">
                                {comment?.trim() || <span className="italic text-neutral-300">No notes provided.</span>}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Analytics;