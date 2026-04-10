const fetch = require('node-fetch');

async function call(url, opts = {}){
  try{
    const res = await fetch(url, opts);
    const text = await res.text();
    console.log('URL:', url, 'STATUS:', res.status);
    try{ console.log('BODY:', JSON.parse(text)); } catch(e){ console.log('BODY (text):', text); }
  }catch(e){
    console.error('REQUEST ERROR for', url, e);
  }
}

(async ()=>{
  const headers = { 'Origin': 'http://localhost:5174', 'Content-Type': 'application/json' };
  await call('http://localhost:5000/api/jobs', { headers });
  await call('http://localhost:5000/api/auth/login', { method: 'POST', headers, body: JSON.stringify({ email: 'devadmin@example.com', password: 'Test1234' }) });
})();
