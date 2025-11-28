// index.js - Phase 2 Smart Segmentation (Improved for Rwanda hotels)

// Input: items from Merge node (original guest + dummy predictions)
return items.map(item => {
    const guest = item.json;

    // --- Step 1: Scoring for segment ---
    let score = 0;

    // Room type scoring
    switch (guest.room_type) {
        case "Suite": score += 3; break;
        case "Deluxe": score += 2; break;
        case "Standard": score += 1; break;
        default: score += 1;
    }

    // Purpose of visit scoring
    switch (guest.purpose_of_visit) {
        case "Vacation": score += 3; break;
        case "Business": score += 2; break;
        default: score += 1;
    }

    // Age group scoring
    switch (guest.age_group) {
        case "36-50": score += 3; break;
        case "26-35": score += 2; break;
        case "18-25": score += 1; break;
        default: score += 1;
    }

    // Weighted dummy predictions if available
    score += (guest.spa || 0.4) * 2;
    score += ((guest.dinner + guest.breakfast)/2 || 0.5) * 2;

    // --- Step 2: Assign segment ---
    let segment = "Low";
    if (score >= 10) segment = "High";
    else if (score >= 7) segment = "Medium";

    // --- Step 3: Generate best_send_hour dynamically ---
    // Vacation guests → evening hours, Business → morning or midday
    let best_send_hour = 17; // default evening
    if (guest.purpose_of_visit === "Vacation") {
        best_send_hour = (segment === "High") ? 18 : 17;
    } else if (guest.purpose_of_visit === "Business") {
        best_send_hour = (segment === "High") ? 9 : 11;
    } else {
        best_send_hour = 12; // default for other purposes
    }

    // --- Step 4: Dummy AI predictions (weighted slightly) ---
    const predicted_meal = (segment === "High" && guest.purpose_of_visit === "Vacation") 
                            ? "Dinner" : "Breakfast";
    const menu_options = ["Steak with sides","Roast dinner","International buffet","Croissant & coffee"];
    const menu_recommendation = menu_options[Math.floor(Math.random()*menu_options.length)];
    const predicted_spa = parseFloat((0.3 + Math.random() * 0.5).toFixed(2)); // 0.3–0.8

    // --- Step 5: Build enriched output ---
    return {
        json: {
            guest_id: guest.guest_id,
            country: guest.country,
            age_group: guest.age_group,
            room_type: guest.room_type,
            purpose_of_visit: guest.purpose_of_visit,
            segment: segment,
            spa: guest.spa,
            dinner: guest.dinner,
            breakfast: guest.breakfast,
            best_send_hour: best_send_hour,

            predicted_meal: predicted_meal,
            predicted_spa: predicted_spa,
            menu_recommendation: menu_recommendation
        }
    };
});
