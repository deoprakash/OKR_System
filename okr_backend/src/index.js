import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import employeeRoutes from "./routes/employees.js";
// note: generic okr routes removed (using level1..level7 routes instead)
import level1Routes from "./routes/level1.js";
import level2Routes from "./routes/level2.js";
import level3Routes from "./routes/level3.js";
import level4Routes from "./routes/level4.js";
import level5Routes from "./routes/level5.js";
import level6Routes from "./routes/level6.js";
import level7Routes from "./routes/level7.js";
import performanceRoutes from "./routes/performance.js";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);
const ALLOW_NULL_ORIGIN = (process.env.ALLOW_NULL_ORIGIN || "true").toLowerCase() === "true";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/okr_db";

app.use(morgan("dev"));
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (normalizedOrigin === "null" && ALLOW_NULL_ORIGIN) {
      return callback(null, true);
    }

    if (CLIENT_ORIGINS.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ status: "ok", service: "OKR backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/level1", level1Routes);
app.use("/api/level2", level2Routes);
app.use("/api/level3", level3Routes);
app.use("/api/level4", level4Routes);
app.use("/api/level5", level5Routes);
app.use("/api/level6", level6Routes);
app.use("/api/level7", level7Routes);
app.use("/api/performance", performanceRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI, {
      // use unifiedTopology and useNewUrlParser are default now in mongoose v7+
    });
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`OKR backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

start();
