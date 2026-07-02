const { Op } = require("sequelize");
const { sequelize, Job, JobSkill, User } = require("../models");

const createJob = async (recruiterId, jobData) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      title,
      department,
      location,
      employment_type,
      experience,
      salary_min,
      salary_max,
      description,
      responsibilities,
      education,
      vacancies,
      application_deadline,
      skills,
    } = jobData;

    // Create Job
    const job = await Job.create(
      {
        recruiter_id: recruiterId,
        title,
        department,
        location,
        employment_type,
        experience,
        salary_min,
        salary_max,
        description,
        responsibilities,
        education,
        vacancies,
        application_deadline,
      },
      { transaction }
    );

    // Create Skills
    if (skills && skills.length > 0) {
      const skillData = skills.map((item) => ({
        job_id: job.id,
        skill: item.skill,
        skill_type: item.skill_type,
      }));

      await JobSkill.bulkCreate(skillData, { transaction });
    }

    await transaction.commit();

    return job;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
const getAllJobs = async (query, recruiterId) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    department,
    location,
    status,
    employment_type,
    sortBy = "created_at",
    order = "DESC",
  } = query;

  const where = {
    recruiter_id: recruiterId,
  };

  if (search) {
    where.title = {
      [Op.like]: `%${search}%`,
    };
  }

  if (department) {
    where.department = department;
  }

  if (location) {
    where.location = location;
  }

  if (status) {
    where.status = status;
  }

  if (employment_type) {
    where.employment_type = employment_type;
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Job.findAndCountAll({
    where,

    include: [
      {
        model: JobSkill,
        as: "skills",
      },
    ],

    limit: Number(limit),

    offset: Number(offset),

    order: [[sortBy, order]],
  });

  return {
    jobs: rows,

    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  };
};
const getJobById = async (jobId, recruiterId) => {
  const job = await Job.findOne({
    where: {
      id: jobId,
      recruiter_id: recruiterId,
    },

    include: [
      {
        model: JobSkill,
        as: "skills",
      },
      {
        model: User,
        as: "recruiter",
        attributes: {
          exclude: ["password"],
        },
      },
    ],
  });

  if (!job) {
    throw new Error("Job not found");
  }

  return job;
};
const updateJob = async (jobId, recruiterId, jobData) => {
  const transaction = await sequelize.transaction();

  try {
    const job = await Job.findOne({
      where: {
        id: jobId,
        recruiter_id: recruiterId,
      },
      transaction,
    });

    if (!job) {
      throw new Error("Job not found");
    }

    const {
      title,
      department,
      location,
      employment_type,
      experience,
      salary_min,
      salary_max,
      description,
      responsibilities,
      education,
      vacancies,
      application_deadline,
      status,
      skills,
    } = jobData;

    await job.update(
      {
        title,
        department,
        location,
        employment_type,
        experience,
        salary_min,
        salary_max,
        description,
        responsibilities,
        education,
        vacancies,
        application_deadline,
        status,
      },
      { transaction }
    );

    // Remove existing skills
    await JobSkill.destroy({
      where: { job_id: job.id },
      transaction,
    });

    // Insert updated skills
    if (Array.isArray(skills) && skills.length > 0) {
      await JobSkill.bulkCreate(
        skills.map((item) => ({
          job_id: job.id,
          skill: item.skill,
          skill_type: item.skill_type,
        })),
        { transaction }
      );
    }

    await transaction.commit();

    return await getJobById(job.id, recruiterId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
const deleteJob = async (jobId, recruiterId) => {
  const transaction = await sequelize.transaction();

  try {
    const job = await Job.findOne({
      where: {
        id: jobId,
        recruiter_id: recruiterId,
      },
      transaction,
    });

    if (!job) {
      throw new Error("Job not found");
    }

    // Delete all skills
    await JobSkill.destroy({
      where: {
        job_id: job.id,
      },
      transaction,
    });

    // Delete job
    await job.destroy({
      transaction,
    });

    await transaction.commit();

    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const updateJobStatus = async (jobId, recruiterId, status) => {
  const job = await Job.findOne({
    where: { id: jobId, recruiter_id: recruiterId },
  });

  if (!job) {
    throw new Error("Job not found");
  }

  await job.update({ status });

  return await getJobById(job.id, recruiterId);
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  updateJobStatus,
};