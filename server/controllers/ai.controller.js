const { chat, generateInterviewQuestions } = require("../services/ai.service");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const chatHandler = async (req, res) => {
  try {
    const { question, job_id } = req.body;
    if (!question || !job_id) {
      return errorResponse(res, "question and job_id are required", 400);
    }

    const result = await chat(question, job_id, req.user.id);
    return successResponse(res, result, "AI response");
  } catch (error) {
    console.error("AI Chat Error:", error);
    return errorResponse(res, error.message, 500);
  }
};

const questionsHandler = async (req, res) => {
  try {
    const result = await generateInterviewQuestions(
      req.params.candidateId,
      req.user.id
    );
    return successResponse(res, result, "Interview questions generated");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { chatHandler, questionsHandler };
