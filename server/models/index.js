const sequelize = require("../config/db");

const User = require("./User");
const Job = require("./Job");
const JobSkill = require("./JobSkill");
const ResumeUpload = require("./ResumeUpload");
const Candidate = require("./Candidate");
const Ranking = require("./Ranking");

/*
|--------------------------------------------------------------------------
| User -> Jobs
|--------------------------------------------------------------------------
*/
User.hasMany(Job, { foreignKey: "recruiter_id", as: "jobs" });
Job.belongsTo(User, { foreignKey: "recruiter_id", as: "recruiter" });

/*
|--------------------------------------------------------------------------
| Job -> Skills
|--------------------------------------------------------------------------
*/
Job.hasMany(JobSkill, { foreignKey: "job_id", as: "skills" });
JobSkill.belongsTo(Job, { foreignKey: "job_id" });

/*
|--------------------------------------------------------------------------
| Job -> ResumesUploads
|--------------------------------------------------------------------------
*/
Job.hasMany(ResumeUpload, { foreignKey: "job_id", as: "resumes" });
ResumeUpload.belongsTo(Job, { foreignKey: "job_id", as: "job" });

/*
|--------------------------------------------------------------------------
| User (Recruiter) -> ResumeUploads
|--------------------------------------------------------------------------
*/
User.hasMany(ResumeUpload, { foreignKey: "recruiter_id", as: "uploads" });
ResumeUpload.belongsTo(User, { foreignKey: "recruiter_id", as: "uploader" });

/*
|--------------------------------------------------------------------------
| ResumeUpload -> Candidate (1:1)
|--------------------------------------------------------------------------
*/
ResumeUpload.hasOne(Candidate, { foreignKey: "resume_id", as: "candidate" });
Candidate.belongsTo(ResumeUpload, { foreignKey: "resume_id", as: "resume" });

/*
|--------------------------------------------------------------------------
| Job -> Candidates
|--------------------------------------------------------------------------
*/
Job.hasMany(Candidate, { foreignKey: "job_id", as: "candidates" });
Candidate.belongsTo(Job, { foreignKey: "job_id", as: "job" });

/*
|--------------------------------------------------------------------------
| Job -> Rankings
|--------------------------------------------------------------------------
*/
Job.hasMany(Ranking, { foreignKey: "job_id", as: "rankings" });
Ranking.belongsTo(Job, { foreignKey: "job_id", as: "job" });

/*
|--------------------------------------------------------------------------
| Candidate -> Rankings (1:1 per job)
|--------------------------------------------------------------------------
*/
Candidate.hasOne(Ranking, { foreignKey: "candidate_id", as: "ranking" });
Ranking.belongsTo(Candidate, { foreignKey: "candidate_id", as: "candidate" });

module.exports = {
  sequelize,
  User,
  Job,
  JobSkill,
  ResumeUpload,
  Candidate,
  Ranking,
};