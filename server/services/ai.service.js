const axios = require("axios");
const { Candidate, Job, JobSkill, Ranking } = require("../models");

const AI_SERVICE = process.env.AI_SERVICE || "http://localhost:8000";

/**
 * Natural language chat with AI recruiter assistant
 */
const chat = async (question, jobId, userId) => {
  // Fetch context: job + skills + top ranked candidates
  const job = await Job.findOne({
    where: { id: jobId, recruiter_id: userId },
    include: [{ model: JobSkill, as: "skills" }],
  });
  if (!job) throw new Error("Job not found");

  const rankings = await Ranking.findAll({
    where: { job_id: jobId },
    include: [{ model: Candidate, as: "candidate" }],
    order: [["rank_position", "ASC"]],
    limit: 10,
  });

  const response = await axios.post(`${AI_SERVICE}/chat`, {
    question,
    job: {
      title: job.title,
      description: job.description,
      skills: (job.skills || []).map((s) => s.skill),
    },
    candidates: rankings.map((r) => ({
      name: r.candidate?.name,
      match_score: r.match_score,
      rank_position: r.rank_position,
      strengths: r.strengths,
      skill_gaps: r.skill_gaps,
      experience_years: r.candidate?.experience_years,
      skills: r.candidate?.skills,
    })),
  });

  return response.data;
};

/**
 * Generate interview questions for a specific candidate based on job + gaps
 */
const generateInterviewQuestions = async (candidateId, userId) => {
  const candidate = await Candidate.findByPk(candidateId, {
    include: [{ model: Ranking, as: "ranking" }],
  });

  if (!candidate) throw new Error("Candidate not found");

  const job = await Job.findOne({
    where: { id: candidate.job_id, recruiter_id: userId },
  });

  if (!job) throw new Error("Job not found or unauthorized");

  const response = await axios.post(`${AI_SERVICE}/generate-questions`, {
    candidate: {
      name: candidate.name,
      skills: candidate.skills,
      experience_years: candidate.experience_years,
      projects: candidate.projects,
      certifications: candidate.certifications,
    },
    job: {
      title: job.title,
      description: job.description,
      experience: job.experience,
    },
    skill_gaps: candidate.ranking?.skill_gaps || [],
    strengths: candidate.ranking?.strengths || [],
  });

  return response.data;
};

module.exports = { chat, generateInterviewQuestions };
