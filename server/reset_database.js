const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
require("dotenv").config();

const { sequelize, User, Job, JobSkill, ResumeUpload, Candidate, Ranking } = require("./models");

async function resetAndSeed() {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB.");

    console.log("Resetting database tables (forcing sync)...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await sequelize.sync({ force: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("Database tables recreated successfully.");

    // Create default recruiter user
    console.log("Creating default recruiter...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    const recruiter = await User.create({
      full_name: "Redrob AI Recruiter",
      email: "recruiter@redrob.com",
      password: hashedPassword,
      role: "recruiter",
    });
    console.log("Default user created:", recruiter.email);

    // Read job description
    const jdPath = path.join(__dirname, "../India_runs_data_and_ai_challenge/job_description.txt");
    const jdDescription = fs.existsSync(jdPath) 
      ? fs.readFileSync(jdPath, "utf-8")
      : "Senior AI Engineer — Founding Team role at Redrob AI.";

    // Seed jobs for the recruiter
    console.log("Seeding job posting...");
    const job = await Job.create({
      recruiter_id: recruiter.id,
      title: "Senior AI Engineer — Founding Team",
      department: "Engineering",
      location: "Pune/Noida, India",
      employment_type: "Full-Time",
      experience: "5-9 years",
      salary_min: 2500000,
      salary_max: 5000000,
      description: jdDescription,
      status: "Published",
    });

    // Add skills
    const skills = [
      { job_id: job.id, skill: "embeddings-based retrieval", skill_type: "required" },
      { job_id: job.id, skill: "vector databases", skill_type: "required" },
      { job_id: job.id, skill: "python", skill_type: "required" },
      { job_id: job.id, skill: "evaluation frameworks", skill_type: "required" },
      { job_id: job.id, skill: "llm fine-tuning", skill_type: "preferred" },
      { job_id: job.id, skill: "learning-to-rank", skill_type: "preferred" },
    ];
    await JobSkill.bulkCreate(skills);
    console.log("Job skills seeded.");

    // Load candidates from sample_candidates.json
    const candPath = path.join(__dirname, "../India_runs_data_and_ai_challenge/sample_candidates.json");
    if (fs.existsSync(candPath)) {
      const candData = JSON.parse(fs.readFileSync(candPath, "utf-8"));
      console.log(`Seeding ${candData.length} candidates...`);

      for (const c of candData) {
        // Create dummy resume upload
        const upload = await ResumeUpload.create({
          job_id: job.id,
          recruiter_id: recruiter.id,
          original_filename: `${c.profile.anonymized_name.replace(/\s+/g, "_")}_resume.pdf`,
          stored_path: `uploads/resumes/${job.id}/dummy.pdf`,
          mimetype: "application/pdf",
          file_size: 102400,
          status: "parsed",
        });

        // Create candidate record
        await Candidate.create({
          resume_id: upload.id,
          job_id: job.id,
          name: c.profile.anonymized_name,
          email: c.profile.email || `${c.profile.anonymized_name.toLowerCase().replace(/\s+/g, "")}@example.com`,
          phone: c.profile.phone || "+91 9876543210",
          skills: c.skills.map(s => s.name),
          experience_years: c.profile.years_of_experience || 0,
          education_level: c.education[0]?.degree || "Bachelor",
          experience_details: c.career_history || [],
          education_details: c.education || [],
          projects: [],
          certifications: c.certifications || [],
          languages: c.languages || [],
          summary: c.profile.summary || "",
          raw_parsed_data: c,
          status: "new",
        });
      }
      console.log("Candidates seeded successfully.");
    } else {
      console.log("sample_candidates.json not found.");
    }

    console.log("Reset & Seeding completed successfully. Default login: recruiter@redrob.com / password123");
    process.exit(0);
  } catch (err) {
    console.error("Database reset & seeding failed:", err);
    process.exit(1);
  }
}

resetAndSeed();
