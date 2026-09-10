import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const APP_KNOWLEDGE = `
You are an AI assistant embedded in "Objecto" — an OKR (Objectives and Key Results) tracking application.

APP FEATURES:
- Employees log in and can view their OKR performance dashboard
- OKRs are tracked quarterly (Q1-Q4) with percentage progress
- Each OKR has a quarterly comment/update field
- Quarterly benchmarks: Q1=25%, Q2=50%, Q3=75%, Q4=100%
- An OKR is "On Track" if its latest updated quarter meets or exceeds the benchmark
- An OKR is "At Risk" if it is below the quarterly benchmark
- EMPLOYEE HIERARCHY: Level 1 is the highest rank / top post (e.g., CEO/Director). As the level number increases, the rank goes down. Level 7 is the lowest rank / junior post.

HOW TO USE THE APP:
- To update OKR progress: Go to "My OKR" to update the progress.
- To view your performance: Go to "OKR Performance" in the navigation menu
- To see detailed charts: Select a specific OKR from the dropdown on the dashboard
- For login issues: Use the "Forgot Password" link on the login page

RESPONSE GUIDELINES:
- Be concise, professional, and actionable
- When discussing OKR data, be specific (name the OKR, quote exact percentages)
- For performance questions, always reference the quarterly benchmarks
- If asked something outside your knowledge, say so clearly
- Use encouraging but honest language

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

    // Build system prompt with live OKR context
    let systemContent = APP_KNOWLEDGE;
    if (okrContext) {
      systemContent += `\n\nCONTEXT:\nLogged-in User: ${okrContext.userName || "Unknown"}\nUser Currently Being Viewed: ${okrContext.targetUserName || okrContext.userName || "Unknown"}\nToday: ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n\n`;
    }

    // Fetch all employees and their OKRs to allow cross-user comparisons
    systemContent += `\nALL EMPLOYEES OKR DATA:\n`;
    const employees = await Employee.find({}, { userId: 1, empName: 1, empLevel: 1, emailId: 1, empDesignation: 1 }).lean();
    const modelMap = {
      1: Level1OKR, 2: Level2OKR, 3: Level3OKR, 4: Level4OKR, 5: Level5OKR, 6: Level6OKR, 7: Level7OKR,
    };
    
    for (const emp of employees) {
      const OKRModel = modelMap[emp.empLevel];
      if (OKRModel) {
        const okrs = await OKRModel.find({ userId: emp.userId }).lean();
        if (okrs.length >= 0) {
          systemContent += `\n--- Employee: ${emp.empName} ---\n`;
          systemContent += `Level: ${emp.empLevel || "N/A"} | Designation: ${emp.empDesignation || "N/A"} | Contact: ${emp.emailId || "N/A"}\n`;
          okrs.forEach((okr, i) => {
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
            systemContent += `${i + 1}. "${okr.okrDesc || `OKR ${i + 1}`}" - Q1:${q1 ?? "—"}% Q2:${q2 ?? "—"}% Q3:${q3 ?? "—"}% Q4:${q4 ?? "—"}% | Status: ${status}\n`;
            if (okr[`q${latestQ}_comment`]) {
              systemContent += `   Last Comment: "${okr[`q${latestQ}_comment`]}"\n`;
            }
          });
        }
      }
    }

    const groqMessages = [
      { role: "system", content: systemContent },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ];

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: groqMessages,
      max_tokens: 800,
      temperature: 0.6,
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
      dataDesc += `${i + 1}. "${okr.okrDesc || `OKR ${i + 1}`}": latest Q${latestQ}=${latestVal}%, expected=${expected}%, status=${status}\n`;
    });

    const prompt = `${dataDesc}\nBased on this OKR data, generate 3-5 concise, actionable insights. Return ONLY a JSON array with this exact structure, no other text:\n[\n  { "type": "warning|alert|insight|suggestion", "title": "short title", "message": "one sentence detail" }\n]\nTypes: "warning" = critical risk, "alert" = needs attention, "insight" = positive observation, "suggestion" = recommendation.`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: APP_KNOWLEDGE },
        { role: "user", content: prompt },
      ],
      max_tokens: 600,
      temperature: 0.4,
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
