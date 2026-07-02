const {
  triggerRanking,
  getRankedCandidates,
  compareCandidates,
} = require("../services/ranking.service");

const { successResponse, errorResponse } = require("../utils/apiResponse");

const trigger = async (req, res) => {
  try {
    const result = await triggerRanking(req.params.jobId, req.user.id);
    return successResponse(res, result, "AI Ranking completed");
  } catch (error) {
    console.error("Ranking Error:", error);
    return errorResponse(res, error.message, 500);
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const rankings = await getRankedCandidates(req.params.jobId, req.user.id);
    return successResponse(res, rankings, "Rankings fetched");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const compare = async (req, res) => {
  try {
    // Accept comma-separated ids or array: ?ids=1,2,3
    const raw = req.query.ids;
    if (!raw) return errorResponse(res, "ids query param required", 400);

    const ids = String(raw)
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter(Boolean);

    if (ids.length < 2) {
      return errorResponse(res, "At least 2 candidate ids required", 400);
    }

    const candidates = await compareCandidates(ids);
    return successResponse(res, candidates, "Comparison ready");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

module.exports = { trigger, getLeaderboard, compare };
