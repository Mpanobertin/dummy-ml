const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// POST endpoint for predictions
app.post('/predict', (req, res) => {
    const guests = req.body;

    // Validate input
    if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of guests' });
    }

    // Process each guest
    const predictions = guests.map(guest => {
        // Example prediction logic (replace with real ML if needed)
        const spaScore = guest.has_spa ? 0.35 : 0.05;
        const dinnerScore = guest.has_dinner ? 0.85 : 0.1;
        const breakfastScore = guest.has_breakfast ? 0.5 : 0.1;
        const bestSendHour = 17; // can be replaced with more logic

        return {
            guest_id: guest.guest_id || guest.row_number || null, // include unique identifier
            spa: spaScore,
            dinner: dinnerScore,
            breakfast: breakfastScore,
            best_send_hour: bestSendHour
        };
    });

    res.json(predictions);
});

// Start server
app.listen(PORT, () => {
    console.log(`Dummy ML service running on port ${PORT}`);
});
