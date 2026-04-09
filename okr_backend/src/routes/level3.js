import express from "express";
import * as ctrl from "../controllers/level3Controller.js";
import Level3OKR from "../models/level3Okr.js";
import { requireAuth } from "../middleware/auth.js";
import { allowLevelRead, allowLevelWrite } from "../middleware/permissions.js";

const router = express.Router();

router.get("/", requireAuth, allowLevelRead(3), ctrl.list);
router.get("/:id", requireAuth, allowLevelRead(3), ctrl.get);
router.post("/", requireAuth, allowLevelWrite({ level: 3, model: Level3OKR, codeField: "level3OkrCode" }), ctrl.create);
router.put("/:id", requireAuth, allowLevelWrite({ level: 3, model: Level3OKR, codeField: "level3OkrCode" }), ctrl.update);
router.delete("/:id", requireAuth, allowLevelWrite({ level: 3, model: Level3OKR, codeField: "level3OkrCode" }), ctrl.remove);

export default router;
