const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const { trigger, getLeaderboard, compare } = require("../controllers/ranking.controller");

// Trigger AI ranking for a job
router.post("/trigger/:jobId", authenticate, trigger);

// Get ranked leaderboard for a job
router.get("/job/:jobId", authenticate, getLeaderboard);

// Compare multiple candidates: GET /api/rankings/compare?ids=1,2,3
router.get("/compare", authenticate, compare);

module.exports = router;
