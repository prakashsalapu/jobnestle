const fetch = require('node-fetch');

const BASE = process.env.API_BASE || 'http://localhost:10000';

async function run() {
  try {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: process.env.TEST_USER_EMAIL || 'testuser@example.com',
        password: process.env.TEST_USER_PASSWORD || 'Test1234!a',
      }),
    });
    const login = await res.json();
    if (!res.ok) {
      console.error('Login failed:', login);
      return;
    }
    const token = login.token;

    const jobRes = await fetch(`${BASE}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Scripted Job',
        company: 'ScriptCo',
        location: 'Remote',
        description: 'Created from script',
      }),
    });
    const job = await jobRes.json();
    console.log('created job:', job);

    const listRes = await fetch(`${BASE}/api/jobs`);
    const jobs = await listRes.json();
    console.log('jobs count:', jobs.length);
  } catch (err) {
    console.error(err);
  }
}

run();
