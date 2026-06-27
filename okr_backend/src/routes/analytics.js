import express from "express";
import { employeeTrend } from "../controllers/analyticsController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/employee/:userId", requireAuth, employeeTrend);

export default router;
