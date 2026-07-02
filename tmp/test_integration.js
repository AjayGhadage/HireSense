const axios = require('axios');

async function testIntegration() {
  console.log("=== Testing backend candidates endpoint ===");
  try {
    const candidatesRes = await axios.get('http://localhost:5000/api/candidates');
    const candidates = candidatesRes.data.candidates || [];
    console.log(`Fetched ${candidates.length} candidates.`);
    if (candidates.length > 0) {
      const sampleCand = candidates[0];
      console.log('Sample Candidate Keys:', Object.keys(sampleCand));
      console.log('Raw Parsed Data present:', !!sampleCand.raw_parsed_data);
      if (sampleCand.raw_parsed_data) {
        console.log('Redrob Signals present:', !!sampleCand.raw_parsed_data.redrob_signals);
        if (sampleCand.raw_parsed_data.redrob_signals) {
          console.log('Signals keys:', Object.keys(sampleCand.raw_parsed_data.redrob_signals));
        }
      }
    }
  } catch (err) {
    console.error('Error fetching candidates:', err.message);
  }

  console.log("\n=== Testing AI Ranking Endpoint ===");
  try {
    const jobsRes = await axios.get('http://localhost:5000/api/jobs');
    const jobs = jobsRes.data.jobs || jobsRes.data || [];
    if (jobs.length > 0) {
      const targetJob = jobs[0];
      console.log(`Triggering AI ranking for Job: "${targetJob.title}" (ID: ${targetJob.id})`);
      const rankRes = await axios.post(`http://localhost:5000/api/rankings/trigger/${targetJob.id}`);
      console.log('Ranking Trigger Response:', rankRes.data);

      const leaderboardRes = await axios.get(`http://localhost:5000/api/rankings/${targetJob.id}`);
      const leaderboard = leaderboardRes.data || [];
      console.log(`Leaderboard contains ${leaderboard.length} ranked entries.`);
      if (leaderboard.length > 0) {
        const topRow = leaderboard[0];
        console.log('Top Ranked Entry Candidate Name:', topRow.candidate?.name);
        console.log('Top Ranked Entry Score:', topRow.match_score);
        console.log('Top Ranked Entry Explanation:', topRow.ai_explanation);
        console.log('Top Ranked Entry raw_parsed_data present:', !!topRow.candidate?.raw_parsed_data);
        if (topRow.candidate?.raw_parsed_data?.redrob_signals) {
          console.log('Top Ranked Entry Behavioral Signals:', topRow.candidate.raw_parsed_data.redrob_signals);
        }
      }
    } else {
      console.log('No jobs found to run ranking testing.');
    }
  } catch (err) {
    console.error('Error running ranking test:', err.response?.data || err.message);
  }
}

testIntegration();
