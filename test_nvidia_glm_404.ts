fetch("http://localhost:3000/api/proxy/glm", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    baseUrl: "https://integrate.api.nvidia.com/v1",
    apiKey: "dummy.key",
    modelName: "glm-4",
    finalPrompt: "test",
    compiledContext: "test"
  })
}).then(r=>r.text()).then(t=>console.log("Nvidia glm-4 response:", t));
