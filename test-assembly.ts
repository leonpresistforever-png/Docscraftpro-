import "fs";
fetch("https://api.assemblyai.com/v2/realtime/token", {
  method: "POST",
  headers: { "Authorization": process.env.ASSEMBLY_AI_API_KEY || "", "Content-Type": "application/json" },
  body: JSON.stringify({ expires_in: 3600 })
}).then((r) => r.text()).then(console.log).catch(console.error);
