const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// --- Weight mappings for segmentation ---
const roomTypeWeight = {
    'Suite': 1.2,
    'Deluxe': 1.1,
    'Standard': 1.0,
};

const purposeWeight = {
    'Vacation': 1.2,
    'Business': 1.0,
};

// --- Base preference calculation ---
function getPreferences(guest) {
    let baseSpa = 0.2;
    let baseDinner = 0.3;
    let baseBreakfast = 0.4;

    const pWeight = purposeWeight[guest.purpose_of_visit] || 1.0;
    const rWeight = roomTypeWeight[guest.room_type] || 1.0;

    // Override if guest has explicit fields
    const spa = guest.has_spa !== undefined ? (guest.has_spa ? 0.35 : 0.05) : Math.min(1, baseSpa * pWeight * rWeight);
    const dinner = guest.has_dinner !== undefined ? (guest.has_dinner ? 0.85 : 0.1) : Math.min(1, baseDinner * pWeight * rWeight);
    const breakfast = guest.has_breakfast !== undefined ? (guest.has_breakfast ? 0.5 : 0.1) : Math.min(1, baseBreakfast * pWeight * rWeight);

    return { spa, dinner, breakfast };
}

// --- AI placeholder for enrichment (future OpenAI integration) ---
async function getAIPreferences(guest) {
    // Future: call OpenAI or ML to predict preferences using country, age_group, purpose, menu
    const prefs = getPreferences(guest);

    // Example: small adjustments based on country (dummy enrichment)
    if (guest.country === 'Italy') prefs.dinner = Math.min(1, prefs.dinner + 0.05);
    if (guest.country === 'France') prefs.breakfast = Math.min(1, prefs.breakfast + 0.05);
    return prefs;
}

// --- Segment calculation ---
function calculateSegment(preferences, guest) {
    const score = preferences.spa * 0.3 + preferences.dinner * 0.4 + preferences.breakfast * 0.3;
    const pWeight = purposeWeight[guest.purpose_of_visit] || 1.0;
    const rWeight = roomTypeWeight[guest.room_type] || 1.0;
    const weightedScore = score * pWeight * rWeight;

    if (weightedScore > 0.6) return 'High';
    if (weightedScore > 0.35) return 'Medium';
    return 'Low';
}

// --- POST /predict ---
app.post('/predict', async (req, res) => {
    const guests = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of guests' });
    }

    const predictions = [];
    for (const guest of guests) {
        // Use AI preferences for new/cold guests, else use existing fields
        let preferences;
        if (!guest.has_spa && !guest.has_dinner && !guest.has_breakfast) {
            preferences = await getAIPreferences(guest);
        } else {
            preferences = getPreferences(guest);
        }

        const segment = calculateSegment(preferences, guest);

        predictions.push({
            guest_id: guest.guest_id || `guest_${Math.floor(Math.random() * 10000)}`,
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
