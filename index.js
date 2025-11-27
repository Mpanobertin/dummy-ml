const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // for unique guest IDs if missing

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Baseline preferences for each purpose of visit
const baseScores = {
    Vacation: { spa: 0.7, dinner: 0.8, breakfast: 0.6 },
    Business: { spa: 0.3, dinner: 0.5, breakfast: 0.4 },
    Other: { spa: 0.2, dinner: 0.3, breakfast: 0.4 }
};

// Room type multiplier for higher-end rooms
const roomMultiplier = {
    Suite: 1.2,
    Deluxe: 1.1,
    Standard: 1.0,
    Economy: 0.9
};

// Function to calculate spend segment
function calculateSegment(preferences, guest) {
    let score = preferences.spa * 0.3 + preferences.dinner * 0.4 + preferences.breakfast * 0.3;

    // Purpose-based adjustment
    if (guest.purpose_of_visit === "Vacation") score += 0.1;
    if (guest.purpose_of_visit === "Business") score += 0;

    // Room type multiplier
    const multiplier = roomMultiplier[guest.room_type] || 1.0;
    score *= multiplier;

    if (score >= 0.7) return "High";
    if (score >= 0.45) return "Medium";
    return "Low";
}

// Function to calculate best send hour dynamically
function calculateBestSendHour(segment) {
    // High spenders: evening offers (17-19)
    // Medium spenders: late afternoon (15-17)
    // Low spenders: morning (9-11)
    if (segment === "High") return 18;
    if (segment === "Medium") return 16;
    return 10;
}

// POST /predict
app.post('/predict', async (req, res) => {
    const guests = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of guests' });
    }

    const predictions = [];

    for (const guest of guests) {
        // Ensure numeric boolean values
        const has_spa = Number(guest.has_spa) === 1;
        const has_dinner = Number(guest.has_dinner) === 1;
        const has_breakfast = Number(guest.has_breakfast) === 1;

        // Get baseline preferences for purpose
        let preferences = baseScores[guest.purpose_of_visit] || baseScores["Other"];

        // Override with guest flags if provided
        preferences = {
            spa: has_spa ? preferences.spa : 0.05,
            dinner: has_dinner ? preferences.dinner : 0.1,
            breakfast: has_breakfast ? preferences.breakfast : 0.1
        };

        // Calculate segment
        const segment = calculateSegment(preferences, guest);

        // Calculate best send hour dynamically
        const best_send_hour = calculateBestSendHour(segment);

        // Ensure unique guest_id
        const guest_id = guest.guest_id || `guest-${uuidv4()}`;

        predictions.push({
            guest_id: guest_id,
            spa: preferences.spa,
            dinner: preferences.dinner,
            breakfast: preferences.breakfast,
            best_send_hour: best_send_hour,
            segment: segment
        });
    }

    res.json(predictions);
});

// Start server
app.listen(PORT, () => {
    console.log(`Dummy ML service running on port ${PORT}`);
});
