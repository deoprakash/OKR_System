import express from "express";
import * as ctrl from "../controllers/level4Controller.js";
import Level4OKR from "../models/level4Okr.js";
import { requireAuth } from "../middleware/auth.js";
import { allowLevelRead, allowLevelWrite } from "../middleware/permissions.js";

const router = express.Router();

router.get("/", requireAuth, allowLevelRead(4), ctrl.list);
router.get("/:id", requireAuth, allowLevelRead(4), ctrl.get);
router.post("/", requireAuth, allowLevelWrite({ level: 4, model: Level4OKR, codeField: "level4OkrCode" }), ctrl.create);
router.put("/:id", requireAuth, allowLevelWrite({ level: 4, model: Level4OKR, codeField: "level4OkrCode" }), ctrl.update);
router.delete("/:id", requireAuth, allowLevelWrite({ level: 4, model: Level4OKR, codeField: "level4OkrCode" }), ctrl.remove);

export default router;
