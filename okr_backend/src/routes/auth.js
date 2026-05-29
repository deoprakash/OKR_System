import express from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/change-password", requireAuth, authController.changePassword);
router.get("/me", requireAuth, authController.me);
router.post("/logout", requireAuth, authController.logout);

export default router;
