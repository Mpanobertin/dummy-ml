const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Map room type to weight
const roomTypeWeight = {
    'Suite': 1.2,
    'Deluxe': 1.1,
    'Standard': 1.0,
};

// Map purpose to weight
const purposeWeight = {
    'Vacation': 1.2,
    'Business': 1.0,
};

// Function to calculate probabilities
function getPreferences(guest) {
    let baseSpa = 0.2;
    let baseDinner = 0.3;
    let baseBreakfast = 0.4;

    const pWeight = purposeWeight[guest.purpose_of_visit] || 1.0;
    const rWeight = roomTypeWeight[guest.room_type] || 1.0;

    // Override if guest has explicit has_spa/dinner/breakfast fields
    const spa = guest.has_spa !== undefined ? (guest.has_spa ? 0.35 : 0.05) : Math.min(1, baseSpa * pWeight * rWeight);
    const dinner = guest.has_dinner !== undefined ? (guest.has_dinner ? 0.85 : 0.1) : Math.min(1, baseDinner * pWeight * rWeight);
    const breakfast = guest.has_breakfast !== undefined ? (guest.has_breakfast ? 0.5 : 0.1) : Math.min(1, baseBreakfast * pWeight * rWeight);

    return { spa, dinner, breakfast };
}

// Function to calculate segment
function calculateSegment(preferences, guest) {
    const score = preferences.spa * 0.3 + preferences.dinner * 0.4 + preferences.breakfast * 0.3;
    const pWeight = purposeWeight[guest.purpose_of_visit] || 1.0;
    const rWeight = roomTypeWeight[guest.room_type] || 1.0;
    const weightedScore = score * pWeight * rWeight;

    if (weightedScore > 0.6) return 'High';
    if (weightedScore > 0.35) return 'Medium';
    return 'Low';
}

// POST /predict
app.post('/predict', async (req, res) => {
    const guests = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of guests' });
    }

    const predictions = guests.map(guest => {
        const preferences = getPreferences(guest);
        const segment = calculateSegment(preferences, guest);

        return {
            guest_id: guest.guest_id || `guest_${Math.floor(Math.random() * 10000)}`,
            spa: preferences.spa,
            dinner: preferences.dinner,
            breakfast: preferences.breakfast,
            best_send_hour: 17,
            segment: segment
        };
    });

    res.json(predictions);
});

// Start server
app.listen(PORT, () => {
    console.log(`Dummy ML service running on port ${PORT}`);
});
