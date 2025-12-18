const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Serve static files (CSS, etc.)
app.use(express.static(__dirname));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "gaz-dev-ops" });
});


app.listen(port, () => {
    console.log(`🚀 Gaz Dev Ops running on port ${port}`);
});
