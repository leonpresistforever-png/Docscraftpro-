fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Authorization": "Bearer nvapi-123" },
  body: JSON.stringify({
    model: "meta/llama-3.1-8b-instruct",
    messages: [ {role: "user", content: "test"} ]
  })
}).then(r=>console.log(r.status, r.statusText));
