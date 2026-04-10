const http = require('http');

function get(host, path, port = 5000, headers = {}) {
  return new Promise((resolve) => {
    const opts = { hostname: host, port, path, headers };
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.end();
  });
}

function post(host, path, body, port = 5000) {
  return new Promise((resolve) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: host,
      port,
      path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    };
    const req = http.request(opts, (res) => {
      let d = '';
      res.on('data', (c) => (d += c));
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(data);
    req.end();
  });
}

(async () => {
  console.log('Running smoke checks...');

  const health = await get('localhost', '/health', 5000);
  console.log('health:', health.error || health.status);

  const jobs = await get('localhost', '/api/jobs', 5000);
  console.log('jobs:', jobs.error || `status ${jobs.status} bodyLen ${jobs.body ? jobs.body.length : 0}`);

  const login = await post('localhost', '/api/auth/login', { email: 'tester@example.com', password: 'password123' }, 5000);
  if (login.error) {
    console.log('login error:', login.error);
  } else {
    try {
      const j = JSON.parse(login.body);
      console.log('login status', login.status, 'hasToken', !!j.token);
      if (j.token) {
        const me = await get('localhost', '/api/auth/me', 5000, { Authorization: 'Bearer ' + j.token });
        console.log('me:', me.error || me.status);
      }
    } catch (e) {
      console.log('login parse error', e.message);
    }
  }

  const vite = await get('localhost', '/', 5174);
  console.log('vite root:', vite.error || `status ${vite.status}`);

  console.log('done');
})();
