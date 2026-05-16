fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Authorization": "Bearer nvapi-123" },
  body: JSON.stringify({
    model: "zhipu/glm-4-9b-chat",
    messages: [ {role: "user", content: "test"} ]
  })
}).then(r=>console.log(r.status, r.statusText));
