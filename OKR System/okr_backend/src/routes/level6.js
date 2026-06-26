import express from "express";
import * as ctrl from "../controllers/level6Controller.js";
import Level6OKR from "../models/level6Okr.js";
import { requireAuth } from "../middleware/auth.js";
import { allowLevelRead, allowLevelWrite } from "../middleware/permissions.js";

const router = express.Router();

router.get("/", requireAuth, allowLevelRead(6), ctrl.list);
router.get("/:id", requireAuth, allowLevelRead(6), ctrl.get);
router.post("/", requireAuth, allowLevelWrite({ level: 6, model: Level6OKR, codeField: "level6OkrCode" }), ctrl.create);
router.put("/:id", requireAuth, allowLevelWrite({ level: 6, model: Level6OKR, codeField: "level6OkrCode" }), ctrl.update);
router.delete("/:id", requireAuth, allowLevelWrite({ level: 6, model: Level6OKR, codeField: "level6OkrCode" }), ctrl.remove);

export default router;
