import https from 'https';
const options = {
  hostname: 'api.assemblyai.com',
  port: 443,
  path: '/v2/realtime/token',
  method: 'POST',
  headers: {
    'Authorization': '4498f001b80e47a483f4f378400a9b06',
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(JSON.stringify({ expires_in: 3600 }));
req.end();
