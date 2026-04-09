import express from "express";
import * as ctrl from "../controllers/level1Controller.js";
import Level1OKR from "../models/level1Okr.js";
import { requireAuth } from "../middleware/auth.js";
import { allowLevelRead, allowLevelWrite } from "../middleware/permissions.js";

const router = express.Router();

router.get("/", requireAuth, allowLevelRead(1), ctrl.list);
router.get("/:id", requireAuth, allowLevelRead(1), ctrl.get);
router.post("/", requireAuth, allowLevelWrite({ level: 1, model: Level1OKR, codeField: "level1OkrCode" }), ctrl.create);
router.put("/:id", requireAuth, allowLevelWrite({ level: 1, model: Level1OKR, codeField: "level1OkrCode" }), ctrl.update);
router.delete("/:id", requireAuth, allowLevelWrite({ level: 1, model: Level1OKR, codeField: "level1OkrCode" }), ctrl.remove);

export default router;
