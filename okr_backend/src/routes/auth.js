import express from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/request-otp", authController.requestOtp);
router.post("/verify-otp", authController.verifyOtp);
router.get("/me", requireAuth, authController.me);
router.post("/logout", requireAuth, authController.logout);

export default router;
