fetch("http://localhost:3000/api/proxy/glm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    baseUrl: "https://integrate.api.nvidia.com/v1/chat/completions",
    apiKey: "dummy",
    modelName: "meta/llama3-70b-instruct",
    finalPrompt: "test",
    compiledContext: "test"
  })
}).then(r=>r.text()).then(t=>console.log("Without trailing slash:", t));

fetch("http://localhost:3000/api/proxy/glm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    baseUrl: "https://integrate.api.nvidia.com/v1/chat/completions/",
    apiKey: "dummy",
    modelName: "meta/llama3-70b-instruct",
    finalPrompt: "test",
    compiledContext: "test"
  })
}).then(r=>r.text()).then(t=>console.log("With trailing slash:", t));

fetch("http://localhost:3000/api/proxy/glm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    baseUrl: "https://integrate.api.nvidia.com/v1",
    apiKey: "dummy",
    modelName: "meta/llama3-70b-instruct",
    finalPrompt: "test",
    compiledContext: "test"
  })
}).then(r=>r.text()).then(t=>console.log("With v1 only:", t));
