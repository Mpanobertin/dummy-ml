const express = require('express');
const app = express();

app.use(express.json());

app.post('/predict', (req, res) => {
    const guest = req.body;

    // Return dummy probabilities
    const response = {
        spa: parseFloat((Math.random()).toFixed(2)),
        dinner: parseFloat((Math.random()).toFixed(2)),
        breakfast: parseFloat((Math.random()).toFixed(2)),
        best_send_hour: Math.floor(Math.random() * 6) + 17 // 17-22
    };

    res.json(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Dummy ML server running on port ${PORT}`));
