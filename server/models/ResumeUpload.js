const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ResumeUpload = sequelize.define(
  "ResumeUpload",
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

    recruiter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    original_filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    stored_path: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    mimetype: {
      type: DataTypes.STRING,
    },

    file_size: {
      type: DataTypes.INTEGER,
    },

    status: {
      type: DataTypes.ENUM("uploaded", "processing", "parsed", "failed"),
      defaultValue: "uploaded",
    },

    error_message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "resume_uploads",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ResumeUpload;
