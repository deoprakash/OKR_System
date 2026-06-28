import express from "express";
import {
  getEmployees,
  searchAnalytics,
} from "../controllers/analyticsController.js";

import { requireAuth  } from "../middleware/auth.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Employee Dropdown
|--------------------------------------------------------------------------
*/

router.get(
  "/employees",
  requireAuth ,
  getEmployees
);

/*
|--------------------------------------------------------------------------
| Employee Analytics
|--------------------------------------------------------------------------
*/

router.get(
  "/search",
  requireAuth ,
  searchAnalytics
);

export default router;