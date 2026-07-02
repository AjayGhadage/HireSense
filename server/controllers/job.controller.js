const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
} = require("../services/job.service");

const { successResponse, errorResponse } = require("../utils/apiResponse");

const create = async (req, res) => {
  try {
    const job = await createJob(req.user.id, req.body);
    return successResponse(res, job, "Job created successfully", 201);
  } catch (error) {
    console.error("Create Job Error:", error);
    return errorResponse(res, error.message || "Failed to create job", 500);
  }
};

const getAll = async (req, res) => {
  try {
    const data = await getAllJobs(req.query, req.user.id);
    return successResponse(res, data, "Jobs fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

const getOne = async (req, res) => {
  try {
    const job = await getJobById(req.params.id, req.user.id);
    return successResponse(res, job, "Job fetched successfully");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

const update = async (req, res) => {
  try {
    const job = await updateJob(req.params.id, req.user.id, req.body);
    return successResponse(res, job, "Job updated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

const remove = async (req, res) => {
  try {
    await deleteJob(req.params.id, req.user.id);
    return successResponse(res, null, "Job deleted successfully");
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await updateJobStatus(req.params.id, req.user.id, status);
    return successResponse(res, job, "Job status updated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  update,
  remove,
  updateStatus,
};