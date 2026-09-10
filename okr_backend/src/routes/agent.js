import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as agentController from "../controllers/agentController.js";

const router = Router();

// POST /api/agent/chat - Send a chat message to the AI agent
router.post("/chat", requireAuth, agentController.chat);

// POST /api/agent/insights - Generate proactive OKR insights
router.post("/insights", requireAuth, agentController.generateInsights);

export default router;
