const apiKey = "4498f001b80e47a483f4f378400a9b06";

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
