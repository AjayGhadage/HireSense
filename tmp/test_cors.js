const axios = require('axios');

async function run() {
  try {
    const res = await axios({
      method: 'OPTIONS',
      url: 'http://localhost:5000/api/candidates/2/status',
      headers: {
        'Origin': 'http://127.0.0.1:5173',
        'Access-Control-Request-Method': 'PATCH',
        'Access-Control-Request-Headers': 'authorization,content-type'
      }
    });
    console.log('OPTIONS Response Headers:', res.headers);
  } catch (error) {
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Headers:', error.response.headers);
    } else {
      console.log('Error Message:', error.message);
    }
  }
}

run();
