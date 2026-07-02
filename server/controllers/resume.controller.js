const {
  uploadResumes,
  getResumesByJob,
  getAllResumes,
  getResumeById,
  deleteResume,
} = require("../services/resume.service");

const { successResponse, errorResponse } = require("../utils/apiResponse");

const upload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, "No files uploaded", 400);
    }

    const jobId = req.body.job_id || req.body.jobId;
    if (!jobId) {
      return errorResponse(res, "job_id is required", 400);
    }

    const results = await uploadResumes(req.user.id, jobId, req.files);

    return successResponse(
      res,
      results,
      `${results.length} resume(s) uploaded. AI parsing started.`,
      202
    );
  } catch (error) {
    console.error("Resume Upload Error:", error);
    return errorResponse(res, error.message || "Upload failed", 500);
  }
};

const listByJob = async (req, res) => {
  try {
    const resumes = await getResumesByJob(req.params.jobId, req.user.id);
    return successResponse(res, resumes, "Resumes fetched");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const listAll = async (req, res) => {
  try {
    const resumes = await getAllResumes(req.user.id);
    return successResponse(res, resumes, "All resumes fetched");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getOne = async (req, res) => {
  try {
    const resume = await getResumeById(req.params.id, req.user.id);
    return successResponse(res, resume, "Resume fetched");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

const remove = async (req, res) => {
  try {
    await deleteResume(req.params.id, req.user.id);
    return successResponse(res, null, "Resume deleted");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

module.exports = { upload, listByJob, listAll, getOne, remove };
