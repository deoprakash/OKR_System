import express from "express";
import * as ctrl from "../controllers/level2Controller.js";
import Level2OKR from "../models/level2Okr.js";
import { requireAuth } from "../middleware/auth.js";
import { allowLevelRead, allowLevelWrite } from "../middleware/permissions.js";

const router = express.Router();

router.get("/", requireAuth, allowLevelRead(2), ctrl.list);
router.get("/:id", requireAuth, allowLevelRead(2), ctrl.get);
router.post("/", requireAuth, allowLevelWrite({ level: 2, model: Level2OKR, codeField: "level2OkrCode" }), ctrl.create);
router.put("/:id", requireAuth, allowLevelWrite({ level: 2, model: Level2OKR, codeField: "level2OkrCode" }), ctrl.update);
router.delete("/:id", requireAuth, allowLevelWrite({ level: 2, model: Level2OKR, codeField: "level2OkrCode" }), ctrl.remove);

export default router;
