/**
 * agentApi.js
 * Modular API layer for the OKR AI Agent.
 * All calls are proxied through the backend to keep the Groq key server-side.
 */

const localBaseUrl = "http://localhost:5000";
const deployedBaseUrl = "https://okr-system-psi.vercel.app";
const isPackagedElectron =
  typeof window !== "undefined" &&
  window.location &&
  window.location.protocol === "file:";
const baseUrl =
  import.meta.env.VITE_API_URL ||
  (isPackagedElectron
    ? deployedBaseUrl
    : import.meta.env.DEV
      ? localBaseUrl
      : deployedBaseUrl);

function getToken() {
  try {
    return localStorage.getItem("authToken") || "";
  } catch {
    return "";
  }
}

async function agentRequest(path, body) {
  const token = getToken();
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Agent request failed");
  }
  return res.json();
}

/**
 * Send a chat message to the AI agent.
 * @param {Array} messages - [{role: 'user'|'assistant', content: string}]
 * @param {Object} okrContext - { userName, okrs[] }
 * @returns {Promise<{ reply: string }>}
 */
export function sendChatMessage(messages, okrContext) {
  return agentRequest("/api/agent/chat", { messages, okrContext });
}

/**
 * Generate proactive insights from the user's OKR data.
 * @param {Object} okrContext - { userName, okrs[] }
 * @returns {Promise<{ insights: Array }>}
 */
export function fetchProactiveInsights(okrContext) {
  return agentRequest("/api/agent/insights", { okrContext });
}
