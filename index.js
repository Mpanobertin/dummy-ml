const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// --- Utility functions ---

// Mock AI enrichment placeholder (future integration)
async function getPreferencesForNewGuest(guest) {
    // Example logic based on purpose_of_visit and room_type
    let spaScore = 0.2;
    let dinnerScore = 0.3;
    let breakfastScore = 0.4;

    if (guest.purpose_of_visit === "Vacation") {
        spaScore = 0.7;
        dinnerScore = 0.8;
        breakfastScore = 0.6;
    } else if (guest.purpose_of_visit === "Business") {
        spaScore = 0.3;
        dinnerScore = 0.5;
        breakfastScore = 0.4;
    }

    // Optional: adjust based on room_type
    if (guest.room_type === "Suite") {
        spaScore = Math.min(spaScore + 0.1, 1);
        dinnerScore = Math.min(dinnerScore + 0.1, 1);
    }

    return { spa: spaScore, dinner: dinnerScore, breakfast: breakfastScore };
}

// Calculate segment High / Medium / Low
function calculateSegment(preferences, guest) {
    const score = (preferences.spa * 0.3) + (preferences.dinner * 0.4) + (preferences.breakfast * 0.3);

    if (guest.purpose_of_visit === "Vacation") {
        if (guest.room_type === "Suite") return score > 0.5 ? "High" : "Medium";
        return score > 0.6 ? "High" : "Medium";
    }

    if (guest.purpose_of_visit === "Business") {
        if (guest.room_type === "Suite") return score > 0.6 ? "High" : "Medium";
        return score > 0.4 ? "Medium" : "Low";
    }

    return score > 0.5 ? "Medium" : "Low";
}

// --- POST /predict ---
app.post('/predict', async (req, res) => {
    const guests = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of guests' });
    }

    const predictions = [];

    for (const guest of guests) {
        // Ensure guest_id is unique, trimmed, and remove leading '=' if from Excel
        const guestId = String(guest.guest_id || guest.row_number || '').replace(/^=/, '').trim();

        let preferences = { spa: 0.2, dinner: 0.3, breakfast: 0.4 };

        // Determine preferences: if missing or undefined → get via placeholder logic (future AI enrichment)
        if (guest.has_spa === undefined && guest.has_dinner === undefined && guest.has_breakfast === undefined) {
            preferences = await getPreferencesForNewGuest(guest);
        } else {
            preferences.spa = guest.has_spa ? 1 : 0;
            preferences.dinner = guest.has_dinner ? 1 : 0;
            preferences.breakfast = guest.has_breakfast ? 1 : 0;
        }

        const segment = calculateSegment(preferences, guest);

        predictions.push({
            guest_id: guestId,
            spa: preferences.spa,
            dinner: preferences.dinner,
            breakfast: preferences.breakfast,
            best_send_hour: 17,
            segment: segment
        });
    }

    res.json(predictions);
});

// --- Start server ---
app.listen(PORT, () => {
    console.log(`Dummy ML service running on port ${PORT}`);
});
