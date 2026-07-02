const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const { sequelize } = require("./models");

// Routes
const authRoutes = require("./routes/auth.routes");
const jobRoutes = require("./routes/job.routes");
const resumeRoutes = require("./routes/resume.routes");
const candidateRoutes = require("./routes/candidate.routes");
const rankingRoutes = require("./routes/ranking.routes");
const aiRoutes = require("./routes/ai.routes");
const analyticsRoutes = require("./routes/analytics.routes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true,
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/rankings", rankingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HireSense AI Backend Running 🚀",
    version: "1.0.0",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ MySQL Connected Successfully");
    await sequelize.sync();
    console.log("✅ Database Synced");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database Connection Failed:", err.message);
    process.exit(1);
  });