import fetch from "node-fetch";

async function run() {
  const envData = {
    modelConfig: { name: "reasoning", weight: 2 },
    instructions: "test",
    tools: [
       { name: "MyTool", description: "Useful", schema: "{}" }
    ]
  };

  try {
    const res = await fetch("http://localhost:3000/api/nexus/task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Call MyTool please.", envData })
    });
    const result = await res.json();
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
run();
