// ================================
// Gaz Dev Ops - server.js
// ================================

const express = require("express");
const path = require("path");

// Load env vars locally (Render ignores this safely)
require("dotenv").config();

// DB connection
const { poolPromise } = require("./db");

const app = express();

// IMPORTANT: Render provides PORT
const PORT = process.env.PORT || 3000;

// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// --------------------
// Routes
// --------------------

// Home page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Health check (Render / sanity check)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "gaz-dev-ops",
    time: new Date().toISOString()
  });
});

// --------------------
// DATABASE TEST ROUTE
// --------------------
app.get("/db-test", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.query("SELECT GETDATE() AS now");
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ DB test error:", err);
    res.status(500).json({
      error: "Database connection failed",
      details: err.message
    });
  }
});

// --------------------
// Fallback (optional)
// --------------------
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// --------------------
// Start server
// --------------------
app.listen(PORT, () => {
  console.log(`🚀 Gaz Dev Ops running on port ${PORT}`);
});
