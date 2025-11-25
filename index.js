const express = require('express');
const app = express();

// Parse incoming JSON
app.use(express.json());

app.post('/predict', (req, res) => {
    const guest = req.body; // preserves all fields sent from n8n

    // Generate dummy predictions
    const predictions = {
        spa: parseFloat((Math.random()).toFixed(2)),
        dinner: parseFloat((Math.random()).toFixed(2)),
        breakfast: parseFloat((Math.random()).toFixed(2)),
        best_send_hour: Math.floor(Math.random() * 6) + 17 // 17-22
    };

    // Combine guest info and predictions
    const response = {
        ...guest,      // preserves all original columns
        ...predictions  // add predictions
    };

    res.json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Dummy ML server running on port ${PORT}`));
