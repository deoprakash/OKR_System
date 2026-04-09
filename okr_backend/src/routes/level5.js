import express from "express";
import * as ctrl from "../controllers/level5Controller.js";
import Level5OKR from "../models/level5Okr.js";
import { requireAuth } from "../middleware/auth.js";
import { allowLevelRead, allowLevelWrite } from "../middleware/permissions.js";

const router = express.Router();

router.get("/", requireAuth, allowLevelRead(5), ctrl.list);
router.get("/:id", requireAuth, allowLevelRead(5), ctrl.get);
router.post("/", requireAuth, allowLevelWrite({ level: 5, model: Level5OKR, codeField: "level5OkrCode" }), ctrl.create);
router.put("/:id", requireAuth, allowLevelWrite({ level: 5, model: Level5OKR, codeField: "level5OkrCode" }), ctrl.update);
router.delete("/:id", requireAuth, allowLevelWrite({ level: 5, model: Level5OKR, codeField: "level5OkrCode" }), ctrl.remove);

export default router;
