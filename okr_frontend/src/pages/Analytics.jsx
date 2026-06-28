import { useEffect, useState } from "react";
import {
  getAnalyticsEmployees,
  searchAnalytics,
} from "../lib/api";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import {
  LabelList
} from "recharts";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Analytics() {
  const [employees, setEmployees] = useState([]);

  const years = Array.from(
    { length: 51 },
    (_, index) => 2050 - index
  );

  const [filters, setFilters] = useState({
    userId: "",
    year: "",
  });

  const [employee, setEmployee] = useState(null);

  const [performance, setPerformance] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const average =
performance
? (
    (
        performance.q1_percentage +
        performance.q2_percentage +
        performance.q3_percentage +
        performance.q4_percentage
    ) / 4
).toFixed(1)
: 0;

  async function loadEmployees() {
    try {
      const data = await getAnalyticsEmployees();

      setEmployees(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSearch() {
    if (!filters.userId) {
      alert("Please select employee.");
      return;
    }
  
    try {
      setLoading(true);
  
      // Clear previous result while loading
      setEmployee(null);
      setPerformance(null);
  
      const result = await searchAnalytics(
        filters.userId,
        filters.year
      );
  
      setEmployee(result.employee || null);
      setPerformance(result.performance || null);
  
    } catch (error) {
      console.error(error);
  
      setEmployee(null);
      setPerformance(null);
  
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  const chartData = [
    {
      quarter: "Q1",
      percentage: performance?.q1_percentage ?? 0,
    },
    {
      quarter: "Q2",
      percentage: performance?.q2_percentage ?? 0,
    },
    {
      quarter: "Q3",
      percentage: performance?.q3_percentage ?? 0,
    },
    {
      quarter: "Q4",
      percentage: performance?.q4_percentage ?? 0,
    },
  ];

  function handleReset() {
    setFilters({
      userId: "",
      year: "",
    });
  
    setEmployee(null);
    setPerformance(null);
  }
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <NavBar />
      <div className="flex-1 p-4 sm:p-8 mt-10">
        <div className="glass-card rounded-2xl p-5 sm:p-8 max-w-7xl mx-auto fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-(--text) text-center mb-8">
            OKR Analytics
          </h1>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-(--text) font-semibold mb-2">
                Employee
              </label>
              <select
                className="w-full px-4 py-2 border border-white/10 rounded-lg bg-white/5 text-(--text) focus:outline-none focus:border-white/30 transition-colors"
                value={filters.userId}
                onChange={(e) =>
                  setFilters({ ...filters, userId: e.target.value })
                }
              >
                <option value="">Select Employee</option>
                {employees
                  .filter((emp) => emp.userId)
                  .map((emp) => (
                    <option key={emp.userId} value={emp.userId}>
                      {emp.empName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-(--text) font-semibold mb-2">
                Year
              </label>
              <select
                className="w-full px-4 py-2 border border-white/10 rounded-lg bg-white/5 text-(--text) focus:outline-none focus:border-white/30 transition-colors"
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: Number(e.target.value) })
                }
              >
                  <option value="">
                    Select Year
                  </option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Buttons */}

<div className="flex justify-center gap-4 mb-8">

<button
  type="button"
  className="btn btn-primary min-w-[140px]"
  disabled={!filters.userId || !filters.year || loading}
  onClick={handleSearch}
>
  {loading ? "Searching..." : "Search"}
</button>

<button
  type="button"
  className="btn btn-secondary min-w-[140px]"
  disabled={loading}
  onClick={handleReset}
>
  Reset
</button>

</div>

          {/* Loading */}
          {loading && (
            <div className="text-center text-(--muted) py-10">Loading...</div>
          )}

          {/* Employee Information */}
          {employee && !loading && (
            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-(--text) mb-4">
                Employee Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-(--muted) text-sm mb-1">User ID</p>
                  <p className="text-(--text) font-medium">{employee.userId}</p>
                </div>
                <div>
                  <p className="text-(--muted) text-sm mb-1">Name</p>
                  <p className="text-(--text) font-medium">{employee.empName}</p>
                </div>
                <div>
                  <p className="text-(--muted) text-sm mb-1">Designation</p>
                  <p className="text-(--text) font-medium">{employee.empDesignation}</p>
                </div>
                <div>
                  <p className="text-(--muted) text-sm mb-1">Level</p>
                  <p className="text-(--text) font-medium">{employee.empLevel}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-(--muted) text-sm mb-1">Email</p>
                  <p className="text-(--text) font-medium">{employee.emailId}</p>
                </div>
              </div>
            </div>
          )}

          {/* Overall Performance */}
          {employee && !loading && (
            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5 sm:p-6 text-center">
              <p className="text-(--muted) text-sm mb-2">Overall Performance</p>
              <p className="text-5xl font-bold text-(--accent)">{average}%</p>
            </div>
          )}

          {/* Quarter Wise Performance Chart */}
          {performance && !loading && (
            <div className="mb-6 rounded-xl border border-white/10 overflow-hidden">
              <div className="bg-white/5 border-b border-white/10 px-4 sm:px-6 py-3">
                <h2 className="text-base font-semibold text-(--text) text-center">
                  Quarter Wise Performance ({filters.year})
                </h2>
              </div>
              <div className="p-5 sm:p-8 flex justify-center">
                <div style={{ width: "90%", height: 420 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="quarter" stroke="var(--muted)" tick={{ fill: "var(--text)" }} />
                      <YAxis domain={[0, 100]} stroke="var(--muted)" tick={{ fill: "var(--text)" }} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Completion"]}
                        contentStyle={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          color: "var(--text)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke="var(--accent)"
                        strokeWidth={4}
                        dot={{ r: 7 }}
                        activeDot={{ r: 9 }}
                      >
                        <LabelList
                          dataKey="percentage"
                          position="top"
                          style={{ fill: "var(--text)", fontSize: 13 }}
                        />
                      </Line>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Quarter Comments */}
          {performance && !loading && (
            <div className="mb-6 rounded-xl border border-white/10 overflow-hidden">
              <div className="bg-white/5 border-b border-white/10 px-4 sm:px-6 py-3">
                <h2 className="text-base font-semibold text-(--text) text-center">
                  Quarter Comments
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="border-r border-white/10 px-4 py-3 text-left text-(--text) font-semibold w-28">
                        Quarter
                      </th>
                      <th className="px-4 py-3 text-left text-(--text) font-semibold">
                        Comment
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {["q1", "q2", "q3", "q4"].map((q, i) => (
                      <tr
                        key={q}
                        className={`hover:bg-white/5 transition-colors ${i < 3 ? "border-b border-white/10" : ""}`}
                      >
                        <td className="border-r border-white/10 px-4 py-3 text-(--text) font-semibold">
                          {q.toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-(--muted) text-sm">
                          {performance[`${q}_comment`] || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}