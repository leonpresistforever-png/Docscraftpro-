fetch("https://integrate.api.nvidia.com/v1/models", {
  method: "GET",
  headers: { "Authorization": "Bearer nvapi-123" }
}).then(r=>console.log(r.status, r.statusText));
