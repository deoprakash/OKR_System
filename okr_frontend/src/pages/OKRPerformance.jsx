import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { listEmployees, getEmployeeOKRs, getOKRHierarchy } from "../lib/api";

export default function OKRPerformance() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeOKRs, setEmployeeOKRs] = useState([]);
  const [selectedOKR, setSelectedOKR] = useState(null);
  const [hierarchyData, setHierarchyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const res = await listEmployees();
      setEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  }

  async function handleEmployeeSelect(e) {
    const empCode = e.target.value;
    const emp = employees.find(e => e.empCode === Number(empCode));
    setSelectedEmployee(emp || null);
    setEmployeeOKRs([]);
    setSelectedOKR(null);
    setHierarchyData(null);
    setError("");

    if (emp) {
      // Load OKRs for this employee
      try {
        const res = await getEmployeeOKRs(emp.empCode);
        setEmployeeOKRs(res.data || []);
      } catch (err) {
        console.error("Failed to load employee OKRs", err);
        setError("Failed to load OKRs for this employee");
      }
    }
  }

  function handleOKRSelect(e) {
    const value = e.target.value;
    if (value && employeeOKRs.length > 0) {
      const okr = employeeOKRs[Number(value)];
      setSelectedOKR(okr);
      setHierarchyData(null);
    } else {
      setSelectedOKR(null);
      setHierarchyData(null);
    }
  }

  async function handleShowPerformance() {
    if (!selectedEmployee) {
      setError("Please select an employee");
      return;
    }

    if (!selectedOKR) {
      setError("Please select an OKR");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Get the OKR code based on the level
      let okrCode;
      switch (selectedOKR.level) {
        case 1: okrCode = selectedOKR.level1OkrCode; break;
        case 2: okrCode = selectedOKR.level2OkrCode; break;
        case 3: okrCode = selectedOKR.level3OkrCode; break;
        case 4: okrCode = selectedOKR.level4OkrCode; break;
        case 5: okrCode = selectedOKR.level5OkrCode; break;
        case 6: okrCode = selectedOKR.level6OkrCode; break;
        case 7: okrCode = selectedOKR.level7OkrCode; break;
      }

      const res = await getOKRHierarchy(selectedOKR.level, okrCode);
      setHierarchyData(res.data);
    } catch (err) {
      setError("Failed to load OKR hierarchy: " + err.message);
      setHierarchyData(null);
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    navigate("/");
  }

  function getOKRDisplayText(okr) {
    if (!okr) return "";
    return `${okr.okrDesc || 'Untitled OKR'} (L${okr.level})`;
  }

  const selLevel = selectedOKR ? Number(selectedOKR.level) : null;

  return (
    <div className="min-h-screen bg-[#0f1724] flex flex-col">
      <NavBar />
      <div className="flex-1 p-8 mt-10">
        <div className="bg-white rounded-2xl shadow-blue-glow-lg p-8 max-w-7xl mx-auto professional-panel">
          <h1 className="text-3xl font-bold text-blue-700 text-center mb-8">
            Show OKR Performance
          </h1>

          {/* Employee Selection Section */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-blue-900 font-semibold mb-2">
                Employee Name
              </label>
              <select
                className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
                value={selectedEmployee?.empCode || ""}
                onChange={handleEmployeeSelect}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.empCode} value={emp.empCode}>
                    {emp.empName} (Level {emp.empLevel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-2">
                Employee Level
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-gray-100"
                value={selectedEmployee?.empLevel || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-blue-900 font-semibold mb-2">
                Employee Code
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-gray-100"
                value={selectedEmployee?.empCode || ""}
                readOnly
              />
            </div>
          </div>

          {/* OKR Selection */}
          <div className="mb-6">
            <label className="block text-blue-900 font-semibold mb-2">
              Select OKR
            </label>
            <select
              className="w-full max-w-2xl px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-blue-500"
              value={selectedOKR ? employeeOKRs.indexOf(selectedOKR) : ""}
              onChange={handleOKRSelect}
              disabled={!selectedEmployee || employeeOKRs.length === 0}
            >
              <option value="">
                {selectedEmployee ? (employeeOKRs.length > 0 ? "Select an OKR" : "No OKRs available") : "Select an employee first"}
              </option>
              {employeeOKRs.map((okr, idx) => (
                <option key={idx} value={idx}>
                  {getOKRDisplayText(okr)}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Performance Table */}
          {hierarchyData && (
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100">
                      <th className="border border-blue-300 px-4 py-3 text-left text-blue-900 font-semibold">
                      
                      </th>
                      <th className="border border-blue-300 px-4 py-3 text-left text-blue-900 font-semibold w-44">
                        Employee Name
                      </th>
                      <th className="border border-blue-300 px-4 py-3 text-left text-blue-900 font-semibold w-1/2">
                        OKR Description
                      </th>
                    <th className="border border-blue-300 px-4 py-3 text-center text-blue-900 font-semibold w-20">
                      Q1 %
                    </th>
                    <th className="border border-blue-300 px-4 py-3 text-center text-blue-900 font-semibold w-20">
                      Q2 %
                    </th>
                    <th className="border border-blue-300 px-4 py-3 text-center text-blue-900 font-semibold w-20">
                      Q3 %
                    </th>
                    <th className="border border-blue-300 px-4 py-3 text-center text-blue-900 font-semibold w-20">
                      Q4 %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Level 1 */}
                  <tr className={`hover:bg-blue-50 ${selLevel === 1 ? 'bg-yellow-100' : ''}`}>
                    <td className="border border-blue-300 px-4 py-3 font-semibold text-blue-900">
                      <div className="flex items-center gap-2">
                        <span>Level 1 OKR</span>
                        {selLevel != null && 1 < selLevel && <span className="text-sm text-gray-600">▲</span>}
                        {selLevel != null && 1 > selLevel && <span className="text-sm text-gray-600">▼</span>}
                      </div>
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level1?.empName || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level1?.okrDesc || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level1?.q1_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level1?.q2_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level1?.q3_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level1?.q4_percentage ?? "-"}
                    </td>
                  </tr>

                  {/* Level 2 */}
                  <tr className={`hover:bg-blue-50 ${selLevel === 2 ? 'bg-yellow-100' : ''}`}>
                    <td className="border border-blue-300 px-4 py-3 font-semibold text-blue-900">
                      <div className="flex items-center gap-2">
                        <span>Level 2 OKR</span>
                        {selLevel != null && 2 < selLevel && <span className="text-sm text-gray-600">▲</span>}
                        {selLevel != null && 2 > selLevel && <span className="text-sm text-gray-600">▼</span>}
                      </div>
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level2?.empName || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level2?.okrDesc || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level2?.q1_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level2?.q2_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level2?.q3_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center ">
                      {hierarchyData.level2?.q4_percentage ?? "-"}
                    </td>
                  </tr>

                  {/* Level 3 */}
                  <tr className={`hover:bg-blue-50 ${selLevel === 3 ? 'bg-yellow-100' : ''}`}>
                    <td className="border border-blue-300 px-4 py-3 font-semibold text-blue-900">
                      <div className="flex items-center gap-2">
                        <span>Level 3 OKR</span>
                        {selLevel != null && 3 < selLevel && <span className="text-sm text-gray-600">▲</span>}
                        {selLevel != null && 3 > selLevel && <span className="text-sm text-gray-600">▼</span>}
                      </div>
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level3?.empName || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level3?.okrDesc || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level3?.q1_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level3?.q2_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level3?.q3_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level3?.q4_percentage ?? "-"}
                    </td>
                  </tr>

                  {/* Level 4 */}
                  <tr className={`hover:bg-blue-50 ${selLevel === 4 ? 'bg-yellow-100' : ''}`}>
                    <td className="border border-blue-300 px-4 py-3 font-semibold text-blue-900">
                      <div className="flex items-center gap-2">
                        <span>Level 4 OKR</span>
                        {selLevel != null && 4 < selLevel && <span className="text-sm text-gray-600">▲</span>}
                        {selLevel != null && 4 > selLevel && <span className="text-sm text-gray-600">▼</span>}
                      </div>
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level4?.empName || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level4?.okrDesc || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level4?.q1_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level4?.q2_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level4?.q3_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level4?.q4_percentage ?? "-"}
                    </td>
                  </tr>

                  {/* Level 5 */}
                  <tr className={`hover:bg-blue-50 ${selLevel === 5 ? 'bg-yellow-100' : ''}`}>
                    <td className="border border-blue-300 px-4 py-3 font-semibold text-blue-900">
                      <div className="flex items-center gap-2">
                        <span>Level 5 OKR</span>
                        {selLevel != null && 5 < selLevel && <span className="text-sm text-gray-600">▲</span>}
                        {selLevel != null && 5 > selLevel && <span className="text-sm text-gray-600">▼</span>}
                      </div>
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level5?.empName || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level5?.okrDesc || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level5?.q1_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level5?.q2_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level5?.q3_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level5?.q4_percentage ?? "-"}
                    </td>
                  </tr>

                  {/* Level 6 */}
                  <tr className={`hover:bg-blue-50 ${selLevel === 6 ? 'bg-yellow-100' : ''}`}>
                    <td className="border border-blue-300 px-4 py-3 font-semibold text-blue-900">
                      <div className="flex items-center gap-2">
                        <span>Level 6 OKR</span>
                        {selLevel != null && 6 < selLevel && <span className="text-sm text-gray-600">▲</span>}
                        {selLevel != null && 6 > selLevel && <span className="text-sm text-gray-600">▼</span>}
                      </div>
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level6?.empName || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level6?.okrDesc || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level6?.q1_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level6?.q2_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level6?.q3_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level6?.q4_percentage ?? "-"}
                    </td>
                  </tr>

                  {/* Level 7 */}
                  <tr className={`hover:bg-blue-50 ${selLevel === 7 ? 'bg-yellow-100' : ''}`}>
                    <td className="border border-blue-300 px-4 py-3 font-semibold text-blue-900">
                      <div className="flex items-center gap-2">
                        <span>Level 7 OKR</span>
                        {selLevel != null && 7 < selLevel && <span className="text-sm text-gray-600">▲</span>}
                        {selLevel != null && 7 > selLevel && <span className="text-sm text-gray-600">▼</span>}
                      </div>
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level7?.empName || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3">
                      {hierarchyData.level7?.okrDesc || "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level7?.q1_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level7?.q2_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level7?.q3_percentage ?? "-"}
                    </td>
                    <td className="border border-blue-300 px-4 py-3 text-center">
                      {hierarchyData.level7?.q4_percentage ?? "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={handleShowPerformance}
              disabled={loading || !selectedEmployee || !selectedOKR}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-blue-glow hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "OKR Details"}
            </button>
            <button
              onClick={handleClose}
              className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
