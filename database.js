// ============================================================
//  AyurDash — Static Mock Database
// ============================================================

const AyurDB = {

  // ----------------------------------------------------------
  //  PATIENTS
  // ----------------------------------------------------------
  patients: [
    {
      id: "P001",
      name: "Arjun Sharma",
      age: 34,
      gender: "Male",
      dob: "1990-03-15",
      prakriti: "Vata-Pitta",
      photo: null,
      phone: "+91-9876543210",
      email: "arjun.sharma@email.com",
      address: "12, MG Road, Bengaluru",
      bloodGroup: "B+",
      allergies: ["Milk at night", "Heavy oils post-sunset"],
      currentMedications: ["Ashwagandha Churna 5g", "Triphala Churna 3g", "Brahmi Taila (external)"],
      treatmentHistory: [
        { date: "2024-01-10", treatment: "Abhyanga Therapy", doctor: "Dr. Meera Nair", notes: "7-day course completed" },
        { date: "2024-03-05", treatment: "Virechana", doctor: "Dr. Meera Nair", notes: "Mild Pitta imbalance corrected" }
      ],
      labReports: [
        { date: "2024-05-01", test: "Lipid Profile", result: "Normal", file: null },
        { date: "2024-06-15", test: "Blood Sugar (Fasting)", result: "94 mg/dL", file: null }
      ],
      mentalHealthNotes: "Mild anxiety reported during exam seasons. Recommended Shankhapushpi.",
      currentDosha: { vata: 42, pitta: 35, kapha: 23 },
      privacy: { shareAllergies: true, shareTreatments: true, shareMentalHealth: false, shareLabReports: true },
      dinacharya: [
        { time: "06:00", task: "Wake up & Nasya (nasal drops)", done: false },
        { time: "06:30", task: "Yoga & Pranayama (15 min)", done: false },
        { time: "07:00", task: "Warm sesame oil Abhyanga", done: false },
        { time: "08:00", task: "Ashwagandha Churna with warm milk", done: true },
        { time: "12:30", task: "Lunch — light Pitta-pacifying meal", done: true },
        { time: "18:00", task: "Triphala Churna with warm water", done: false },
        { time: "21:00", task: "Brahmi Taila scalp massage", done: false }
      ]
    },
    {
      id: "P002",
      name: "Priya Venkatesh",
      age: 28,
      gender: "Female",
      dob: "1996-07-22",
      prakriti: "Kapha-Vata",
      photo: null,
      phone: "+91-9123456789",
      email: "priya.v@email.com",
      address: "45, Anna Nagar, Chennai",
      bloodGroup: "O+",
      allergies: ["Sesame (external heat rash)"],
      currentMedications: ["Trikatu Churna 2g", "Dashamoola Kashaya 30ml"],
      treatmentHistory: [
        { date: "2024-02-20", treatment: "Nasya Therapy", doctor: "Dr. Ramesh Iyer", notes: "Chronic sinusitis treatment" }
      ],
      labReports: [],
      mentalHealthNotes: "No concerns noted.",
      currentDosha: { vata: 30, pitta: 25, kapha: 45 },
      privacy: { shareAllergies: true, shareTreatments: true, shareMentalHealth: true, shareLabReports: false },
      dinacharya: [
        { time: "05:30", task: "Early rise & dry brushing (Udvartana)", done: false },
        { time: "06:00", task: "Brisk walk 30 minutes", done: false },
        { time: "07:30", task: "Trikatu Churna with honey", done: true },
        { time: "12:00", task: "Light Kapha-pacifying lunch", done: false },
        { time: "17:00", task: "Dashamoola Kashaya", done: false }
      ]
    }
  ],

  // ----------------------------------------------------------
  //  DOCTORS
  // ----------------------------------------------------------
  doctors: [
    {
      id: "D001",
      name: "Dr. Meera Nair",
      specialization: "Panchakarma & Rasayana",
      experience: "14 years",
      patients: ["P001"],
      schedule: [
        { date: "2024-07-20", time: "10:00", patient: "P001", type: "Follow-up" },
        { date: "2024-07-22", time: "11:30", patient: "P001", type: "Virechana Assessment" }
      ]
    },
    {
      id: "D002",
      name: "Dr. Ramesh Iyer",
      specialization: "Shalakya Tantra (ENT & Eye)",
      experience: "9 years",
      patients: ["P002"],
      schedule: []
    }
  ],

  // ----------------------------------------------------------
  //  MEDICINES DIRECTORY
  // ----------------------------------------------------------
  medicines: [
    {
      id: "M001",
      name: "Ashwagandha Churna",
      type: "Churna",
      sanskrit: "Withania somnifera",
      benefits: ["Reduces stress & anxiety", "Boosts immunity", "Improves sleep quality", "Enhances strength"],
      dosage: "3–5g with warm milk at bedtime",
      contraindications: ["Pregnancy", "Hyperthyroidism"],
      dosha: "Vata-pacifying, Kapha-increasing",
      reviews: [
        { user: "Arjun S.", rating: 5, text: "Remarkable improvement in sleep quality within 2 weeks." },
        { user: "Kiran M.", rating: 4, text: "Works well for stress. Taste takes getting used to." }
      ]
    },
    {
      id: "M002",
      name: "Triphala Churna",
      type: "Churna",
      sanskrit: "Terminalia chebula + Terminalia bellirica + Phyllanthus emblica",
      benefits: ["Digestive tonic", "Gentle laxative", "Antioxidant", "Eye health"],
      dosage: "3–6g with warm water before bed",
      contraindications: ["Diarrhea", "Dehydration"],
      dosha: "Tridosha-balancing",
      reviews: [
        { user: "Priya V.", rating: 5, text: "Best for gut health. Use it daily." },
        { user: "Suresh K.", rating: 5, text: "Cleared chronic constipation in 10 days." }
      ]
    },
    {
      id: "M003",
      name: "Brahmi Taila",
      type: "Taila (Oil)",
      sanskrit: "Bacopa monnieri",
      benefits: ["Memory enhancement", "Scalp nourishment", "Reduces mental fatigue", "Promotes hair growth"],
      dosage: "Apply 5–10ml warm oil to scalp, leave 30 min before bath",
      contraindications: ["Open wounds on scalp"],
      dosha: "Vata-pacifying, Pitta-pacifying",
      reviews: [
        { user: "Arjun S.", rating: 5, text: "Hair fall reduced significantly." }
      ]
    },
    {
      id: "M004",
      name: "Trikatu Churna",
      type: "Churna",
      sanskrit: "Zingiber officinale + Piper nigrum + Piper longum",
      benefits: ["Ignites Agni (digestive fire)", "Clears Kapha", "Reduces obesity", "Clears sinuses"],
      dosage: "1–3g with honey before meals",
      contraindications: ["Pitta disorders", "Peptic ulcer", "Pregnancy"],
      dosha: "Kapha-reducing, Vata-reducing",
      reviews: [
        { user: "Priya V.", rating: 4, text: "Cleared my sinus issues in a week. Very spicy!" }
      ]
    },
    {
      id: "M005",
      name: "Dashamoola Kashaya",
      type: "Kashaya (Decoction)",
      sanskrit: "Ten roots formulation",
      benefits: ["Anti-inflammatory", "Relieves Vata disorders", "Post-natal care", "Fever management"],
      dosage: "30–60ml twice daily before food",
      contraindications: ["Constipation without Vata imbalance"],
      dosha: "Vata-pacifying",
      reviews: [
        { user: "Anita R.", rating: 5, text: "Excellent for joint pain relief." }
      ]
    },
    {
      id: "M006",
      name: "Mahanarayan Taila",
      type: "Taila (Oil)",
      sanskrit: "Classical poly-herbal oil",
      benefits: ["Joint pain relief", "Muscle stiffness", "Paralysis recovery", "Arthritis management"],
      dosage: "Warm application over joints, followed by steam therapy",
      contraindications: ["Fresh injuries", "Open wounds"],
      dosha: "Vata-pacifying",
      reviews: [
        { user: "Mohan D.", rating: 5, text: "Knee pain gone after 2-week application." }
      ]
    },
    {
      id: "M007",
      name: "Shankhapushpi Syrup",
      type: "Syrup",
      sanskrit: "Convolvulus pluricaulis",
      benefits: ["Memory booster", "Reduces anxiety", "Improves concentration", "Mild sedative"],
      dosage: "10–15ml with equal water twice daily",
      contraindications: ["Excessive Kapha"],
      dosha: "Vata-pacifying, Pitta-pacifying",
      reviews: [
        { user: "Ravi S.", rating: 4, text: "Excellent for exam stress. Kids love the taste." }
      ]
    }
  ],

  // ----------------------------------------------------------
  //  VIRUDDHA (INCOMPATIBLE FOOD COMBINATIONS)
  // ----------------------------------------------------------
  viruddha: [
    {
      id: "V001",
      combination: "Milk + Fish",
      items: ["Milk", "Fish"],
      category: "Desya Viruddha (Regional incompatibility)",
      mechanism: "Both are heavy to digest; together they produce Ama (toxins) and can cause skin disorders (Vitiligo, Psoriasis), blockage of channels (Srotas), and digestive disorders.",
      severity: "High",
      symptoms: ["Skin disorders", "Digestive distress", "Nausea", "Bloating"],
      remedy: "If consumed accidentally: Trikatu powder with honey; follow with warm water. Long-term: Panchakarma detox.",
      ancient_ref: "Charaka Samhita, Sutrasthana 26/84"
    },
    {
      id: "V002",
      combination: "Honey + Ghee (equal quantities)",
      items: ["Honey", "Ghee"],
      category: "Matra Viruddha (Quantity incompatibility)",
      mechanism: "Equal quantities create a toxic compound (Ama). The heating property of ghee combined with honey's complex sugars creates indigestible metabolites that clog micro-channels.",
      severity: "High",
      symptoms: ["Chronic toxin accumulation", "Respiratory issues", "Digestive sluggishness"],
      remedy: "Use different proportions (1:2 ratio is safe). Detox with Triphala.",
      ancient_ref: "Ashtanga Hridayam, Sutrasthana 7/48"
    },
    {
      id: "V003",
      combination: "Milk + Fruits (Sour)",
      items: ["Milk", "Sour fruits"],
      category: "Guna Viruddha (Property incompatibility)",
      mechanism: "Sour fruits curdle milk in the stomach, creating indigestible proteins. Disrupts digestive enzymes and causes fermentation in the gut.",
      severity: "Medium",
      symptoms: ["Bloating", "Gas", "Skin breakouts", "Diarrhea"],
      remedy: "Separate consumption by at least 2 hours. Ginger tea helps neutralize.",
      ancient_ref: "Charaka Samhita, Sutrasthana 26/83"
    },
    {
      id: "V004",
      combination: "Milk + Salt",
      items: ["Milk", "Salt"],
      category: "Guna Viruddha (Property incompatibility)",
      mechanism: "Salt triggers milk to form heavy, curd-like mass in the stomach. Creates Pitta aggravation and skin disorders over long-term use.",
      severity: "Medium",
      symptoms: ["Skin issues", "Pitta aggravation", "Poor digestion"],
      remedy: "Avoid salted foods with milk. Cardamom milk is a good alternative.",
      ancient_ref: "Ashtanga Hridayam"
    },
    {
      id: "V005",
      combination: "Honey + Hot Water/Food",
      items: ["Honey", "Hot water"],
      category: "Krama Viruddha (Processing incompatibility)",
      mechanism: "Heating honey above 40°C converts it into a sticky, toxic compound. The Hydroxymethylfurfural (HMF) formed is carcinogenic and creates Ama that is difficult to eliminate.",
      severity: "High",
      symptoms: ["Toxin accumulation", "Inflammatory conditions", "Long-term: organ stress"],
      remedy: "Always use honey at room temperature. If consumed: increase water intake and try mild Panchakarma.",
      ancient_ref: "Charaka Samhita, Sutrasthana 27/249"
    },
    {
      id: "V006",
      combination: "Ghee + Cold Water",
      items: ["Ghee", "Cold water"],
      category: "Krama Viruddha (Processing incompatibility)",
      mechanism: "Cold water solidifies ghee in the digestive tract, preventing proper digestion and creating a coating on the gut lining that blocks nutrient absorption.",
      severity: "Medium",
      symptoms: ["Digestive sluggishness", "Nausea", "Kapha aggravation"],
      remedy: "Always drink warm water after meals with ghee. Trikatu churna helps dissolve.",
      ancient_ref: "Ashtanga Hridayam, Sutrasthana 7"
    },
    {
      id: "V007",
      combination: "Radish + Milk",
      items: ["Radish", "Milk"],
      category: "Guna Viruddha",
      mechanism: "Radish is pungent and heating; milk is sweet and cooling. Together they create contradictory digestive signals causing fermentation and gas formation.",
      severity: "Low",
      symptoms: ["Bloating", "Gas", "Abdominal discomfort"],
      remedy: "Separate by 2 hours. Jeera (cumin) water helps with gas.",
      ancient_ref: "Charaka Samhita"
    },
    {
      id: "V008",
      combination: "Banana + Milk",
      items: ["Banana", "Milk"],
      category: "Guna Viruddha",
      mechanism: "Both are heavy and sweet; together they slow Agni (digestive fire), produce Kapha, and may cause congestion and sluggishness — especially problematic for Kapha prakriti.",
      severity: "Low",
      symptoms: ["Heaviness", "Congestion", "Lethargy", "Sinus issues"],
      remedy: "If consumed (e.g., milkshakes): add a pinch of cardamom and cinnamon to aid digestion.",
      ancient_ref: "Ashtanga Hridayam"
    }
  ],

  // ----------------------------------------------------------
  //  RITUCHARYA — SEASONAL GUIDELINES
  // ----------------------------------------------------------
  ritucharya: {
    Shishira: {
      name: "Shishira (Late Winter)",
      months: "January – February",
      dominant_dosha: "Vata & Kapha",
      season_icon: "❄️",
      diet: {
        recommended: ["Warm soups", "Sesame seeds", "Jaggery", "Urad Dal", "Ghee", "Root vegetables", "Warm spiced milk"],
        avoid: ["Cold foods", "Raw salads", "Refrigerated items", "Light grains like barley"]
      },
      lifestyle: {
        recommended: ["Oil massage (Abhyanga) daily", "Warm baths", "Moderate exercise", "Warm clothing", "Garlic & ginger use"],
        avoid: ["Cold water baths", "Day sleeping", "Exposure to cold wind", "Fasting"]
      },
      herbs: ["Ashwagandha", "Shatavari", "Bala"],
      agni: "Strongest — ideal for heavy, nourishing food"
    },
    Vasanta: {
      name: "Vasanta (Spring)",
      months: "March – April",
      dominant_dosha: "Kapha",
      season_icon: "🌸",
      diet: {
        recommended: ["Barley", "Old wheat", "Honey", "Bitter vegetables", "Light proteins", "Warm water with ginger"],
        avoid: ["Heavy dairy", "Sweet/sour/salty foods", "Oily food", "Cold beverages", "New grains"]
      },
      lifestyle: {
        recommended: ["Vigorous exercise", "Dry massage (Udvartana)", "Fasting on light days", "Nasal cleansing (Nasya)", "Vamana therapy"],
        avoid: ["Day sleeping", "Sedentary habits", "Heavy meals", "Excess sleep"]
      },
      herbs: ["Trikatu", "Kutki", "Guduchi"],
      agni: "Moderate — Kapha suppresses Agni, so light meals are key"
    },
    Grishma: {
      name: "Grishma (Summer)",
      months: "May – June",
      dominant_dosha: "Pitta",
      season_icon: "☀️",
      diet: {
        recommended: ["Cool liquids", "Coconut water", "Sweet fruits", "Rice", "Milk", "Ghee", "Coriander", "Mint"],
        avoid: ["Spicy food", "Sour food", "Salt excess", "Heavy exercise post-noon", "Alcohol", "Fermented food"]
      },
      lifestyle: {
        recommended: ["Cool baths", "Light cotton clothing", "Rest in afternoon", "Moon-gazing (chandrama darshana)", "Sandalwood paste"],
        avoid: ["Intense midday sun", "Heavy exercise in peak heat", "Hot spice use"]
      },
      herbs: ["Shatavari", "Amalaki", "Chandana (Sandalwood)"],
      agni: "Weakest — digestive fire diminishes, eat light and cooling"
    },
    Varsha: {
      name: "Varsha (Monsoon/Rainy)",
      months: "July – August",
      dominant_dosha: "Vata & Pitta",
      season_icon: "🌧️",
      diet: {
        recommended: ["Old grains", "Boiled water", "Honey", "Ginger", "Rock salt", "Light oils", "Medicated enema foods"],
        avoid: ["River water (unfiltered)", "Heavy meat", "Leafy vegetables", "Curd", "Watermelon"]
      },
      lifestyle: {
        recommended: ["Basti (medicated enema) therapy", "Fumigation (Dhoopana) of house", "Dry clothing", "Avoid getting wet", "Light exercise only"],
        avoid: ["Excessive physical activity", "Sleeping on damp ground", "Day sleeping", "Cold exposure"]
      },
      herbs: ["Guduchi", "Pippali", "Haritaki"],
      agni: "Very weak — highly erratic, eat small and easily digestible meals"
    },
    Sharada: {
      name: "Sharada (Autumn)",
      months: "September – October",
      dominant_dosha: "Pitta",
      season_icon: "🍂",
      diet: {
        recommended: ["Bitter & astringent foods", "Barley", "Green gram", "Sugar cane", "Gooseberry (Amalaki)", "Light foods"],
        avoid: ["Fatty/oily food", "Curds", "Lotus root", "Alkaline foods", "New wine"]
      },
      lifestyle: {
        recommended: ["Virechana (purgation) therapy", "Blood-letting (Raktamokshana)", "Moonlight exposure", "Light yoga", "Cool oil massage"],
        avoid: ["Sleeping in direct sunlight", "Eastern wind exposure", "Heavy exercise"]
      },
      herbs: ["Neem", "Amalaki", "Guduchi"],
      agni: "Strong — gradually increasing, introduce heavier foods slowly"
    },
    Hemanta: {
      name: "Hemanta (Early Winter)",
      months: "November – December",
      dominant_dosha: "Kapha",
      season_icon: "🌨️",
      diet: {
        recommended: ["Nourishing soups", "Milk products", "Sugarcane products", "Sesame", "Garlic", "Spiced foods", "Meat (for non-vegetarians)"],
        avoid: ["Light/dry food", "Vata-aggravating food", "Cold drinks", "Bitter/pungent excess"]
      },
      lifestyle: {
        recommended: ["Daily oil massage", "Warm baths", "Exercise increases", "Warm comfortable clothing", "Tonics & Rasayana"],
        avoid: ["Cold wind exposure without clothing", "Fasting", "Late nights without warmth"]
      },
      herbs: ["Ashwagandha", "Shilajit", "Bala"],
      agni: "Strong — best time for Rasayana (rejuvenation) therapy"
    }
  },

  // ----------------------------------------------------------
  //  CHATBOT KNOWLEDGE BASE
  // ----------------------------------------------------------
  chatKnowledge: [
    { keywords: ["headache", "head pain", "migraine"], response: "For Vata-type headache (throbbing, dull): apply warm Brahmi Taila on the forehead. For Pitta-type (burning, behind eyes): apply sandalwood paste. Drink warm water with a pinch of dry ginger. If severe or recurring, please consult your physician. Would you like me to escalate to Dr. Meera Nair?" },
    { keywords: ["constipation", "bowel", "stomach", "digestion"], response: "Triphala Churna (3g with warm water at bedtime) is the classical remedy. Wake up early, drink 2 glasses of warm water, and do light abdominal massage clockwise. Avoid cold, dry, and raw foods. If no relief in 3 days, consult your physician." },
    { keywords: ["stress", "anxiety", "tension", "worry"], response: "Ashwagandha Churna (5g with warm milk at bedtime) is highly effective for Vata-driven anxiety. Practice Nadi Shodhana (alternate nostril breathing) for 10 minutes morning and evening. Brahmi Ghrita is also recommended. Shall I add a guided breathing exercise to your Dinacharya?" },
    { keywords: ["sleep", "insomnia", "can't sleep"], response: "Apply warm Brahmi Taila on the scalp before bed. Drink warm milk with a pinch of nutmeg (Jaiphal). Avoid screens 1 hour before bed. Ashwagandha at bedtime significantly improves sleep quality. Your current prescription includes Brahmi Taila — please ensure you are using it." },
    { keywords: ["diet", "food", "eat", "nutrition"], response: "Your current Prakriti is Vata-Pitta. Focus on warm, oily, and grounding foods. Avoid cold, dry, excessively spicy foods. Current season recommendation: see your Ritucharya card on the dashboard. Shall I show you today's meal plan?" },
    { keywords: ["dosha", "vata", "pitta", "kapha", "balance"], response: "Your current dosha reading shows Vata: 42%, Pitta: 35%, Kapha: 23%. Vata is slightly elevated. To pacify: warm foods, warm oil application, a regular daily routine (Dinacharya), and adequate sleep. Shall I adjust your today's routine?" },
    { keywords: ["medicine", "medication", "prescription", "churna"], response: "Your current medications are: (1) Ashwagandha Churna 5g — bedtime with milk, (2) Triphala Churna 3g — bedtime with warm water, (3) Brahmi Taila — external scalp application. Any specific doubts about one of these?" },
    { keywords: ["emergency", "urgent", "severe", "hospital"], response: "🚨 This sounds like it may need immediate attention. I am escalating this to Dr. Meera Nair right now. Please also call emergency services if you feel this is life-threatening. Stay calm and breathe slowly." },
    { keywords: ["hello", "hi", "hey", "namaste"], response: "Namaste! 🙏 I'm AyurCare AI, your 24/7 Ayurvedic wellness assistant. I can help with diet doubts, medication questions, and general health guidance. How can I help you today?" },
    { keywords: ["weather", "rain", "cold", "hot"], response: "Based on the current weather, I've updated your Ritucharya recommendations. Please check your Weather Adaptation card on the dashboard for updated diet and lifestyle tips." }
  ],

  // ----------------------------------------------------------
  //  VEGA BOUT (ELIMINATION THERAPY) DATA
  // ----------------------------------------------------------
  vegaBouts: [
    {
      patientId: "P001",
      therapy: "Virechana",
      startDate: "2024-03-05",
      bouts: [
        { time: "08:00", number: 1, volume: "moderate", color: "yellow-green", consistency: "semi-formed", notes: "Initial bile expulsion" },
        { time: "09:15", number: 2, volume: "large", color: "dark-green", consistency: "liquid", notes: "Pitta predominant" },
        { time: "10:30", number: 3, volume: "moderate", color: "yellow", consistency: "liquid", notes: "Good flow" },
        { time: "11:45", number: 4, volume: "small", color: "light-yellow", consistency: "semi-liquid", notes: "Tapering off" },
        { time: "13:00", number: 5, volume: "trace", color: "watery", consistency: "clear", notes: "Samyak Virechana achieved" }
      ],
      outcome: "Samyak (Proper) Virechana — 5 bouts, complete Pitta clearance",
      doctorNotes: "Excellent response. Patient to rest for 3 days. Begin Samsarjana Krama diet."
    }
  ],

  // ----------------------------------------------------------
  //  NETRA TARPANA — ORBITAL NODES
  // ----------------------------------------------------------
  netraTarpana: {
    orbitalNodes: [
      { id: "N1", x: 25, y: 30, label: "Medial Canthus", leakRisk: "High" },
      { id: "N2", x: 75, y: 30, label: "Lateral Canthus", leakRisk: "Medium" },
      { id: "N3", x: 50, y: 20, label: "Superior Orbital", leakRisk: "Low" },
      { id: "N4", x: 50, y: 80, label: "Inferior Orbital", leakRisk: "Medium" },
      { id: "N5", x: 25, y: 55, label: "Medial Lower", leakRisk: "High" },
      { id: "N6", x: 75, y: 55, label: "Lateral Lower", leakRisk: "Low" }
    ],
    doughThickness: { min: 2, max: 4, unit: "cm", ideal: 2.5 },
    oilTemp: { min: 35, max: 40, unit: "°C", ideal: 37 }
  },

  // ----------------------------------------------------------
  //  VEGA BOUT CLASSIFIER — SEVERITY GUIDE
  // ----------------------------------------------------------
  vegaClassifier: {
    samyakVirechana: {
      name: "Samyak (Proper)",
      color: "green",
      criteria: { bouts: "5–10", volume: "Moderate", color: "Yellow-green progressing to clear", consistency: "Liquid to watery" },
      outcome: "Complete Pitta clearance. Patient feels light and clear.",
      action: "Proceed to Samsarjana Krama (graduated diet)"
    },
    hinnaVirechana: {
      name: "Heena (Insufficient)",
      color: "yellow",
      criteria: { bouts: "< 5", volume: "Small", color: "Only yellow", consistency: "Semi-formed" },
      outcome: "Incomplete clearance. Toxins remain.",
      action: "Repeat therapy after 3 days with increased dose"
    },
    atiVirechana: {
      name: "Ati (Excessive)",
      color: "red",
      criteria: { bouts: "> 15", volume: "Very large", color: "Blood-tinged or black", consistency: "Pure liquid" },
      outcome: "Over-purgation. Risk of dehydration and Vata aggravation.",
      action: "Stop therapy immediately. Administer Dashamoola decoction. Monitor vitals."
    }
  }
};

// Export for use in main app
if (typeof module !== 'undefined') module.exports = AyurDB;
