const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Candidate = sequelize.define(
  "Candidate",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    resume_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Parsed basic info
    name: {
      type: DataTypes.STRING,
    },

    email: {
      type: DataTypes.STRING,
    },

    phone: {
      type: DataTypes.STRING,
    },

    // Parsed structured data (stored as JSON)
    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    experience_years: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    education_level: {
      type: DataTypes.STRING,
    },

    experience_details: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    education_details: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    projects: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    certifications: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    languages: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    summary: {
      type: DataTypes.TEXT,
    },

    // Full raw parsed output from AI service
    raw_parsed_data: {
      type: DataTypes.JSON,
    },

    // Recruiter actions
    status: {
      type: DataTypes.ENUM("new", "shortlisted", "rejected", "interviewed"),
      defaultValue: "new",
    },

    notes: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "candidates",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Candidate;
