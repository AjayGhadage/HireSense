require("dotenv").config();
const { User, Job, Candidate, Ranking } = require("./models");
const { triggerRanking } = require("./services/ranking.service");

async function check() {
  try {
    const users = await User.findAll({ raw: true });
    console.log("Users:", users.map(u => ({ id: u.id, name: u.full_name || u.name, email: u.email })));

    const jobs = await Job.findAll({ raw: true });
    console.log("Jobs:", jobs.map(j => ({ id: j.id, title: j.title })));

    if (jobs.length === 0) {
      console.log("❌ No jobs found in database, please seed first.");
      process.exit(1);
    }

    const firstJob = jobs[0];
    const firstRecruiter = users[0];
    
    if (!firstRecruiter) {
      console.log("❌ No users found in database. Please register an account first.");
      process.exit(1);
    }

    console.log(`\n--- Verification: Running AI rankings for Job "${firstJob.title}" (ID: ${firstJob.id}) ---`);
    console.log("Active Candidate count before ranking:", await Candidate.count({ where: { job_id: firstJob.id } }));
    console.log("Existing Rankings count before:", await Ranking.count({ where: { job_id: firstJob.id } }));

    // Trigger ranking (this executes the sequelize lookup + fallback model)
    const result = await triggerRanking(firstJob.id, firstRecruiter.id);
    console.log("Rankings run results summary:", result);

    const activeRankings = await Ranking.findAll({
      where: { job_id: firstJob.id },
      include: [{ model: Candidate, as: "candidate" }],
      order: [["rank_position", "ASC"]],
    });

    console.log(`\nNew rankings generated: ${activeRankings.length}`);
    activeRankings.slice(0, 3).forEach((r) => {
      console.log(`Rank #${r.rank_position}: ${r.candidate?.name || 'Unknown'} - Score: ${r.match_score}%`);
      console.log(`   AI Bio: ${r.ai_explanation.substring(0, 100)}...`);
    });

    process.exit(0);
  } catch (err) {
    console.error("❌ End-To-End API Test Failed:", err);
    process.exit(1);
  }
}

check();
