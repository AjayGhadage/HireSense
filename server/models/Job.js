const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    recruiter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    department: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    employment_type: {
      type: DataTypes.ENUM(
        "Full-Time",
        "Part-Time",
        "Internship",
        "Contract",
        "Remote",
        "Hybrid",
        "On-site"
      ),
      allowNull: false,
    },

    experience: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    salary_min: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    salary_max: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    responsibilities: {
      type: DataTypes.TEXT,
    },

    education: {
      type: DataTypes.STRING,
    },

    vacancies: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    application_deadline: {
      type: DataTypes.DATEONLY,
    },

    status: {
      type: DataTypes.ENUM(
        "Draft",
        "Published",
        "Closed",
        "Archived"
      ),
      defaultValue: "Draft",
    },
  },
  {
    tableName: "jobs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Job;