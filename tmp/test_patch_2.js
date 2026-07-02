const axios = require('axios');

async function run() {
  try {
    // 1. Log in
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'recruiter@redrob.com',
      password: 'password123'
    });
    const token = loginRes.data.token;
    console.log('Logged in. Token retrieved.');

    // 2. Get candidates
    const getRes = await axios.get('http://localhost:5000/api/candidates', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const candidates = getRes.data.data.candidates;
    console.log('Total candidates found:', candidates.length);
    if (candidates.length === 0) {
      console.log('No candidates in DB.');
      return;
    }

    const testCand = candidates[0];
    console.log(`Testing with candidate details: ID=${testCand.id}, name='${testCand.name}', status='${testCand.status}'`);

    // 3. Update status
    const patchRes = await axios.patch(`http://localhost:5000/api/candidates/${testCand.id}/status`, {
      status: 'shortlisted'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Patch success:', patchRes.data);

  } catch (error) {
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', error.response.data);
    } else {
      console.log('Error Message:', error.message);
    }
  }
}

run();
