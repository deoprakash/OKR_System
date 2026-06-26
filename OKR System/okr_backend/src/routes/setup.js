import express from "express";
import Employee from "../models/employee.js";

const router = express.Router();

// Returns whether initial setup (create first admin) is allowed.
router.get("/", async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    res.json({ setupEnabled: count === 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to determine setup status" });
  }
});

export default router;
