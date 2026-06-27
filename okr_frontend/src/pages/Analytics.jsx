import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { listEmployees, getEmployeeAnalytics } from "../lib/api";
import { YEAR_OPTIONS } from "../lib/okrDefaults";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Analytics = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState("");
  const [year, setYear] = useState("ALL");
  const [analyticsData, setAnalyticsData] = useState([]);


//   const loadEmployees = async () => {
//     try {
//       const res = await listEmployees();
//       console.log("Employees:", res.data);
//       setEmployees(res.data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };

async function loadEmployees() {
  try {
    const res = await listEmployees();

    console.log("Employees:", res.data);

    setEmployees(res.data || []);
  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleAnalytics = async () => {
    if (!employee) {
      alert("Please select an employee.");
      return;
    }

    try {
      const res = await getEmployeeAnalytics(employee, year);

        console.log("Selected Employee:", employee);
        console.log("Selected Year:", year);

      console.log(res);

      setAnalyticsData(res.data || []);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="absolute top-6 left-6">
        <BackButton onClick={() => navigate("/")} />
      </div>

      <div className="bg-white rounded-lg shadow-2xl w-[90%] max-w-5xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Employee Analytics
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="font-semibold block mb-2">Employee</label>

            <select
              value={employee}
              onChange={(e) => {
                console.log("Selected:", e.target.value);
                setEmployee(e.target.value);
              }}
            >
              <option value="">Select Employee</option>

              {employees.map((emp) => (
                <option key={emp._id} value={emp.userId}>
                  {emp.empName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-2">Year</label>

            <select
              className="border px-3 py-2 w-full"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="ALL">All Years</option>

              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleAnalytics}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Show Analytics
            </button>
          </div>
        </div>

        <hr className="my-8" />

        {analyticsData.length > 0 ? (
  <>
    <table className="w-full border-collapse border border-gray-300 mt-6">
      {/* table code */}
    </table>

    {/* ADD THE CHART HERE */}
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">
        Performance Trend
      </h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={analyticsData.map((item) => ({
            period: `${item.okrYear}-${item.okrQuarter}`,
            average: item.average,
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="period" />

          <YAxis domain={[0, 100]} />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="average"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </>
) : (
  <div className="text-center text-gray-500 mt-8">
    No analytics available.
  </div>
)}
      </div>
    </div>
  );
};

export default Analytics;
