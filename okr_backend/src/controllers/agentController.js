import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const APP_KNOWLEDGE = `
You are an AI assistant embedded in "Objecto" — an enterprise OKR (Objectives and Key Results) tracking application.

ORGANIZATIONAL STRUCTURE & REPORTING HIERARCHY:
- Level 1 is the highest rank / top post (e.g., CEO, Managing Director, Executive Director).
- Level 1 leaders have NO senior manager. They report to the Board of Directors.
- Level 2 reports to Level 1.
- Level 3 reports to Level 2.
- Level 4 reports to Level 3.
- Level 5 reports to Level 4.
- Level 6 reports to Level 5.
- Level 7 is the lowest rank / junior post and reports to Level 6.
- In each employee's OKR, they select their Reporting Manager from Level N-1 and link their OKR to their reporting manager's parent OKR.
- The person who owns that parent OKR is that employee's Direct Reporting Manager / Senior.

APP FEATURES & BENCHMARKS:
- OKRs are tracked quarterly (Q1-Q4) with percentage progress:
  Q1 benchmark: 25%
  Q2 benchmark: 50%
  Q3 benchmark: 75%
  Q4 benchmark: 100%
- An OKR is "On Track" if its quarter percentage meets or exceeds the quarterly benchmark.
- An OKR is "At Risk" if its quarter percentage is below the quarterly benchmark.
- Each OKR has an Objective description, quarterly progress percentages (Q1, Q2, Q3, Q4), quarterly comments/updates, and up to 5 real Key Results (KR1, KR2, KR3, KR4, KR5).

MANDATORY RULES FOR QUERIES:

1. REPORTING MANAGER / SENIOR QUERIES:
- When asked who is an employee's reporting manager, senior, or who they report to:
  - If the employee is Level 1: Clearly state that they are a top-level executive (CEO/Director) and have no senior manager in the organization.
  - If the employee is Level 2 to 7: Check their "Direct Reporting Manager / Senior" and "Senior Level" in the employee's data. State the senior manager's name, designation, level, User ID, and contact details.

2. Q1-Q4 VALUES & PROGRESS QUERIES:
- When asked about Q1, Q2, Q3, or Q4 values, progress, or updates for any employee:
  - Quote the EXACT percentage value for each quarter (e.g., Q1: 25%, Q2: 50%, Q3: 70%, Q4: 90%).
  - State whether each quarter is On Track (meets benchmark: Q1=25%, Q2=50%, Q3=75%, Q4=100%) or At Risk.
  - Quote the exact quarterly comment/update if provided.

3. KEY RESULTS (KR) QUERIES:
- When asked about any user's or employee's Key Results (KRs):
  - DO NOT summarize, compress, paraphrase, or invent Key Results.
  - ALWAYS fetch and output the REAL, EXACT Key Results (KR1, KR2, KR3, KR4, KR5) stored in the database verbatim for that employee.
  - List them explicitly under each Objective:
    Objective: [Objective description]
    Key Results:
    - KR1: [Exact KR1 text]
    - KR2: [Exact KR2 text]
    ...
  - If an OKR has no Key Results recorded, explicitly state: "No key results recorded for this OKR."

4. GENERAL EMPLOYEE INFO QUERIES:
- You have complete information for every employee: Name, User ID, Employee Code, Level, Designation, Email, Phone/Cell Number, and Reporting Manager. Provide these details accurately when asked.

STRICT FORMATTING RULES (CRITICAL):
- ABSOLUTELY NO MARKDOWN ALLOWED.
- NEVER use asterisks (*) or underscores (_) for bold or italics.
- NEVER use hashtags (#) for headers.
- NEVER create markdown tables. Describe data in simple sentences or lists instead.
- For bullet points, use a simple dash and space: "- item"
- For numbered lists, use: "1. item"
- Write headers as plain text followed by a colon: "Summary:"
- Keep it clean, simple, and readable.
`;


import Employee from "../models/employee.js";
import Level1OKR from "../models/level1Okr.js";
import Level2OKR from "../models/level2Okr.js";
import Level3OKR from "../models/level3Okr.js";
import Level4OKR from "../models/level4Okr.js";
import Level5OKR from "../models/level5Okr.js";
import Level6OKR from "../models/level6Okr.js";
import Level7OKR from "../models/level7Okr.js";

/**
 * POST /api/agent/chat
 * Body: { messages: [{role, content}], okrContext: {...} }
 */
export async function chat(req, res) {
  try {
    const { messages = [], okrContext = null } = req.body;

    if (!messages.length) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Fetch all employees and all level OKRs in parallel
    const [employees, l1, l2, l3, l4, l5, l6, l7] = await Promise.all([
      Employee.find({}, { userId: 1, empCode: 1, empName: 1, empLevel: 1, emailId: 1, empDesignation: 1, cellNumber: 1, isAdmin: 1 }).lean(),
      Level1OKR.find({}).lean(),
      Level2OKR.find({}).lean(),
      Level3OKR.find({}).lean(),
      Level4OKR.find({}).lean(),
      Level5OKR.find({}).lean(),
      Level6OKR.find({}).lean(),
      Level7OKR.find({}).lean(),
    ]);

    const allLevelOkrs = [l1, l2, l3, l4, l5, l6, l7];
    const flatOkrs = allLevelOkrs.flat();

    // Index OKRs by level and code for reporting manager / parent OKR resolution
    const okrByLevelCode = new Map();
    for (let lvl = 1; lvl <= 7; lvl++) {
      const list = allLevelOkrs[lvl - 1] || [];
      for (const okr of list) {
        const code = okr[`level${lvl}OkrCode`];
        if (code != null) {
          okrByLevelCode.set(`${lvl}_${code}`, okr);
        }
      }
    }

    // Index employees
    const empByUserId = new Map();
    const empByEmpCode = new Map();
    const employeesByLevel = new Map();

    for (const emp of employees) {
      if (emp.userId) empByUserId.set(String(emp.userId).trim().toUpperCase(), emp);
      if (emp.empCode != null) empByEmpCode.set(String(emp.empCode), emp);
      const lvl = Number(emp.empLevel || 0);
      if (!employeesByLevel.has(lvl)) employeesByLevel.set(lvl, []);
      employeesByLevel.get(lvl).push(emp);
    }

    // Index OKRs by employee userId and empCode
    const okrsByUserId = new Map();
    const okrsByEmpCode = new Map();

    for (const okr of flatOkrs) {
      if (okr.userId) {
        const uid = String(okr.userId).trim().toUpperCase();
        if (!okrsByUserId.has(uid)) okrsByUserId.set(uid, []);
        okrsByUserId.get(uid).push(okr);
      }
      if (okr.empCode != null) {
        const code = String(okr.empCode);
        if (!okrsByEmpCode.has(code)) okrsByEmpCode.set(code, []);
        okrsByEmpCode.get(code).push(okr);
      }
    }

    // Build system prompt with live OKR context
    let systemContent = APP_KNOWLEDGE;
    if (okrContext) {
      systemContent += `\n\nCURRENT SESSION CONTEXT:\nLogged-in User: ${okrContext.userName || "Unknown"}\nUser Currently Being Viewed: ${okrContext.targetUserName || okrContext.userName || "Unknown"}\nToday: ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n`;

      if (Array.isArray(okrContext.okrs) && okrContext.okrs.length > 0) {
        systemContent += `\nACTIVE OKRS & KEY RESULTS FOR CURRENT VIEW (${okrContext.targetUserName || "Target User"}):\n`;
        okrContext.okrs.forEach((okr, i) => {
          systemContent += `${i + 1}. Objective: "${okr.okrDesc || `Objective ${i + 1}`}" | Year: ${okr.okrYear || "N/A"} | Quarter: ${okr.okrQuarter || "N/A"}\n`;
          systemContent += `   Quarterly Values: Q1: ${okr.q1_percentage ?? "Not updated"}% | Q2: ${okr.q2_percentage ?? "Not updated"}% | Q3: ${okr.q3_percentage ?? "Not updated"}% | Q4: ${okr.q4_percentage ?? "Not updated"}%\n`;
          const krs = [
            { key: "KR1", text: okr.kr1 },
            { key: "KR2", text: okr.kr2 },
            { key: "KR3", text: okr.kr3 },
            { key: "KR4", text: okr.kr4 },
            { key: "KR5", text: okr.kr5 },
          ].filter(k => k.text && String(k.text).trim().length > 0);

          if (krs.length > 0) {
            systemContent += `   Real Key Results:\n`;
            krs.forEach(k => {
              systemContent += `     - ${k.key}: ${String(k.text).trim()}\n`;
            });
          } else {
            systemContent += `   Real Key Results: None recorded\n`;
          }
        });
      }
      systemContent += `\n`;
    }

    systemContent += `\nALL EMPLOYEES COMPLETE DIRECTORY, REPORTING MANAGERS, OKRS & KEY RESULTS:\n`;
    for (const emp of employees) {
      const uid = emp.userId ? String(emp.userId).trim().toUpperCase() : "";
      const code = emp.empCode != null ? String(emp.empCode) : "";
      const empLvl = Number(emp.empLevel || 0);

      // Collect OKRs for this employee
      const empOkrs = [];
      const seenIds = new Set();
      const candidates = [
        ...(uid && okrsByUserId.has(uid) ? okrsByUserId.get(uid) : []),
        ...(code && okrsByEmpCode.has(code) ? okrsByEmpCode.get(code) : []),
      ];

      for (const okr of candidates) {
        const idStr = String(okr._id || `${okr.empLevel}_${okr.okrDesc}`);
        if (!seenIds.has(idStr)) {
          seenIds.add(idStr);
          empOkrs.push(okr);
        }
      }

      // Determine Reporting Manager / Senior
      let seniorInfo = "";
      if (empLvl <= 1) {
        seniorInfo = "None (Top Level Executive / CEO / Director - Highest rank in company hierarchy, reports to Board)";
      } else {
        const seniorLvl = empLvl - 1;
        const seniorTier = employeesByLevel.get(seniorLvl) || [];
        const seniorTierNames = seniorTier.map(s => `${s.empName} (${s.empDesignation || `Level ${seniorLvl}`})`).join(", ");

        // Check if any OKRs link directly to a specific parent OKR
        const directManagers = [];
        for (const okr of empOkrs) {
          const parentOkrCode = okr[`level${seniorLvl}OkrCode`];
          if (parentOkrCode != null) {
            const parentOkr = okrByLevelCode.get(`${seniorLvl}_${parentOkrCode}`);
            if (parentOkr) {
              const parentEmp = (parentOkr.userId && empByUserId.get(String(parentOkr.userId).toUpperCase())) ||
                                (parentOkr.empCode != null && empByEmpCode.get(String(parentOkr.empCode)));
              const mgrName = parentOkr.empName || parentEmp?.empName || `Manager (Code ${parentOkr.empCode})`;
              const mgrDesig = parentEmp?.empDesignation || `Level ${seniorLvl} Leader`;
              const mgrUid = parentOkr.userId || parentEmp?.userId || "N/A";
              const mgrEmail = parentEmp?.emailId || "N/A";
              directManagers.push(`${mgrName} (Designation: ${mgrDesig}, Level: ${seniorLvl}, User ID: ${mgrUid}, Email: ${mgrEmail})`);
            }
          }
        }

        if (directManagers.length > 0) {
          const uniqueManagers = [...new Set(directManagers)];
          seniorInfo = `Direct Reporting Manager: ${uniqueManagers.join("; ")} | Senior Level: Level ${seniorLvl}`;
        } else if (seniorTierNames) {
          seniorInfo = `Senior Level: Level ${seniorLvl} (Senior Managers at this level: ${seniorTierNames})`;
        } else {
          seniorInfo = `Senior Level: Level ${seniorLvl}`;
        }
      }

      systemContent += `\n--- Employee: ${emp.empName} ---\n`;
      systemContent += `User ID: ${emp.userId || "N/A"} | Employee Code: ${emp.empCode || "N/A"} | Rank: Level ${emp.empLevel || "N/A"}\n`;
      systemContent += `Designation: ${emp.empDesignation || "N/A"} | Email: ${emp.emailId || "N/A"} | Phone: ${emp.cellNumber || "N/A"}\n`;
      systemContent += `Admin Access: ${emp.isAdmin ? "Yes (Admin)" : "No (Standard User)"}\n`;
      systemContent += `Reporting Manager / Senior: ${seniorInfo}\n`;

      if (empOkrs.length === 0) {
        systemContent += `OKRs: No OKRs recorded yet for this employee.\n`;
      } else {
        systemContent += `OKRs (${empOkrs.length} total):\n`;
        empOkrs.forEach((okr, i) => {
          const q1 = okr.q1_percentage ?? null;
          const q2 = okr.q2_percentage ?? null;
          const q3 = okr.q3_percentage ?? null;
          const q4 = okr.q4_percentage ?? null;

          let latestQ = null, latestVal = 0;
          for (let q = 1; q <= 4; q++) {
            const val = okr[`q${q}_percentage`];
            if (val != null && val !== "") { latestQ = q; latestVal = Number(val); }
          }
          const expected = latestQ ? latestQ * 25 : null;
          const status = latestQ ? (latestVal >= expected ? "On Track" : "At Risk") : "No Data";

          systemContent += `  ${i + 1}. Objective: "${okr.okrDesc || `Objective ${i + 1}`}" (Year: ${okr.okrYear || "N/A"}, Quarter: ${okr.okrQuarter || "N/A"}) | Overall Status: ${status}\n`;

          // Specific parent OKR alignment if applicable
          if (empLvl > 1) {
            const parentOkrCode = okr[`level${empLvl - 1}OkrCode`];
            if (parentOkrCode != null) {
              const parentOkr = okrByLevelCode.get(`${empLvl - 1}_${parentOkrCode}`);
              if (parentOkr) {
                systemContent += `     Reporting Manager Alignment: Aligned to Level ${empLvl - 1} Manager ${parentOkr.empName || ""} (Parent Objective: "${parentOkr.okrDesc || ""}")\n`;
              }
            }
          }

          // Q1-Q4 Values & Comments
          systemContent += `     Quarterly Values & Updates:\n`;
          const quarters = [
            { q: "Q1", val: q1, target: 25, comment: okr.q1_comment },
            { q: "Q2", val: q2, target: 50, comment: okr.q2_comment },
            { q: "Q3", val: q3, target: 75, comment: okr.q3_comment },
            { q: "Q4", val: q4, target: 100, comment: okr.q4_comment },
          ];
          quarters.forEach(item => {
            const valStr = item.val != null ? `${item.val}%` : "Not updated";
            const qStatus = item.val != null ? (item.val >= item.target ? "On Track" : "At Risk") : "Pending";
            const cmt = item.comment && String(item.comment).trim() ? ` | Comment: "${String(item.comment).trim()}"` : "";
            systemContent += `       - ${item.q}: ${valStr} (Target: ${item.target}%, Status: ${qStatus})${cmt}\n`;
          });

          // Real Key Results (KR1 to KR5)
          const krs = [
            { key: "KR1", text: okr.kr1 },
            { key: "KR2", text: okr.kr2 },
            { key: "KR3", text: okr.kr3 },
            { key: "KR4", text: okr.kr4 },
            { key: "KR5", text: okr.kr5 },
          ].filter(k => k.text && String(k.text).trim().length > 0);

          if (krs.length > 0) {
            systemContent += `     Real Key Results:\n`;
            krs.forEach(k => {
              systemContent += `       - ${k.key}: ${String(k.text).trim()}\n`;
            });
          } else {
            systemContent += `     Real Key Results: None recorded\n`;
          }
        });
      }
    }

    const groqMessages = [
      { role: "system", content: systemContent },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: groqMessages,
      max_tokens: 1800,
      temperature: 0.2,
    });

    let reply = completion.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    // Fallback regex cleanup in case the LLM stubbornly uses markdown
    reply = reply
      .replace(/\*\*/g, "") // Remove bold
      .replace(/\*/g, "")   // Remove italics/bullets
      .replace(/#/g, "")    // Remove hashes
      .replace(/\|/g, "");  // Break tables

    return res.json({ reply });
  } catch (err) {
    console.error("[Agent] Error calling Groq:", err?.message || err);
    return res.status(500).json({ error: "Failed to get AI response. Please try again." });
  }
}

/**
 * POST /api/agent/insights
 * Generates proactive structured insights from OKR data
 */
export async function generateInsights(req, res) {
  try {
    const { okrContext } = req.body;

    if (!okrContext || !Array.isArray(okrContext.okrs) || !okrContext.okrs.length) {
      return res.json({ insights: [] });
    }

    let dataDesc = `Employee: ${okrContext.userName}\nOKRs:\n`;
    okrContext.okrs.forEach((okr, i) => {
      let latestQ = null, latestVal = 0;
      for (let q = 1; q <= 4; q++) {
        const val = okr[`q${q}_percentage`];
        if (val != null && val !== "") { latestQ = q; latestVal = Number(val); }
      }
      const expected = latestQ ? latestQ * 25 : null;
      const status = latestQ ? (latestVal >= expected ? "On Track" : "At Risk") : "No Data";
      dataDesc += `${i + 1}. Objective: "${okr.okrDesc || `OKR ${i + 1}`}": latest Q${latestQ}=${latestVal}%, expected=${expected}%, status=${status}\n`;
      dataDesc += `   Quarterly Values: Q1: ${okr.q1_percentage ?? "—"}%, Q2: ${okr.q2_percentage ?? "—"}%, Q3: ${okr.q3_percentage ?? "—"}%, Q4: ${okr.q4_percentage ?? "—"}%\n`;

      const krs = [okr.kr1, okr.kr2, okr.kr3, okr.kr4, okr.kr5]
        .filter(k => k && String(k).trim().length > 0)
        .map((k, idx) => `KR${idx + 1}: ${String(k).trim()}`);
      if (krs.length > 0) {
        dataDesc += `   Key Results: ${krs.join(" | ")}\n`;
      }
    });

    const prompt = `${dataDesc}\nBased on this OKR data, generate 3-5 concise, actionable insights. Return ONLY a JSON array with this exact structure, no other text:\n[\n  { "type": "warning|alert|insight|suggestion", "title": "short title", "message": "one sentence detail" }\n]\nTypes: "warning" = critical risk, "alert" = needs attention, "insight" = positive observation, "suggestion" = recommendation.`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: APP_KNOWLEDGE },
        { role: "user", content: prompt },
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const raw = completion.choices?.[0]?.message?.content || "[]";
    // Extract JSON array from response
    const match = raw.match(/\[[\s\S]*\]/);
    const insights = match ? JSON.parse(match[0]) : [];

    return res.json({ insights });
  } catch (err) {
    console.error("[Agent] Insights error:", err?.message || err);
    return res.status(500).json({ insights: [], error: "Failed to generate insights." });
  }
}
