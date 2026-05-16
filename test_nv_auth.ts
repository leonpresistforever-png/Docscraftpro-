fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
  method: "POST",
  headers: { "Content-Type": "application/json", "Authorization": "Bearer BAD_KEY" },
  body: JSON.stringify({
    model: "meta/llama3-8b-instruct",
    messages: [ {role: "user", content: "test"} ]
  })
}).then(r=>console.log(r.status, r.statusText));
