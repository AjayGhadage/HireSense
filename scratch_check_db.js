require("dotenv").config({ path: "./server/.env" });
const { User, Job, Candidate, Ranking } = require("./server/models");


async function check() {
  try {
    const users = await User.findAll({ raw: true });
    console.log("Users:", users);

    const jobs = await Job.findAll({ raw: true });
    console.log("Jobs:", jobs);

    const candCount = await Candidate.count();
    console.log("Candidate Count:", candCount);

    const rankCount = await Ranking.count();
    console.log("Ranking Count:", rankCount);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

check();
