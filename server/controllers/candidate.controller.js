const {
  getCandidatesByJob,
  getAllCandidates,
  getCandidateById,
  updateCandidateStatus,
  updateCandidateNotes,
} = require("../services/candidate.service");

const { successResponse, errorResponse } = require("../utils/apiResponse");

const listByJob = async (req, res) => {
  try {
    const data = await getCandidatesByJob(
      req.params.jobId,
      req.user.id,
      req.query
    );
    return successResponse(res, data, "Candidates fetched");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const listAll = async (req, res) => {
  try {
    const data = await getAllCandidates(req.user.id, req.query);
    return successResponse(res, data, "All candidates fetched");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getOne = async (req, res) => {
  try {
    const candidate = await getCandidateById(req.params.id);
    return successResponse(res, candidate, "Candidate fetched");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return errorResponse(res, "status is required", 400);

    const candidate = await updateCandidateStatus(req.params.id, status);
    return successResponse(res, candidate, "Candidate status updated");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const updateNotes = async (req, res) => {
  try {
    const { notes } = req.body;
    const candidate = await updateCandidateNotes(req.params.id, notes);
    return successResponse(res, candidate, "Notes saved");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = { listByJob, listAll, getOne, updateStatus, updateNotes };
