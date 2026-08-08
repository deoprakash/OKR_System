import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { listEmployees, getEmployeeOKRs, getOKRHierarchy } from "../lib/api";

const LEVELS = [1, 2, 3, 4, 5, 6, 7];

const LEVEL_STYLES = {
  1: {
    ring: "ring-blue-200",
    badge: "blue",
    node: "from-blue-500 to-cyan-400",
    glow: "shadow-[0_18px_40px_rgba(37,99,235,0.32)]",
  },
  2: {
    ring: "ring-indigo-200",
    badge: "indigo",
    node: "from-indigo-500 to-blue-400",
    glow: "shadow-[0_18px_40px_rgba(79,70,229,0.32)]",
  },
  3: {
    ring: "ring-emerald-200",
    badge: "green",
    node: "from-emerald-500 to-teal-400",
    glow: "shadow-[0_18px_40px_rgba(16,185,129,0.32)]",
  },
  4: {
    ring: "ring-amber-200",
    badge: "yellow",
    node: "from-amber-500 to-orange-400",
    glow: "shadow-[0_18px_40px_rgba(245,158,11,0.32)]",
  },
  5: {
    ring: "ring-purple-200",
    badge: "purple",
    node: "from-purple-500 to-fuchsia-400",
    glow: "shadow-[0_18px_40px_rgba(168,85,247,0.32)]",
  },
  6: {
    ring: "ring-rose-200",
    badge: "red",
    node: "from-rose-500 to-pink-400",
    glow: "shadow-[0_18px_40px_rgba(244,63,94,0.32)]",
  },
  7: {
    ring: "ring-slate-200",
    badge: "gray",
    node: "from-slate-500 to-slate-400",
    glow: "shadow-[0_18px_40px_rgba(100,116,139,0.32)]",
  },
};

// ── Compact node-level sparkline ────────────────────────────────────────────
function NodeOKRSparkline({ okrs }) {
  // null = not yet fetched (loading)
  if (okrs === null) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-neutral-300 bg-white/80 backdrop-blur-sm animate-pulse shadow-[0_4px_20px_rgba(15,23,42,0.22)]"
        style={{ width: 240, height: 150 }}
      >
        <div className="h-2 w-20 rounded bg-neutral-200 mb-2" />
        <div className="h-1.5 w-14 rounded bg-neutral-100" />
      </div>
    );
  }

  // empty array = employee has no OKRs
  if (okrs.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 bg-white/80 backdrop-blur-sm shadow-[0_4px_20px_rgba(15,23,42,0.20)]"
        style={{ width: 240, height: 150 }}
      >
        <p className="text-xs text-neutral-400 text-center px-3">No OKR data</p>
      </div>
    );
  }

  // Use the first OKR's quarterly percentages
  const okr = okrs[0];
  const data = [
    { q: "Q1", pct: Number(okr.q1_percentage ?? 0) },
    { q: "Q2", pct: Number(okr.q2_percentage ?? 0) },
    { q: "Q3", pct: Number(okr.q3_percentage ?? 0) },
    { q: "Q4", pct: Number(okr.q4_percentage ?? 0) },
  ];

  const maxPct = Math.max(...data.map((d) => d.pct));
  const lineColor =
    maxPct >= 75 ? "#10B981" : maxPct >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div
      className="flex flex-col rounded-2xl border-2 border-neutral-300 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.26)]"
      style={{ width: 240, height: 150 }}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 text-center pt-2.5 pb-0">
        OKR Performance
      </p>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 6, right: 12, left: -18, bottom: 4 }}
          >
            <XAxis
              dataKey="q"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              tickLine={false}
              ticks={[0, 50, 100]}
            />
            <RechartsTooltip
              contentStyle={{
                fontSize: 11,
                padding: "5px 10px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(val) => [`${val}%`, "Progress"]}
              labelFormatter={(label) => label}
            />
            <ReferenceLine y={50} stroke="#e2e8f0" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="pct"
              stroke={lineColor}
              strokeWidth={2.5}
              dot={{ r: 4, fill: lineColor, strokeWidth: 0 }}
              activeDot={{ r: 5.5, fill: lineColor }}
              isAnimationActive={true}
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function CompletionRing({ value, size = 40 }) {
  const pct = value != null ? Math.min(100, Math.max(0, Number(value))) : null;
  const color =
    pct == null
      ? "#E2E8F0"
      : pct >= 75
        ? "#10B981"
        : pct >= 50
          ? "#F59E0B"
          : "#EF4444";
  const textColor =
    pct == null
      ? "text-neutral-400"
      : pct >= 75
        ? "text-success"
        : pct >= 50
          ? "text-warning"
          : "text-danger";
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = pct != null ? circ - (pct / 100) * circ : circ;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="3"
        />
        {pct != null && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        )}
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${textColor}`}
      >
        {pct != null ? `${pct}%` : "–"}
      </div>
    </div>
  );
}

function QuickStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{value}</p>
    </div>
  );
}

function buildLevelMap(employees) {
  const levelMap = Object.fromEntries(LEVELS.map((level) => [level, []]));
  employees.forEach((employee) => {
    const level = Number(employee.empLevel || 0);
    if (level >= 1 && level <= 7) levelMap[level].push(employee);
  });
  LEVELS.forEach((level) => {
    levelMap[level].sort((a, b) =>
      String(a.empName || "").localeCompare(String(b.empName || "")),
    );
  });
  return levelMap;
}

function getManagerName(levelMap, employee) {
  const level = Number(employee?.empLevel || 0);
  if (level <= 1) return "Top level";
  const currentLevel = levelMap[level] || [];
  const parentLevel = levelMap[level - 1] || [];
  if (!currentLevel.length || !parentLevel.length) return "Not assigned";
  const currentIndex = currentLevel.findIndex(
    (item) => item.userId === employee.userId,
  );
  if (currentIndex < 0) return "Not assigned";
  const parentIndex = Math.min(
    parentLevel.length - 1,
    Math.floor((currentIndex * parentLevel.length) / currentLevel.length),
  );
  return parentLevel[parentIndex]?.empName || "Not assigned";
}

export default function OKRPerformance() {
  const navigate = useNavigate();
  const graphWrapRef = useRef(null);
  const nodeRefs = useRef(new Map());
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeOKRs, setEmployeeOKRs] = useState([]);
  const [selectedOKRIndex, setSelectedOKRIndex] = useState("");
  const [graphVisible, setGraphVisible] = useState(false);
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [edgePaths, setEdgePaths] = useState([]);
  const [clickedNode, setClickedNode] = useState(null);
  const [clickedNodeOKRs, setClickedNodeOKRs] = useState([]);
  const [clickedNodeOKRIndex, setClickedNodeOKRIndex] = useState("");
  const [visibleNodeIds, setVisibleNodeIds] = useState(null);
  // Map<userId, OKR[]> — caches fetched OKRs for sparklines
  const [nodeOKRData, setNodeOKRData] = useState(new Map());

  useEffect(() => {
    (async () => {
      try {
        const res = await listEmployees();
        setEmployees(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load employees for the performance graph.");
      }
    })();
  }, []);

  async function loadEmployeeOKRs(userId) {
    if (!userId) {
      setEmployeeOKRs([]);
      setSelectedOKRIndex("");
      return;
    }

    try {
      const res = await getEmployeeOKRs(userId);
      const okrs = res.data || [];
      setEmployeeOKRs(okrs);
      setSelectedOKRIndex(okrs.length > 0 ? 0 : "");
    } catch (err) {
      console.error(err);
      setEmployeeOKRs([]);
      setSelectedOKRIndex("");
      setError("Failed to load OKRs for the selected employee.");
    }
  }

  async function loadClickedNodeOKRs(userId) {
    if (!userId) {
      setClickedNodeOKRs([]);
      setClickedNodeOKRIndex("");
      return;
    }
    try {
      const res = await getEmployeeOKRs(userId);
      const okrs = res.data || [];
      setClickedNodeOKRs(okrs);
      setClickedNodeOKRIndex(okrs.length > 0 ? 0 : "");
    } catch (err) {
      console.error(err);
      setClickedNodeOKRs([]);
      setClickedNodeOKRIndex("");
    }
  }

  function handleEmployeeSelect(event) {
    const userId = event.target.value;
    const employee = employees.find((item) => item.userId === userId) || null;
    setSelectedEmployee(employee);
    setError("");
    if (employee) loadEmployeeOKRs(employee.userId);
    else {
      setEmployeeOKRs([]);
      setSelectedOKRIndex("");
    }
  }

  async function handleShowOKR() {
    if (!selectedEmployee) {
      setError("Please select an employee before showing the graph.");
      return;
    }
    const okr = selectedOKRIndex === "" ? null : employeeOKRs[Number(selectedOKRIndex)];
    if (!okr) {
      setError("Please select an OKR to show its hierarchy.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const codeField = `level${selectedEmployee.empLevel}OkrCode`;
      const res = await getOKRHierarchy(selectedEmployee.empLevel, okr[codeField]);
      const data = res.data || {};
      
      const ids = new Set();
      for (let i = 1; i <= 7; i++) {
        const nodeOkr = data[`level${i}`];
        if (nodeOkr && nodeOkr.userId) {
          ids.add(nodeOkr.userId);
        }
      }
      
      setVisibleNodeIds(ids);
      setGraphVisible(true);
      setDetailsCollapsed(false);
      setClickedNode(selectedEmployee);
      setClickedNodeOKRs(employeeOKRs);
      setClickedNodeOKRIndex(selectedOKRIndex);
    } catch (err) {
      console.error(err);
      setError("Failed to load OKR hierarchy from server.");
    } finally {
      setLoading(false);
    }
  }

  // Batch-fetch OKRs for all visible nodes to populate sparklines
  useEffect(() => {
    if (!graphVisible || !visibleNodeIds || visibleNodeIds.size === 0) return;
    const idsToFetch = [...visibleNodeIds].filter(
      (uid) => !nodeOKRData.has(uid)
    );
    if (idsToFetch.length === 0) return;

    Promise.allSettled(
      idsToFetch.map((uid) =>
        getEmployeeOKRs(uid).then((res) => ({ uid, okrs: res.data || [] }))
      )
    ).then((results) => {
      setNodeOKRData((prev) => {
        const next = new Map(prev);
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            next.set(result.value.uid, result.value.okrs);
          }
        });
        return next;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphVisible, visibleNodeIds]);

  function handleClearSelection() {
    setGraphVisible(false);
    setDetailsCollapsed(false);
    setSelectedEmployee(null);
    setEmployeeOKRs([]);
    setSelectedOKRIndex("");
    setClickedNode(null);
    setClickedNodeOKRs([]);
    setClickedNodeOKRIndex("");
    setHoveredNodeId(null);
    setTooltip(null);
    setError("");
    setNodeOKRData(new Map());
  }

  function handleNodeClick(node) {
    setClickedNode(node.employee);
    setError("");
    loadClickedNodeOKRs(node.employee.userId);
  }

  const levelMap = useMemo(() => buildLevelMap(employees), [employees]);

  const graphNodes = useMemo(() => {
    const nodes = [];
    LEVELS.forEach((level) => {
      const levelEmployees = levelMap[level] || [];
      levelEmployees.forEach((employee, index) => {
        const parentLevelEmployees = level > 1 ? levelMap[level - 1] || [] : [];
        let parent = null;

        if (graphVisible && visibleNodeIds && visibleNodeIds.has(employee.userId)) {
          parent = parentLevelEmployees.find(emp => visibleNodeIds.has(emp.userId)) || null;
        } else {
          const parentIndex =
            level > 1 && parentLevelEmployees.length > 0
              ? Math.min(
                  parentLevelEmployees.length - 1,
                  Math.floor(
                    (index * parentLevelEmployees.length) / levelEmployees.length,
                  ),
                )
              : -1;
          parent = parentIndex >= 0 ? parentLevelEmployees[parentIndex] : null;
        }

        nodes.push({
          id: employee.userId,
          employee,
          level,
          parentId: parent?.userId || null,
          parentName: parent?.empName || (level <= 1 ? "Top level" : "Not assigned"),
        });
      });
    });
    return nodes;
  }, [levelMap, graphVisible, visibleNodeIds]);

  const selectedNode = useMemo(
    () =>
      graphNodes.find((node) => node.id === selectedEmployee?.userId) || null,
    [graphNodes, selectedEmployee],
  );
  const selectedOKR =
    selectedOKRIndex === ""
      ? null
      : employeeOKRs[Number(selectedOKRIndex)] || null;
  const selectedAvg = useMemo(() => {
    if (!selectedOKR) return null;
    const values = [1, 2, 3, 4].map((q) =>
      Number(selectedOKR[`q${q}_percentage`] || 0),
    );
    return (values.reduce((sum, value) => sum + value, 0) / 4).toFixed(1);
  }, [selectedOKR]);

  const clickedNodeGraphNode = useMemo(
    () => graphNodes.find((node) => node.id === clickedNode?.userId) || null,
    [graphNodes, clickedNode],
  );
  const clickedNodeSelectedOKR =
    clickedNodeOKRIndex === ""
      ? null
      : clickedNodeOKRs[Number(clickedNodeOKRIndex)] || null;
  const clickedNodeAvg = useMemo(() => {
    if (!clickedNodeSelectedOKR) return null;
    const values = [1, 2, 3, 4].map((q) =>
      Number(clickedNodeSelectedOKR[`q${q}_percentage`] || 0),
    );
    return (values.reduce((sum, value) => sum + value, 0) / 4).toFixed(1);
  }, [clickedNodeSelectedOKR]);

  // Visible node IDs are now managed by state when "Show OKR" is clicked.

  useLayoutEffect(() => {
    if (!graphVisible || !graphWrapRef.current) return;

    const measure = () => {
      const container = graphWrapRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const paths = [];
      graphNodes.forEach((node) => {
        if (!node.parentId) return;
        const nodeEl = nodeRefs.current.get(node.id);
        const parentEl = nodeRefs.current.get(node.parentId);
        if (!nodeEl || !parentEl) return;
        const childRect = nodeEl.getBoundingClientRect();
        const parentRect = parentEl.getBoundingClientRect();
        paths.push({
          x1: parentRect.left + parentRect.width / 2 - containerRect.left,
          y1: parentRect.top + parentRect.height - containerRect.top,
          x2: childRect.left + childRect.width / 2 - containerRect.left,
          y2: childRect.top - containerRect.top,
        });
      });
      setEdgePaths(paths);
    };

    measure();
    const resizeObserver = new ResizeObserver(() =>
      requestAnimationFrame(measure),
    );
    resizeObserver.observe(graphWrapRef.current);
    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [graphNodes, graphVisible, detailsCollapsed, clickedNode, clickedNodeSelectedOKR]);

  useEffect(() => {
    if (!graphVisible) {
      setTooltip(null);
      return;
    }
    if (!hoveredNodeId) {
      setTooltip(null);
      return;
    }

    const node = graphNodes.find((item) => item.id === hoveredNodeId);
    const nodeEl = node ? nodeRefs.current.get(node.id) : null;
    if (!node || !nodeEl) return;

    const nodeRect = nodeEl.getBoundingClientRect();
    const tooltipWidth = 240;
    const viewportPadding = 16;
    const preferredLeft = nodeRect.left + nodeRect.width / 2;
    const clampedLeft = Math.min(
      window.innerWidth - viewportPadding - tooltipWidth / 2,
      Math.max(viewportPadding + tooltipWidth / 2, preferredLeft),
    );
    const preferredTop = nodeRect.top - 12;
    const placeBelow = preferredTop < 120;

    setTooltip({
      id: node.id,
      name: node.employee.empName,
      designation: node.employee.empDesignation || "Unassigned designation",
      manager: node.parentName,
      x: clampedLeft,
      y: placeBelow ? nodeRect.bottom + 12 : preferredTop,
      placement: placeBelow ? "bottom" : "top",
    });
  }, [graphVisible, hoveredNodeId, graphNodes]);

  const selectedLevel = selectedEmployee
    ? Number(selectedEmployee.empLevel || 0)
    : null;
  const selectedLevelStyle = LEVEL_STYLES[selectedLevel] || LEVEL_STYLES[7];
  const nodeCount = useMemo(() => {
    if (graphVisible && visibleNodeIds) return visibleNodeIds.size;
    return LEVELS.reduce((sum, level) => sum + (levelMap[level]?.length || 0), 0);
  }, [levelMap, graphVisible, visibleNodeIds]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-base">
      <NavBar />
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">
              OKR Performance
            </h1>
            <p className="text-sm text-neutral-500">
              Explore organizational performance as an interactive graph. Select
              any employee node to inspect details on the right.
            </p>
          </div>

          <div
            className={[
              "grid gap-6",
              !detailsCollapsed
                ? "xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]"
                : "",
            ].join(" ")}
          >
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-neutral-200 bg-white p-6 shadow-card-md">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                  <Select
                    label="Employee"
                    value={selectedEmployee?.userId || ""}
                    onChange={handleEmployeeSelect}
                  >
                    <option value="">Select Employee</option>
                    {employees
                      .filter((emp) => emp.userId)
                      .map((emp) => (
                        <option key={emp.userId} value={emp.userId}>
                          {emp.empName}
                        </option>
                      ))}
                  </Select>

                  {selectedEmployee && (
                    <Input
                      label="Level"
                      value={
                        selectedEmployee.empLevel
                          ? `Level ${selectedEmployee.empLevel}`
                          : "—"
                      }
                      readOnly
                    />
                  )}

                  <Select
                    label="OKR"
                    value={selectedOKRIndex}
                    onChange={(event) =>
                      setSelectedOKRIndex(event.target.value)
                    }
                    disabled={!selectedEmployee || employeeOKRs.length === 0}
                  >
                    <option value="">
                      {!selectedEmployee
                        ? "Select an employee first"
                        : employeeOKRs.length > 0
                          ? "Select an OKR"
                          : "No OKRs available"}
                    </option>
                    {employeeOKRs.map((okr, index) => (
                      <option key={index} value={index}>
                        {okr.okrDesc || "Untitled OKR"} (L{okr.level})
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-neutral-100 pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleShowOKR}
                    disabled={!selectedEmployee || loading}
                    loading={loading}
                  >
                    Show OKR
                  </Button>
                </div>

                {error && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-danger-border bg-danger-light p-3 text-sm text-danger-text">
                    <svg
                      className="h-4 w-4 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {error}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border-2 border-neutral-200 bg-white p-4 shadow-[0_8px_40px_rgba(15,23,42,0.28)]">
                <div className="mb-4 flex items-center justify-between gap-3 px-2">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">
                      Organizational Graph
                    </h2>
                    <p className="text-xs text-neutral-500">
                      Each row is one level, each node is one employee.
                    </p>
                  </div>
                </div>

                {graphVisible ? (
                  <div
                    ref={graphWrapRef}
                    className="relative overflow-auto rounded-[28px] border-2 border-neutral-200 bg-[radial-gradient(circle_at_top,_rgba(219,234,254,0.7),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-6"
                  >
                    <svg className="pointer-events-none absolute inset-0 h-full w-full">
                      {edgePaths.map((edge, index) => (
                        <line
                          key={`${edge.x1}-${edge.y1}-${edge.x2}-${edge.y2}-${index}`}
                          x1={edge.x1}
                          y1={edge.y1}
                          x2={edge.x2}
                          y2={edge.y2}
                          stroke="rgba(148,163,184,0.45)"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                        />
                      ))}
                    </svg>

                    <div className="relative space-y-14 min-w-[1100px] pb-4 pt-4">
                      {LEVELS.map((level) => {
                        const allItems = levelMap[level] || [];
                        const items = visibleNodeIds
                          ? allItems.filter((emp) =>
                              visibleNodeIds.has(emp.userId),
                            )
                          : allItems;
                        const levelStyle = LEVEL_STYLES[level];

                        // Skip levels with no visible employees
                        if (items.length === 0) return null;

                        return (
                          <div key={level} className="relative">
                            <div className="mb-4 flex items-center justify-center">
                              <div className="rounded-full border border-neutral-200 bg-white px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-700 shadow-sm">
                                Level {level}
                              </div>
                            </div>

                            <div className="flex flex-wrap items-start justify-center gap-6 xl:gap-8">
                              {items.length > 0 ? (
                                items.map((employee) => {
                                  const isSelected =
                                    clickedNode?.userId === employee.userId;
                                  const isHovered =
                                    hoveredNodeId === employee.userId;
                                  const graphNode = graphNodes.find(n => n.id === employee.userId);
                                  const managerName = graphNode ? graphNode.parentName : getManagerName(levelMap, employee);
                                  const empOKRs = nodeOKRData.get(employee.userId) || null;

                                  return (
                                    <div
                                      key={employee.userId}
                                      className="flex items-center gap-5"
                                    >
                                      <button
                                        ref={(node) => {
                                          if (node)
                                            nodeRefs.current.set(
                                              employee.userId,
                                              node,
                                            );
                                          else
                                            nodeRefs.current.delete(
                                              employee.userId,
                                            );
                                        }}
                                        type="button"
                                        onClick={() =>
                                          handleNodeClick({
                                            employee,
                                            parentName: managerName,
                                          })
                                        }
                                        onMouseEnter={() =>
                                          setHoveredNodeId(employee.userId)
                                        }
                                        onMouseLeave={() =>
                                          setHoveredNodeId(null)
                                        }
                                        className={[
                                          "relative inline-flex min-h-[150px] w-auto min-w-[280px] max-w-[400px] flex-col justify-between rounded-[24px] border-2 px-5 py-4 text-left transition-all duration-200 ease-out",
                                          "border-neutral-300 bg-white text-neutral-900 shadow-[0_6px_24px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(37,99,235,0.30)]",
                                          isSelected
                                            ? `${levelStyle.glow} ring-2 ${levelStyle.ring} border-transparent bg-white`
                                            : "",
                                          isHovered
                                            ? "scale-[1.02] border-blue-200 shadow-[0_16px_40px_rgba(37,99,235,0.28)]"
                                            : "",
                                        ].join(" ")}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="break-words text-base font-bold leading-6 text-neutral-900">
                                                {employee.empName}
                                              </span>
                                              <span className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-700">
                                                L{level}
                                              </span>
                                            </div>
                                            <p className="mt-1.5 break-words text-sm leading-5 text-neutral-500">
                                              {employee.empDesignation ||
                                                "Unassigned designation"}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                                          <span>
                                            {isSelected ? "Selected" : "Employee"}
                                          </span>
                                          <span className="max-w-[58%] break-words text-right text-sm normal-case tracking-normal font-medium text-neutral-600">
                                            {managerName}
                                          </span>
                                        </div>
                                      </button>

                                      {/* OKR sparkline to the right of the node */}
                                      <NodeOKRSparkline okrs={empOKRs} />
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-500">
                                  No employees found for this level.
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {tooltip && (
                        <motion.div
                          key={tooltip.id}
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                          className="pointer-events-none fixed z-50 w-[240px] rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 shadow-[0_18px_50px_rgba(15,23,42,0.32)]"
                          style={{
                            left: tooltip.x,
                            top: tooltip.y,
                            transform:
                              tooltip.placement === "bottom"
                                ? "translate(-50%, 0)"
                                : "translate(-50%, -100%)",
                          }}
                        >
                          <p className="text-sm font-semibold text-neutral-900">
                            {tooltip.name}
                          </p>
                          <p className="mt-1 text-xs text-neutral-600">
                            Designation: {tooltip.designation}
                          </p>
                          <p className="mt-1 text-xs text-neutral-600">
                            Manager: {tooltip.manager}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="rounded-[28px] border-2 border-dashed border-neutral-200 bg-neutral-50 px-6 py-10 text-center text-sm text-neutral-500">
                    Select an employee and click Show OKR to render the graph.
                  </div>
                )}
              </div>
            </div>

            {!detailsCollapsed && (
            <div className="space-y-6">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-3xl border-2 border-neutral-200 bg-white p-5 shadow-card-md transition-all duration-200">
                  <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                        Node Details
                      </p>
                      <h2 className="mt-1 truncate text-lg font-bold text-neutral-900">
                        {clickedNode
                          ? clickedNode.empName
                          : "No node selected"}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailsCollapsed(true)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-sm transition-all hover:-translate-y-0.5 hover:text-neutral-900"
                      aria-label="Collapse details panel"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  {clickedNode ? (
                    <div className="mt-4 space-y-4">
                      <QuickStat
                        label="Name"
                        value={clickedNode.empName || "—"}
                      />
                      <QuickStat
                        label="Level"
                        value={
                          clickedNode.empLevel
                            ? `Level ${clickedNode.empLevel}`
                            : "—"
                        }
                      />
                      <QuickStat
                        label="Email"
                        value={clickedNode.emailId || "—"}
                      />
                      <QuickStat
                        label="Designation"
                        value={clickedNode.empDesignation || "Unassigned"}
                      />
                      <QuickStat
                        label="Manager"
                        value={clickedNodeGraphNode?.parentName || "Top level"}
                      />
                      <QuickStat
                        label="User ID"
                        value={clickedNode.userId || "—"}
                      />

                      <div className="rounded-2xl border-2 border-neutral-200 bg-neutral-50 p-4">
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                            OKR
                          </p>
                          {clickedNodeAvg && (
                            <Badge variant="green">{clickedNodeAvg}%</Badge>
                          )}
                        </div>

                        {clickedNodeOKRs.length > 0 ? (
                          <>
                            <select
                              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                              value={clickedNodeOKRIndex}
                              onChange={(e) =>
                                setClickedNodeOKRIndex(e.target.value)
                              }
                            >
                              {clickedNodeOKRs.map((okr, idx) => (
                                <option key={idx} value={idx}>
                                  {okr.okrDesc || "Untitled OKR"} (L
                                  {okr.level})
                                </option>
                              ))}
                            </select>
                            {clickedNodeSelectedOKR && (
                              <div className="grid grid-cols-1 gap-3">
                                {[1, 2, 3, 4].map((quarter) => {
                                  const percentage =
                                    clickedNodeSelectedOKR[
                                      `q${quarter}_percentage`
                                    ];
                                  const comment =
                                    clickedNodeSelectedOKR[
                                      `q${quarter}_comment`
                                    ]?.trim();
                                  return (
                                    <div
                                      key={quarter}
                                      className="rounded-xl border-2 border-neutral-200 bg-white px-3 py-3 shadow-card"
                                    >
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400">
                                            Q{quarter}
                                          </span>
                                          <span className="text-xs font-semibold text-neutral-700">
                                            {percentage != null
                                              ? `${percentage}%`
                                              : "—"}
                                          </span>
                                        </div>
                                        <CompletionRing
                                          value={percentage}
                                          size={34}
                                        />
                                      </div>
                                      <p className="mt-2 text-xs leading-5 text-neutral-600">
                                        {comment || "No notes provided."}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-neutral-500">
                            No OKRs available for this employee.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 px-4 py-5 text-sm text-neutral-500">
                      Click any employee node to inspect name, level, email,
                      designation, manager, OKR, and quarterly progress.
                    </div>
                  )}
                </div>

                <div className="rounded-3xl border-2 border-neutral-200 bg-white p-5 shadow-card-md">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                        Legend
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-neutral-900">
                        Interaction guide
                      </h3>
                    </div>
                    <Badge variant="blue">Hover + click</Badge>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-neutral-600">
                    <p>• Each row is one organizational level from L1 to L7.</p>
                    <p>
                      • Every employee node is clickable and updates the details
                      panel.
                    </p>
                    <p>
                      • Hovering a node shows designation and the linked
                      manager.
                    </p>
                    <p>
                      • Lines show the computed parent-child relationship
                      between adjacent levels.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
                  <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-400">
                        Actions
                      </p>
                      <h3 className="mt-1 text-sm font-bold text-neutral-900">
                        Navigation
                      </h3>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/")}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        clickedNode &&
                        loadClickedNodeOKRs(clickedNode.userId)
                      }
                      disabled={!clickedNode}
                    >
                      Refresh OKRs
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          {!loading && employees.length === 0 && (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white shadow-card">
              <EmptyState
                icon={
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                }
                title="No employees available"
                description="Add employees to see the OKR performance graph by organizational level."
              />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
