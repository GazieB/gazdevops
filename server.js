const express = require("express");
const path = require("path");
require("dotenv").config();

const OpenAI = require("openai");
const { poolPromise, sql } = require("./db");

const app = express();
const PORT = process.env.PORT || 10000;

/* =========================
   Middleware
========================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   OpenAI Client
========================= */
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/* =========================
   Routes
========================= */

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Gaz Dev Ops" });
});

// Optional DB test
app.get("/db-test", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT GETDATE() AS now");
    res.json({
      success: true,
      time: result.recordset[0].now
    });
  } catch (err) {
    console.error("DB test failed:", err);
    res.status(500).json({ success: false, error: "DB connection failed" });
  }
});

// AI generate costing notes
app.post("/generate", async (req, res) => {
  try {
    const { adaptedEachWay, coachPerPerson, pax } = req.body;

    if (!adaptedEachWay || !coachPerPerson || !pax) {
      return res.status(400).send("Missing input values");
    }

    const adaptedTotal = adaptedEachWay * 2;
    const coachTotal = coachPerPerson * pax;
    const extraCost = adaptedTotal - coachTotal;

    const prompt = `
-----Adapted transfer Costing----

Adapted transfer cost each way: £${adaptedEachWay}
Total adapted transfer cost (return): £${adaptedTotal}
Coach transfer cost per person: £${coachPerPerson}
Passengers: ${pax}
Total coach cost: £${coachTotal}
Additional cost to log: £${extraCost}

Write this clearly for Jet2 Assisted Travel internal notes.
`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You write clear, professional British English notes for internal airline use."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2
    });

    res.send(completion.choices[0].message.content);
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).send("AI generation failed");
  }
});

// Friendly route to open the costing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* =========================
   Catch-all (LAST)
========================= */
app.get("*", (req, res) => {
  res.status(404).send("Route not found");
});

/* =========================
   Start Server
========================= */
app.listen(PORT, async () => {
  console.log(`🚀 Gaz Dev Ops running on port ${PORT}`);

  try {
    await poolPromise;
    console.log("✅ Connected to AWS RDS (SQL Server)");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
});
