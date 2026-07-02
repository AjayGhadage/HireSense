const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const JobSkill = sequelize.define(
  "JobSkill",
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

    skill: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    skill_type: {
      type: DataTypes.ENUM("required", "preferred"),
      allowNull: false,
    },
  },
  {
    tableName: "job_skills",
    timestamps: false,
  }
);

module.exports = JobSkill;