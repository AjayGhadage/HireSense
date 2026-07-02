const { Job, Candidate, Ranking, ResumeUpload } = require("../models");
const { Op, fn, col, literal } = require("sequelize");

/**
 * Returns summary stats for the recruiter's dashboard.
 */
const getDashboardStats = async (recruiterId) => {
  // Total jobs created by this recruiter
  const totalJobs = await Job.count({
    where: { recruiter_id: recruiterId },
  });

  // Jobs by status
  const jobsByStatus = await Job.findAll({
    where: { recruiter_id: recruiterId },
    attributes: ["status", [fn("COUNT", col("id")), "count"]],
    group: ["status"],
    raw: true,
  });

  // Total candidates across all jobs by this recruiter
  const totalCandidates = await Candidate.count({
    include: [
      {
        model: ResumeUpload,
        as: "resume",
        where: { recruiter_id: recruiterId },
        attributes: [],
      },
    ],
  });

  // Candidates by status
  const candidatesByStatus = await Candidate.findAll({
    attributes: ["status", [fn("COUNT", col("Candidate.id")), "count"]],
    include: [
      {
        model: ResumeUpload,
        as: "resume",
        where: { recruiter_id: recruiterId },
        attributes: [],
      },
    ],
    group: ["Candidate.status"],
    raw: true,
  });

  // Average match score across all rankings for this recruiter's jobs
  const avgScoreResult = await Ranking.findOne({
    attributes: [[fn("AVG", col("Ranking.match_score")), "avg_score"]],
    include: [
      {
        model: Job,
        as: "job",
        where: { recruiter_id: recruiterId },
        attributes: [],
      },
    ],
    raw: true,
  });

  const avgMatchScore = avgScoreResult?.avg_score
    ? Math.round(parseFloat(avgScoreResult.avg_score) * 10) / 10
    : 0;

  // Shortlisted / interview candidates
  const shortlisted = await Candidate.count({
    where: { status: "shortlisted" },
    include: [
      {
        model: ResumeUpload,
        as: "resume",
        where: { recruiter_id: recruiterId },
        attributes: [],
      },
    ],
  });

  const interviewed = await Candidate.count({
    where: { status: "interviewed" },
    include: [
      {
        model: ResumeUpload,
        as: "resume",
        where: { recruiter_id: recruiterId },
        attributes: [],
      },
    ],
  });

  // Recent 5 jobs
  const recentJobs = await Job.findAll({
    where: { recruiter_id: recruiterId },
    order: [["created_at", "DESC"]],
    limit: 5,
    attributes: ["id", "title", "status", "created_at"],
    raw: true,
  });

  return {
    totalJobs,
    totalCandidates,
    shortlisted,
    interviewed,
    avgMatchScore,
    jobsByStatus,
    candidatesByStatus,
    recentJobs,
  };
};

module.exports = { getDashboardStats };
