const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // For OpenAI API if needed

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Mock function to get preferences for new guests using OpenAI or placeholder logic
async function getPreferencesForNewGuest(guest) {
    // Here you could call OpenAI API to generate personalized scores based on country, age, room_type, purpose
    // For now, return example predictions
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

    return {
        spa: spaScore,
        dinner: dinnerScore,
        breakfast: breakfastScore
    };
}

// Function to calculate segment
function calculateSegment(preferences, guest) {
    const score =
        (preferences.spa || 0) * 0.3 +
        (preferences.dinner || 0) * 0.4 +
        (preferences.breakfast || 0) * 0.3;

    if (guest.purpose_of_visit === "Vacation") return score > 0.5 ? "High" : "Medium";
    if (guest.purpose_of_visit === "Business") return score > 0.6 ? "High" : "Medium";
    return score > 0.4 ? "Medium" : "Low";
}

// POST /predict
app.post('/predict', async (req, res) => {
    const guests = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of guests' });
    }

    const predictions = [];
    for (const guest of guests) {
        let preferences = { spa: 0.2, dinner: 0.3, breakfast: 0.4 };

        // Determine preferences
        if (guest.has_spa === undefined || guest.has_dinner === undefined || guest.has_breakfast === undefined) {
            preferences = await getPreferencesForNewGuest(guest);
        } else {
            preferences.spa = guest.has_spa ? 0.35 : 0.05;
            preferences.dinner = guest.has_dinner ? 0.85 : 0.1;
            preferences.breakfast = guest.has_breakfast ? 0.5 : 0.1;
        }

        const segment = calculateSegment(preferences, guest);

        predictions.push({
            guest_id: guest.guest_id || guest.row_number || null,
            spa: preferences.spa,
            dinner: preferences.dinner,
            breakfast: preferences.breakfast,
            best_send_hour: 17,
            segment: segment
        });
    }

    res.json(predictions);
});

// Start server
app.listen(PORT, () => {
    console.log(`Dummy ML service running on port ${PORT}`);
});
