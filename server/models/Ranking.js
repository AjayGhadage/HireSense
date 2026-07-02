const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Ranking = sequelize.define(
  "Ranking",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    candidate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // Overall composite score (0-100)
    match_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    // Sub-scores
    skill_match_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    experience_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    education_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    project_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    certification_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    // AI-generated reasoning
    ai_explanation: {
      type: DataTypes.TEXT,
    },

    strengths: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    skill_gaps: {
      type: DataTypes.JSON,
      defaultValue: [],
    },

    interview_recommendation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // Position in ranked leaderboard for this job
    rank_position: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "rankings",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Ranking;
