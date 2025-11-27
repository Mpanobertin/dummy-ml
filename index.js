const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper function to determine spender segment
function getSpenderSegment(guest) {
    // Room type factor
    let roomScore = 0;
    switch (guest.room_type.toLowerCase()) {
        case 'suite':
            roomScore = 3;
            break;
        case 'deluxe':
            roomScore = 2;
            break;
        case 'standard':
            roomScore = 1;
            break;
        default:
            roomScore = 1;
    }

    // Purpose of visit factor
    let purposeScore = 0;
    switch (guest.purpose_of_visit?.toLowerCase()) {
        case 'vacation':
            purposeScore = 3;
            break;
        case 'business':
            purposeScore = 2;
            break;
        default:
            purposeScore = 1;
    }

    const totalScore = roomScore + purposeScore;

    if (totalScore >= 5) return 'High';
    if (totalScore >= 3) return 'Medium';
    return 'Low';
}

app.post('/predict', (req, res) => {
    const guests = req.body;

    // Validate input
    if (!Array.isArray(guests) || guests.length === 0) {
        return res.status(400).json({ error: 'Request body must be a non-empty array of guests' });
    }

    // Process each guest
    const predictions = guests.map(guest => {
        // Example prediction logic
        const spaScore = guest.has_spa ? 0.35 : 0.05;
        const dinnerScore = guest.has_dinner ? 0.85 : 0.1;
        const breakfastScore = guest.has_breakfast ? 0.5 : 0.1;
        const bestSendHour = 17; // Placeholder

        return {
            guest_id: guest.guest_id || guest.row_number || null,
            spa: spaScore,
            dinner: dinnerScore,
            breakfast: breakfastScore,
            best_send_hour: bestSendHour,
            segment: getSpenderSegment(guest)
        };
    });

    res.json(predictions);
});

// Start server
app.listen(PORT, () => {
    console.log(`Dummy ML service running on port ${PORT}`);
});
