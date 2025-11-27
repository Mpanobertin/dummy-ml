const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Function to calculate dynamic preferences based on purpose and room_type
function getPreferences(guest) {
    const roomMultiplier = guest.room_type === 'Suite' ? 1.0 :
                           guest.room_type === 'Deluxe' ? 0.8 : 0.6;

    let spaScore = 0, dinnerScore = 0, breakfastScore = 0;

    if (guest.purpose_of_visit === "Vacation") {
        spaScore = 0.9 * roomMultiplier;
        dinnerScore = 0.85 * roomMultiplier;
        breakfastScore = 0.8 * roomMultiplier;
    } else { // Business
        spaScore = 0.4 * roomMultiplier;
        dinnerScore = 0.5 * roomMultiplier;
        breakfastScore = 0.6 * roomMultiplier;
    }

    // If has_spa/dinner/breakfast is defined, override with explicit 1/0
    if (guest.has_spa !== undefined) spaScore = guest.has_spa ? 1 : 0;
    if (guest.has_dinner !== undefined) dinnerScore = guest.has_dinner ? 1 : 0;
    if (guest.has_breakfast !== undefined) breakfastScore = guest.has_breakfast ? 1 : 0;

    return {
        spa: Math.min(1, spaScore),
        dinner: Math.min(1, dinnerScore),
        breakfast: Math.min(1, breakfastScore)
    };
}

// Function to calculate High/Medium/Low segment
function calculateSegment(preferences, guest) {
    const score =
        (preferences.spa || 0) * 0.3 +
        (preferences.dinner || 0) * 0.4 +
        (preferences.breakfast || 0) * 0.3;

    if (guest.purpose_of_visit === "Vacation") {
        return score > 0.6 ? "High" : score > 0.4 ? "Medium" : "Low";
    } else { // Business
        return score > 0.5 ? "High" : score > 0.3 ? "Medium" : "Low";
    }
}

// POST /predict endpoint
app.post('/predict', async (req, res) => {
    const guests = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of guests' });
    }

    const predictions = [];

    for (const guest of guests) {
        // Clean guest_id
        const guestId = String(guest.guest_id || guest.row_number || '').replace(/^=/, '');

        // Get dynamic preferences
        const preferences = getPreferences(guest);

        // Get segment
        const segment = calculateSegment(preferences, guest);

        predictions.push({
            guest_id: guestId,
            spa: preferences.spa,
            dinner: preferences.dinner,
            breakfast: preferences.breakfast,
            best_send_hour: 17, // fixed for now
            segment: segment
        });
    }

    res.json(predictions);
});

// Start server
app.listen(PORT, () => {
    console.log(`Dummy ML service running on port ${PORT}`);
});
