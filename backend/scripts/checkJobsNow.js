const http = require('http');

http.get('http://localhost:5000/api/jobs', (res) => {
  let d = '';
  res.on('data', (c) => (d += c));
  res.on('end', () => {
    try {
      const arr = JSON.parse(d);
      console.log('jobs count', Array.isArray(arr) ? arr.length : 'unexpected');
    } catch (e) {
      console.error('parse error', e.message);
      console.log(d.slice(0, 1000));
    }
  });
}).on('error', (e) => console.error('err', e.message));
