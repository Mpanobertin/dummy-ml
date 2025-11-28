// index.js - Phase 2 Smart Segmentation Only (Render-ready)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- POST /predict endpoint ---
app.post('/predict', (req, res) => {
    try {
        const items = req.body; // Expecting array of guest objects
        if (!Array.isArray(items)) {
            return res.status(400).json({ error: "Expected an array of guests" });
        }

        const output = items.map(guest => {
            // --- Step 1: Scoring for segment ---
            let score = 0;

            // Room type scoring
            switch (guest.room_type) {
                case "Suite": score += 3; break;
                case "Deluxe": score += 2; break;
                case "Standard": score += 1; break;
                default: score += 1;
            }

            // Purpose of visit scoring
            switch (guest.purpose_of_visit) {
                case "Vacation": score += 3; break;
                case "Business": score += 2; break;
                default: score += 1;
            }

            // Age group scoring
            switch (guest.age_group) {
                case "36-50": score += 3; break;
                case "26-35": score += 2; break;
                case "18-25": score += 1; break;
                default: score += 1;
            }

            // --- Step 2: Assign segment ---
            let segment = "Low";
            if (score >= 10) segment = "High";
            else if (score >= 7) segment = "Medium";

            // --- Step 3: Generate best_send_hour dynamically ---
            let best_send_hour = 17; // default
            if (guest.purpose_of_visit === "Vacation") {
                best_send_hour = (segment === "High") ? 18 : 17;
            } else if (guest.purpose_of_visit === "Business") {
                best_send_hour = (segment === "High") ? 9 : 11;
            } else {
                best_send_hour = 12; // default for other purposes
            }

            // --- Step 4: Build enriched output ---
            return {
                json: {
                    guest_id: guest.guest_id,
                    country: guest.country,
                    age_group: guest.age_group,
                    room_type: guest.room_type,
                    purpose_of_visit: guest.purpose_of_visit,
                    segment: segment,
                    best_send_hour: best_send_hour
                }
            };
        });

        res.json(output);

    } catch (error) {
        console.error("Error processing /predict:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Smart Segmentation running on port ${PORT}`));
