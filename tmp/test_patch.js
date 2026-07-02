const axios = require('axios');

async function run() {
  try {
    // 1. Log in
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'recruiter@redrob.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('Login successful. Token acquired:', token ? 'YES' : 'NO');

    // 2. PATCH request with Token
    const res = await axios.patch('http://localhost:5000/api/candidates/2/status', {
      status: 'shortlisted'
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Success:', res.data);
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
