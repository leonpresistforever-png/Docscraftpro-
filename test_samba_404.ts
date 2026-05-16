import fetch from 'node-fetch';
const response = await fetch('https://api.sambanova.ai/v1/chat/completions', { method: 'POST', body: '{"model":"glm-4","messages":[{"role":"user","content":"hi"}]}'});
console.log(response.status, await response.text());
