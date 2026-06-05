const apiKey = process.env.ASSEMBLY_AI_API_KEY || "";

async function run() {
  const res = await fetch("https://api.assemblyai.com/v2/realtime", {
    method: "POST",
    headers: {
      "Authorization": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ expires_in: 3600 })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
