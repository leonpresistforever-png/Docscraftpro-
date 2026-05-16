fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Authorization": "Bearer nvapi-123" },
  body: JSON.stringify({
    model: "dummy/model",
    messages: [ {role: "user", content: "test"} ]
  })
}).then(r=>r.text()).then(t=>console.log("Invalid model:", t));

fetch("https://integrate.api.nvidia.com/v1/invalid/path", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Authorization": "Bearer nvapi-123" },
  body: JSON.stringify({
    model: "meta/llama3-70b-instruct",
    messages: [ {role: "user", content: "test"} ]
  })
}).then(r=>r.text()).then(t=>console.log("Invalid path:", t));
