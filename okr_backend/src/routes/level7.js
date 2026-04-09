import express from "express";
import * as ctrl from "../controllers/level7Controller.js";
import Level7OKR from "../models/level7Okr.js";
import { requireAuth } from "../middleware/auth.js";
import { allowLevelRead, allowLevelWrite } from "../middleware/permissions.js";

const router = express.Router();

router.get("/", requireAuth, allowLevelRead(7), ctrl.list);
router.get("/:id", requireAuth, allowLevelRead(7), ctrl.get);
router.post("/", requireAuth, allowLevelWrite({ level: 7, model: Level7OKR, codeField: "level7OkrCode" }), ctrl.create);
router.put("/:id", requireAuth, allowLevelWrite({ level: 7, model: Level7OKR, codeField: "level7OkrCode" }), ctrl.update);
router.delete("/:id", requireAuth, allowLevelWrite({ level: 7, model: Level7OKR, codeField: "level7OkrCode" }), ctrl.remove);

export default router;
