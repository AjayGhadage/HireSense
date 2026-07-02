const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const { dashboard } = require("../controllers/analytics.controller");

// GET /api/analytics/dashboard
router.get("/dashboard", authenticate, dashboard);

module.exports = router;
