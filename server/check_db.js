const { Candidate } = require('./models');

async function run() {
  try {
    const candidates = await Candidate.findAll({
      attributes: ['id', 'name', 'status']
    });
    console.log('Candidates in DB:');
    candidates.forEach(c => {
      console.log(`- ID: ${c.id}, Name: ${c.name}, Status: ${c.status}`);
    });
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
