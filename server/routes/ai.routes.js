const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/auth.middleware");
const { chatHandler, questionsHandler } = require("../controllers/ai.controller");

// AI recruiter chat
router.post("/chat", authenticate, chatHandler);

// Generate interview questions for a candidate
router.post("/questions/:candidateId", authenticate, questionsHandler);

module.exports = router;
