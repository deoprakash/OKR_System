import express from "express";
import * as employeeController from "../controllers/employeeController.js";
import { requireAuth, attachAuthUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, employeeController.list);
router.get("/:id", requireAuth, employeeController.get);
router.post("/", attachAuthUser, employeeController.create);
router.put("/:id", requireAuth, employeeController.update);
router.delete("/:id", requireAuth, employeeController.remove);

export default router;
