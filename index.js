const express = require('express');
const app = express();
app.use(express.json()); // parse incoming JSON

// Predict route
app.post('/predict', (req, res) => {
  try {
    // Ensure body is always an array
    const guests = Array.isArray(req.body) ? req.body : [req.body];

    // Process each guest
    const response = guests.map(guest => {
      // Default segment logic if not provided
      let segment = guest.segment && guest.segment !== "" ? guest.segment : 'unknown';

      // Example smart segment logic
      if (!guest.segment || guest.segment === "") {
        if (guest.country) {
          const nat = guest.country.toLowerCase();
          if (['usa', 'canada'].includes(nat)) segment = 'north_america';
          else if (['uk', 'france', 'germany'].includes(nat)) segment = 'europe';
          else if (['japan', 'china', 'south korea'].includes(nat)) segment = 'asia';
          else if (['rwanda', 'kenya', 'uganda'].includes(nat)) segment = 'africa';
        }

        if (guest.total_spend_usd && guest.total_spend_usd > 1500) segment += '_vip';
        if (guest.points && guest.points >= 5) segment += '_loyal';

        // Additional logic can be added here (spa, game points, etc.)
      }

      // Return updated guest object
      return { ...guest, segment };
    });

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(400).send('Bad Request');
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
