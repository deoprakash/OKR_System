import express from "express";
import * as ctrl from "../controllers/level1Controller.js";

const router = express.Router();

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
