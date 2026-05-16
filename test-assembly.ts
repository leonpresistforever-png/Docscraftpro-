import "fs";
fetch("https://api.assemblyai.com/v2/realtime/token", {
  method: "POST",
  headers: { "Authorization": "4498f001b80e47a483f4f378400a9b06", "Content-Type": "application/json" },
  body: JSON.stringify({ expires_in: 3600 })
}).then((r) => r.text()).then(console.log).catch(console.error);
