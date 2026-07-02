const { Candidate, ResumeUpload, Ranking, Job } = require("../models");
const { Op } = require("sequelize");

const getCandidatesByJob = async (jobId, recruiterId, query = {}) => {
  const {
    page = 1,
    limit = 20,
    status,
    sortBy = "created_at",
    order = "DESC",
  } = query;

  const where = { job_id: jobId };
  if (status) where.status = status;

  const { rows, count } = await Candidate.findAndCountAll({
    where,
    include: [
      {
        model: ResumeUpload,
        as: "resume",
        where: { recruiter_id: recruiterId },
        attributes: ["id", "original_filename", "status", "created_at"],
      },
      {
        model: Ranking,
        as: "ranking",
        attributes: ["match_score", "rank_position", "strengths", "skill_gaps"],
        required: false,
      },
    ],
    order: [[sortBy, order]],
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
  });

  return {
    candidates: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getAllCandidates = async (recruiterId, query = {}) => {
  const {
    page = 1,
    limit = 50,
    status,
    sortBy = "created_at",
    order = "DESC",
  } = query;

  const where = {};
  if (status) where.status = status;

  const { rows, count } = await Candidate.findAndCountAll({
    where,
    include: [
      {
        model: ResumeUpload,
        as: "resume",
        where: { recruiter_id: recruiterId },
        attributes: ["id", "original_filename", "status", "created_at"],
      },
      {
        model: Job,
        as: "job",
        attributes: ["title", "department", "location"],
      },
      {
        model: Ranking,
        as: "ranking",
        attributes: ["match_score", "rank_position", "strengths", "skill_gaps"],
        required: false,
      },
    ],
    order: [[sortBy, order]],
    limit: Number(limit),
    offset: (Number(page) - 1) * Number(limit),
  });

  return {
    candidates: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};

const getCandidateById = async (candidateId) => {
  const candidate = await Candidate.findByPk(candidateId, {
    include: [
      { model: ResumeUpload, as: "resume" },
      { model: Ranking, as: "ranking" },
    ],
  });

  if (!candidate) throw new Error("Candidate not found");
  return candidate;
};

const updateCandidateStatus = async (candidateId, status) => {
  const candidate = await Candidate.findByPk(candidateId);
  if (!candidate) throw new Error("Candidate not found");

  await candidate.update({ status });
  return candidate;
};

const updateCandidateNotes = async (candidateId, notes) => {
  const candidate = await Candidate.findByPk(candidateId);
  if (!candidate) throw new Error("Candidate not found");

  await candidate.update({ notes });
  return candidate;
};

module.exports = {
  getCandidatesByJob,
  getAllCandidates,
  getCandidateById,
  updateCandidateStatus,
  updateCandidateNotes,
};
