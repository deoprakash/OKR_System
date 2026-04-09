import { Router } from "express";
import * as performanceController from "../controllers/performanceController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/performance/okrs/:empCode - Get all OKRs for an employee
router.get("/okrs/:empCode", requireAuth, performanceController.getEmployeeOKRs);

// GET /api/performance/:level/:okrCode - Get OKR hierarchy
router.get("/:level/:okrCode", requireAuth, performanceController.getOKRHierarchy);

export default router;
