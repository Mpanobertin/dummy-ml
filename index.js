const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Helper functions for predictions
function calculateSpa(guest) {
  return guest.has_spa ? 0.8 : 0.2;
}

function calculateDinner(guest) {
  return guest.has_dinner ? 0.85 : 0.3;
}

function calculateBreakfast(guest) {
  return guest.has_breakfast ? 0.5 : 0.1;
}

function calculateBestHour(guest) {
  // Simple example: preferred_time if exists, else 17
  return guest.preferred_time || 17;
}

// Smart segmentation
function smartSegment(guest) {
  let segment = 'other';
  const nat = guest.country ? guest.country.toLowerCase() : '';

  if (['usa', 'canada'].includes(nat)) segment = 'north_america';
  else if (['uk', 'france', 'germany'].includes(nat)) segment = 'europe';
  else if (['japan', 'china', 'south korea'].includes(nat)) segment = 'asia';
  else if (['rwanda', 'kenya', 'uganda'].includes(nat)) segment = 'africa';

  if (guest.total_spend_usd && guest.total_spend_usd > 1500) segment += '_vip';
  if (guest.points && guest.points >= 5) segment += '_loyal';
  if (guest.age_group) segment += `_${guest.age_group}`;

  return segment;
}

// Main prediction route
app.post('/predict', (req, res) => {
  const guests = Array.isArray(req.body) ? req.body : [req.body]; // ensure array
  const results = guests.map(guest => {
    guest.segment = smartSegment(guest); // add segment
    return {
      guest_id: guest.guest_id,
      spa: calculateSpa(guest),
      dinner: calculateDinner(guest),
      breakfast: calculateBreakfast(guest),
      best_send_hour: calculateBestHour(guest),
      segment: guest.segment
    };
  });
  res.json(results);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Dummy ML server running on port ${PORT}`);
});
