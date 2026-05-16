import fetch from 'node-fetch';
const response = await fetch('https://models.inference.ai.azure.com/chat/completions', { method: 'POST', body: '{"model":"glm-4","messages":[{"role":"user","content":"hi"}]}'});
console.log(response.status, await response.text());
