const { User, Job } = require("./server/models");

async function check() {
  try {
    const users = await User.findAll({ attributes: ["id", "email", "full_name"] });
    console.log("USERS IN DB:", users.map(u => u.toJSON()));

    const jobs = await Job.findAll({ attributes: ["id", "title", "recruiter_id"] });
    console.log("JOBS IN DB:", jobs.map(j => j.toJSON()));

    process.exit(0);
  } catch (err) {
    console.error("DB Query failed:", err);
    process.exit(1);
  }
}

check();
