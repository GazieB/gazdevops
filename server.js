const express = require("express");
const OpenAI = require("openai");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

/* ---------------- OPENAI SETUP ---------------- */

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

/* ---------------- ROUTES ---------------- */

/**
 * Rewrite informal notes into professional internal notes
 */
app.post("/rewrite", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).send("No text provided.");
        }

        const completion = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "Rewrite the following notes into clear, formal, professional British English suitable for official internal records."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            temperature: 0.2
        });

        res.send(completion.choices[0].message.content);

    } catch (err) {
        console.error("❌ Rewrite error:", err);
        res.status(500).send("Error rewriting notes.");
    }
});

/**
 * Explain a medical condition for non-clinical staff
 */
app.post("/medical-term", async (req, res) => {
    try {
        const { term } = req.body;

        if (!term) {
            return res.status(400).send("No medical term provided.");
        }

        const completion = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "Explain the following medical condition in clear, detailed British English suitable for non-clinical airline staff. Include what it means, common symptoms, and general impact on daily life. Do not provide medical advice or diagnosis."
                },
                {
                    role: "user",
                    content: term
                }
            ],
            temperature: 0.2
        });

        res.send(completion.choices[0].message.content);

    } catch (err) {
        console.error("❌ Medical error:", err);
        res.status(500).send("Error explaining medical condition.");
    }
});

/**
 * Retrieve information about EMD / mobility equipment by make & model
 */
app.post("/emd-info", async (req, res) => {
    try {
        const { model } = req.body;

        if (!model) {
            return res.status(400).send("No EMD model provided.");
        }

        const completion = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "Provide clear, factual information about mobility or medical equipment for airline staff. Given a make and model, explain what the equipment is, how it is used, any typical size, weight, or battery details if commonly known, and general airline travel considerations. Do not confirm acceptance or provide operational approval."
                },
                {
                    role: "user",
                    content: model
                }
            ],
            temperature: 0.2
        });

        res.send(completion.choices[0].message.content);

    } catch (err) {
        console.error("❌ EMD error:", err);
        res.status(500).send("Error retrieving EMD information.");
    }
});

/**
 * Generate adapted transfer costing notes
 * Rule: (Adapted each way × 2) − coach cost
 */
app.post("/adapted-transfer", async (req, res) => {
    try {
        const { adaptedEachWay, coachPerPerson, pax } = req.body;

        const adapted = parseFloat(adaptedEachWay);
        const coach = parseFloat(coachPerPerson);
        const passengers = parseInt(pax, 10);

        if (
            isNaN(adapted) ||
            isNaN(coach) ||
            isNaN(passengers)
        ) {
            return res.status(400).send("Invalid costing data provided.");
        }

        const adaptedTotal = adapted * 2;
        const coachTotal = coach * passengers;
        const totalCost = adaptedTotal - coachTotal;

        const prompt = `
-----Adapted transfer Costing----

Adapted transfer cost each way: £${adapted.toFixed(2)}
Total adapted transfer cost (return): £${adaptedTotal.toFixed(2)}
Coach transfer cost per person: £${coach.toFixed(2)}
Number of passengers: ${passengers}
Total coach transfer cost: £${coachTotal.toFixed(2)}
Total cost to add to GWG log: £${totalCost.toFixed(2)}

Write this clearly and professionally for Jet2 Assisted Travel internal notes.
`;

        const completion = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You write clear, professional British English notes suitable for Jet2 Assisted Travel internal records."
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
        console.error("❌ Adapted transfer error:", err);
        res.status(500).send("Error generating adapted transfer notes.");
    }
});

/* ---------------- SERVER START ---------------- */

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});
