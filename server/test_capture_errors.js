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
  await call('http://localhost:5000/api/jobs');
  await call('http://localhost:5000/api/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email: 'devadmin@example.com', password: 'Test1234' }) });
  await call('http://localhost:5000/api/auth/me', { method: 'GET', headers: { Authorization: 'Bearer invalidtoken' } });
})();
