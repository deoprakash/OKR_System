import { useEffect, useState } from "react";
import {
  getAnalyticsEmployees,
  getAnalyticsOKRs,
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

const Analytics = () => {
  const [employees, setEmployees] = useState([]);
  const [okrOptions, setOkrOptions] = useState([]);
  const [years, setYears] = useState([]);
  const [allOkrs, setAllOkrs] = useState([]);

  const [filters, setFilters] = useState({
    userId: "",
    year: "",
    selectedOKR:"ALL",
  });

  const [employee, setEmployee] = useState(null);

  const [performances, setPerformances] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadOKRs(userId) {

    if (!userId) {
      setYears([]);
      setAllOkrs([]);
      setOkrOptions([]);
      return;
    }
  
    try {
  
      const data = await getAnalyticsOKRs(userId);
  
      setYears(["ALL", ...(data.years || [])]);
  
      setAllOkrs(data.okrs || []);
  
      setOkrOptions([]);
  
      setFilters(prev => ({
        ...prev,
        year: "",
        selectedOKR: "ALL",
      }));
  
    } catch (err) {
      console.error(err);
    }
  
  }

  useEffect(() => {
    loadOKRs(filters.userId);
  }, [filters.userId]);

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
      setPerformances([]);
  
      const result = await searchAnalytics(
        filters.userId,
        filters.year,
        filters.selectedOKR
      );
      console.log(result);
      
      setEmployee(result.employee || null);

      setPerformances(result.performances || []);
  
    } catch (error) {
      console.error(error);
  
      setEmployee(null);
      setPerformances([]);
  
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFilters({
      userId: "",
      year: "",
      selectedOKR: "ALL",
    });
  
    setEmployee(null);
    setPerformances([]);
  }

  const groupedPerformances = performances.reduce((acc, item) => {
    if (!acc[item.okrYear]) {
      acc[item.okrYear] = [];
    }
  
    acc[item.okrYear].push(item);
  
    return acc;
  }, {});
  
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <NavBar />
      <div className="flex-1 p-4 sm:p-8 mt-10">
        <div className="glass-card rounded-2xl p-5 sm:p-8 max-w-7xl mx-auto fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold text-(--text) text-center mb-8">
            OKR Analytics
          </h1>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-6 mb-6">
            <div className="">
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
                onChange={(e) => {
                  const selectedYear = e.target.value;

                  setFilters((prev) => ({
                    ...prev,
                    year: selectedYear,
                    selectedOKR: "ALL",
                  }));

                  if (selectedYear === "ALL") {
                    setOkrOptions(allOkrs);
                  } else if (selectedYear) {
                    setOkrOptions(
                      allOkrs.filter(
                        (okr) => okr.okrYear === selectedYear
                      )
                    );
                  } else {
                    setOkrOptions([]);
                  }
                }}
              >
                <option value="">Select Year</option>

                {years.map((year) => (
                  <option key={year} value={year}>
                    {year === "ALL" ? "All Years" : year}
                  </option>
                ))}
              </select>
              </div>
              <div>
                <label className="block text-(--text) font-semibold mb-2">Selected OKR</label>
                <select
                    value={filters.selectedOKR}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        selectedOKR: e.target.value,
                      })
                    }
                  >
                    <option value="ALL">Show All</option>

                    {okrOptions.map((okr) => (
                      <option
                      key={okr.okrId}
                      value={okr.okrId}
                    >
                      {okr.okrDesc}
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
              disabled={!filters.userId || loading}
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
          
          {/* OKR Title */}

                {Object.entries(groupedPerformances)
                  .sort((a, b) => Number(b[0]) - Number(a[0]))
                  .map(([year, okrs]) => (
                    <div key={year}>

                      <h2 className="text-2xl font-bold mb-6 text-center">
                        Year : {year}
                      </h2>

            {okrs.map((performance, index, year) => {
            const average = (
              (
                Number(performance.q1_percentage || 0) +
                Number(performance.q2_percentage || 0) +
                Number(performance.q3_percentage || 0) +
                Number(performance.q4_percentage || 0)
              ) / 4
            ).toFixed(1);

            const chartData = [
              { quarter: "Q1", percentage: performance.q1_percentage },
              { quarter: "Q2", percentage: performance.q2_percentage },
              { quarter: "Q3", percentage: performance.q3_percentage },
              { quarter: "Q4", percentage: performance.q4_percentage },
            ];

            return (
              <div key={performance.okrId} className="mb-10">

                {/* OKR Title */}

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-4">
                  <h2 className="text-xl font-bold text-left">
                   {index + 1}. {performance.okrDesc}
                  </h2>
                </div>

                {/* Overall */}

                <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5 text-center">
                  <p className="text-sm text-(--muted)">
                    Overall Performance
                  </p>

                  <p className="text-5xl font-bold text-(--accent)">
                    {average}%
                  </p>
                </div>

                {/* Chart */}

                <div className="mb-6 rounded-xl border border-white/10 overflow-hidden">
                  <div className="bg-white/5 border-b border-white/10 px-6 py-3">
                    <h2 className="text-base font-semibold text-center">
                      Quarter Wise Performance ({performance.okrYear})
                    </h2>
                  </div>

                  <div className="p-6">

                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />

                        <Line
                          dataKey="percentage"
                          stroke="var(--accent)"
                        >
                          <LabelList
                            dataKey="percentage"
                            position="top"
                          />
                        </Line>

                      </LineChart>
                    </ResponsiveContainer>

                  </div>
                </div>

                {/* Comments */}

                <div className="mb-8 rounded-xl border border-white/10 overflow-hidden">
                  <div className="bg-white/5 border-b border-white/10 px-6 py-3">
                    <h2 className="text-lg font-semibold text-center text-(--text)">
                      Quarter Comments
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 p-6">

                    {[
                      {
                        quarter: "Q1",
                        comment: performance.q1_comment,
                      },
                      {
                        quarter: "Q2",
                        comment: performance.q2_comment,
                      },
                      {
                        quarter: "Q3",
                        comment: performance.q3_comment,
                      },
                      {
                        quarter: "Q4",
                        comment: performance.q4_comment,
                      },
                    ].map((item) => (
                      <div
                        key={item.quarter}
                        className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm hover:shadow-md transition-all"
                      >
                        <h3 className="text-lg font-bold text-(--accent) mb-3 text-center">
                          {item.quarter}
                        </h3>

                        <div className="min-h-[90px] flex items-center justify-center text-center">
                          <p className="text-(--muted)">
                            {item.comment?.trim()
                              ? item.comment
                              : "No comments available"}
                          </p>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

              </div>
             );
            })}
          </div>
      ))}
        </div>
      </div>
      <Footer />
    </div>
)
}

export default Analytics;