const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.get("/ready", (_request, response) => {
  response.send("READY");
});

app.get("/api/message", (_request, response) => {
  response.json({
    project: "__PROJECT_TITLE__",
    status: "ok"
  });
});

app.listen(port, () => {
  console.log(`__PROJECT_TITLE__ running on port ${port}`);
});
