// client/src/data/ayurdb.js — static Ayurvedic knowledge base (replaces database.js)

export const defaultDinacharya = [
  { time: '06:00', task: 'Wake up & Nasya (nasal drops)' },
  { time: '06:30', task: 'Yoga & Pranayama (15 min)' },
  { time: '07:00', task: 'Warm sesame oil Abhyanga' },
  { time: '08:00', task: 'Ashwagandha Churna with warm milk' },
  { time: '12:30', task: 'Lunch — light Pitta-pacifying meal' },
  { time: '18:00', task: 'Triphala Churna with warm water' },
  { time: '21:00', task: 'Brahmi Taila scalp massage' },
];

export const ritucharya = {
  Shishira: { name:'Shishira (Late Winter)', months:'January – February', dominant_dosha:'Vata & Kapha', season_icon:'❄️', diet:{ recommended:['Warm soups','Sesame seeds','Jaggery','Urad Dal','Ghee','Root vegetables','Warm spiced milk'], avoid:['Cold foods','Raw salads','Refrigerated items','Light grains like barley'] }, lifestyle:{ recommended:['Oil massage (Abhyanga) daily','Warm baths','Moderate exercise','Warm clothing','Garlic & ginger use'], avoid:['Cold water baths','Day sleeping','Exposure to cold wind','Fasting'] }, herbs:['Ashwagandha','Shatavari','Bala'], agni:'Strongest — ideal for heavy, nourishing food' },
  Vasanta:  { name:'Vasanta (Spring)', months:'March – April', dominant_dosha:'Kapha', season_icon:'🌸', diet:{ recommended:['Barley','Old wheat','Honey','Bitter vegetables','Light proteins','Warm water with ginger'], avoid:['Heavy dairy','Sweet/sour/salty foods','Oily food','Cold beverages','New grains'] }, lifestyle:{ recommended:['Vigorous exercise','Dry massage (Udvartana)','Fasting on light days','Nasal cleansing (Nasya)','Vamana therapy'], avoid:['Day sleeping','Sedentary habits','Heavy meals','Excess sleep'] }, herbs:['Trikatu','Kutki','Guduchi'], agni:'Moderate — Kapha suppresses Agni, so light meals are key' },
  Grishma:  { name:'Grishma (Summer)', months:'May – June', dominant_dosha:'Pitta', season_icon:'☀️', diet:{ recommended:['Cool liquids','Coconut water','Sweet fruits','Rice','Milk','Ghee','Coriander','Mint'], avoid:['Spicy food','Sour food','Salt excess','Heavy exercise post-noon','Alcohol','Fermented food'] }, lifestyle:{ recommended:['Cool baths','Light cotton clothing','Rest in afternoon','Moon-gazing','Sandalwood paste'], avoid:['Intense midday sun','Heavy exercise in peak heat','Hot spice use'] }, herbs:['Shatavari','Amalaki','Chandana (Sandalwood)'], agni:'Weakest — digestive fire diminishes, eat light and cooling' },
  Varsha:   { name:'Varsha (Monsoon/Rainy)', months:'July – August', dominant_dosha:'Vata & Pitta', season_icon:'🌧️', diet:{ recommended:['Old grains','Boiled water','Honey','Ginger','Rock salt','Light oils'], avoid:['River water (unfiltered)','Heavy meat','Leafy vegetables','Curd','Watermelon'] }, lifestyle:{ recommended:['Basti therapy','Fumigation (Dhoopana)','Dry clothing','Avoid getting wet','Light exercise only'], avoid:['Excessive physical activity','Sleeping on damp ground','Day sleeping','Cold exposure'] }, herbs:['Guduchi','Pippali','Haritaki'], agni:'Very weak — highly erratic, eat small and easily digestible meals' },
  Sharada:  { name:'Sharada (Autumn)', months:'September – October', dominant_dosha:'Pitta', season_icon:'🍂', diet:{ recommended:['Bitter & astringent foods','Barley','Green gram','Sugar cane','Gooseberry (Amalaki)','Light foods'], avoid:['Fatty/oily food','Curds','Lotus root','Alkaline foods','New wine'] }, lifestyle:{ recommended:['Virechana therapy','Blood-letting','Moonlight exposure','Light yoga','Cool oil massage'], avoid:['Sleeping in direct sunlight','Eastern wind exposure','Heavy exercise'] }, herbs:['Neem','Amalaki','Guduchi'], agni:'Strong — gradually increasing, introduce heavier foods slowly' },
  Hemanta:  { name:'Hemanta (Early Winter)', months:'November – December', dominant_dosha:'Kapha', season_icon:'🌨️', diet:{ recommended:['Nourishing soups','Milk products','Sugarcane products','Sesame','Garlic','Spiced foods'], avoid:['Light/dry food','Vata-aggravating food','Cold drinks','Bitter/pungent excess'] }, lifestyle:{ recommended:['Daily oil massage','Warm baths','Exercise increases','Warm comfortable clothing','Tonics & Rasayana'], avoid:['Cold wind exposure without clothing','Fasting','Late nights without warmth'] }, herbs:['Ashwagandha','Shilajit','Bala'], agni:'Strong — best time for Rasayana (rejuvenation) therapy' },
};

export const viruddha = [
  { id:'V001', combination:'Milk + Fish', items:['Milk','Fish'], category:'Desya Viruddha (Regional incompatibility)', mechanism:'Both are heavy to digest; together they produce Ama (toxins) and can cause skin disorders, blockage of channels (Srotas), and digestive disorders.', severity:'High', symptoms:['Skin disorders','Digestive distress','Nausea','Bloating'], remedy:'If consumed accidentally: Trikatu powder with honey; follow with warm water. Long-term: Panchakarma detox.', ancient_ref:'Charaka Samhita, Sutrasthana 26/84' },
  { id:'V002', combination:'Honey + Ghee (equal quantities)', items:['Honey','Ghee'], category:'Matra Viruddha (Quantity incompatibility)', mechanism:'Equal quantities create a toxic compound (Ama). The heating property of ghee combined with honey\'s complex sugars creates indigestible metabolites.', severity:'High', symptoms:['Chronic toxin accumulation','Respiratory issues','Digestive sluggishness'], remedy:'Use different proportions (1:2 ratio is safe). Detox with Triphala.', ancient_ref:'Ashtanga Hridayam, Sutrasthana 7/48' },
  { id:'V003', combination:'Milk + Fruits (Sour)', items:['Milk','Sour fruits'], category:'Guna Viruddha (Property incompatibility)', mechanism:'Sour fruits curdle milk in the stomach, creating indigestible proteins. Disrupts digestive enzymes and causes fermentation.', severity:'Medium', symptoms:['Bloating','Gas','Skin breakouts','Diarrhea'], remedy:'Separate consumption by at least 2 hours. Ginger tea helps neutralize.', ancient_ref:'Charaka Samhita, Sutrasthana 26/83' },
  { id:'V004', combination:'Milk + Salt', items:['Milk','Salt'], category:'Guna Viruddha (Property incompatibility)', mechanism:'Salt triggers milk to form heavy, curd-like mass in the stomach. Creates Pitta aggravation and skin disorders over long-term use.', severity:'Medium', symptoms:['Skin issues','Pitta aggravation','Poor digestion'], remedy:'Avoid salted foods with milk. Cardamom milk is a good alternative.', ancient_ref:'Ashtanga Hridayam' },
  { id:'V005', combination:'Honey + Hot Water/Food', items:['Honey','Hot water'], category:'Krama Viruddha (Processing incompatibility)', mechanism:'Heating honey above 40°C converts it into a sticky, toxic compound. The HMF formed is carcinogenic and creates Ama.', severity:'High', symptoms:['Toxin accumulation','Inflammatory conditions','Long-term: organ stress'], remedy:'Always use honey at room temperature. If consumed: increase water intake and try mild Panchakarma.', ancient_ref:'Charaka Samhita, Sutrasthana 27/249' },
  { id:'V006', combination:'Ghee + Cold Water', items:['Ghee','Cold water'], category:'Krama Viruddha (Processing incompatibility)', mechanism:'Cold water solidifies ghee in the digestive tract, preventing proper digestion and creating a coating on the gut lining.', severity:'Medium', symptoms:['Digestive sluggishness','Nausea','Kapha aggravation'], remedy:'Always drink warm water after meals with ghee. Trikatu churna helps dissolve.', ancient_ref:'Ashtanga Hridayam, Sutrasthana 7' },
  { id:'V007', combination:'Radish + Milk', items:['Radish','Milk'], category:'Guna Viruddha', mechanism:'Radish is pungent and heating; milk is sweet and cooling. Together they create contradictory digestive signals.', severity:'Low', symptoms:['Bloating','Gas','Abdominal discomfort'], remedy:'Separate by 2 hours. Jeera (cumin) water helps with gas.', ancient_ref:'Charaka Samhita' },
  { id:'V008', combination:'Banana + Milk', items:['Banana','Milk'], category:'Guna Viruddha', mechanism:'Both are heavy and sweet; together they slow Agni (digestive fire), produce Kapha, and may cause congestion.', severity:'Low', symptoms:['Heaviness','Congestion','Lethargy','Sinus issues'], remedy:'If consumed: add a pinch of cardamom and cinnamon to aid digestion.', ancient_ref:'Ashtanga Hridayam' },
];

export const vegaClassifier = {
  samyakVirechana: { name:'Samyak (Proper)', color:'green', criteria:{ bouts:'5–10', volume:'Moderate', color:'Yellow-green progressing to clear', consistency:'Liquid to watery' }, outcome:'Complete Pitta clearance. Patient feels light and clear.', action:'Proceed to Samsarjana Krama (graduated diet)' },
  hinnaVirechana:  { name:'Heena (Insufficient)', color:'yellow', criteria:{ bouts:'< 5', volume:'Small', color:'Only yellow', consistency:'Semi-formed' }, outcome:'Incomplete clearance. Toxins remain.', action:'Repeat therapy after 3 days with increased dose' },
  atiVirechana:    { name:'Ati (Excessive)', color:'red', criteria:{ bouts:'> 15', volume:'Very large', color:'Blood-tinged or black', consistency:'Pure liquid' }, outcome:'Over-purgation. Risk of dehydration and Vata aggravation.', action:'Stop therapy immediately. Administer Dashamoola decoction. Monitor vitals.' },
};

export const netraTarpana = {
  orbitalNodes: [
    { id:'N1', x:25, y:30, label:'Medial Canthus',    leakRisk:'High' },
    { id:'N2', x:75, y:30, label:'Lateral Canthus',   leakRisk:'Medium' },
    { id:'N3', x:50, y:20, label:'Superior Orbital',  leakRisk:'Low' },
    { id:'N4', x:50, y:80, label:'Inferior Orbital',  leakRisk:'Medium' },
    { id:'N5', x:25, y:55, label:'Medial Lower',      leakRisk:'High' },
    { id:'N6', x:75, y:55, label:'Lateral Lower',     leakRisk:'Low' },
  ],
  doughThickness: { min:2, max:4, unit:'cm', ideal:2.5 },
  oilTemp:        { min:35, max:40, unit:'°C', ideal:37 },
};

export const chatKnowledge = [
  { keywords:['headache','head pain','migraine'],          response:'For Vata-type headache: apply warm Brahmi Taila on the forehead. For Pitta-type (burning): apply sandalwood paste. Drink warm water with a pinch of dry ginger. If severe or recurring, please consult your physician.' },
  { keywords:['constipation','bowel','stomach','digestion'],response:'Triphala Churna (3g with warm water at bedtime) is the classical remedy. Wake up early, drink 2 glasses of warm water, and do light abdominal massage clockwise. Avoid cold, dry, and raw foods.' },
  { keywords:['stress','anxiety','tension','worry'],        response:'Ashwagandha Churna (5g with warm milk at bedtime) is highly effective for Vata-driven anxiety. Practice Nadi Shodhana (alternate nostril breathing) for 10 minutes morning and evening.' },
  { keywords:['sleep','insomnia','can\'t sleep'],           response:'Apply warm Brahmi Taila on the scalp before bed. Drink warm milk with a pinch of nutmeg. Avoid screens 1 hour before bed. Ashwagandha at bedtime significantly improves sleep quality.' },
  { keywords:['diet','food','eat','nutrition'],             response:'Focus on warm, oily, and grounding foods for your Prakriti. Avoid cold, dry, excessively spicy foods. Check your Ritucharya card on the dashboard for seasonal recommendations.' },
  { keywords:['dosha','vata','pitta','kapha','balance'],    response:'To pacify elevated Vata: warm foods, warm oil application, a regular daily routine (Dinacharya), and adequate sleep. Would you like me to adjust your today\'s routine?' },
  { keywords:['medicine','medication','prescription'],      response:'Your current medications include Ashwagandha Churna, Triphala Churna, and Brahmi Taila. Any specific doubts about one of these?' },
  { keywords:['emergency','urgent','severe','hospital'],    response:'🚨 This sounds like it may need immediate attention. Escalating to your physician now. Please also call emergency services if you feel this is life-threatening. Stay calm and breathe slowly.' },
  { keywords:['hello','hi','hey','namaste'],                response:'Namaste! 🙏 I\'m AyurCare AI, your 24/7 Ayurvedic wellness assistant. I can help with diet doubts, medication questions, and general health guidance. How can I help you today?' },
  { keywords:['weather','rain','cold','hot'],               response:'Based on the current weather, I\'ve updated your Ritucharya recommendations. Please check your Weather Adaptation card on the dashboard for updated diet and lifestyle tips.' },
];

export const DUMMY_PATIENTS = [
  {
    id: 'pat-001',
    display_name: 'Priya Venkatesh',
    email: 'priya@ayurdash.com',
    phone: '+91-9123456789',
    age: 28,
    gender: 'Female',
    prakriti: 'Kapha-Vata',
    blood_group: 'O+',
    priority: 'critical',
    allergies: ['Sesame (external heat rash)', 'Late-night heavy dairy'],
    mental_health: 'Post-Virechana recovery. Severe dehydration risk & electrolyte surveillance.',
    dosha_vata: 30,
    dosha_pitta: 25,
    dosha_kapha: 45,
    bouts_count: 16,
    bouts_type: 'Ati-Vega'
  },
  {
    id: 'pat-002',
    display_name: 'Vikramaditya Sen',
    email: 'vikram@ayurdash.com',
    phone: '+91-9888123456',
    age: 45,
    gender: 'Male',
    prakriti: 'Pitta-Vata',
    blood_group: 'B+',
    priority: 'critical',
    allergies: ['Mustard oil', 'Fermented foods'],
    mental_health: 'Acute Raktapitta exacerbation. Burning sensation, epistaxis. Requires Chandana & Pitta pacification.',
    dosha_vata: 25,
    dosha_pitta: 60,
    dosha_kapha: 15,
    bouts_count: 14,
    bouts_type: 'Ati-Vega'
  },
  {
    id: 'pat-003',
    display_name: 'Arjun Sharma',
    email: 'arjun@ayurdash.com',
    phone: '+91-9876543210',
    age: 34,
    gender: 'Male',
    prakriti: 'Vata-Pitta',
    blood_group: 'B+',
    priority: 'high',
    allergies: ['Milk at night', 'Heavy oils post-sunset'],
    mental_health: 'Severe insomnia (3 hrs sleep/night) & tremors. Elevated Vata dosha requiring Ashwagandha & Shirodhara.',
    dosha_vata: 55,
    dosha_pitta: 30,
    dosha_kapha: 15,
    bouts_count: 8,
    bouts_type: 'Samyak-Vega'
  },
  {
    id: 'pat-004',
    display_name: 'Ananya Deshmukh',
    email: 'ananya@ayurdash.com',
    phone: '+91-9765432109',
    age: 31,
    gender: 'Female',
    prakriti: 'Kapha-Pitta',
    blood_group: 'A-',
    priority: 'high',
    allergies: ['Cold liquids', 'Dust mites'],
    mental_health: 'Bronchial congestion & mild Shwasa post-emesis. Sitopaladi & Kantakari advised.',
    dosha_vata: 20,
    dosha_pitta: 35,
    dosha_kapha: 45,
    bouts_count: 6,
    bouts_type: 'Samyak-Vega'
  },
  {
    id: 'pat-005',
    display_name: 'Kavita Sundaram',
    email: 'kavita@ayurdash.com',
    phone: '+91-9845012345',
    age: 42,
    gender: 'Female',
    prakriti: 'Pitta-Kapha',
    blood_group: 'A+',
    priority: 'medium',
    allergies: ['Sour citrus', 'Eggplant'],
    mental_health: 'Active Shamana therapy for bilateral knee osteoarthritis (Sandhigata Vata). Responding well to Janu Basti.',
    dosha_vata: 40,
    dosha_pitta: 35,
    dosha_kapha: 25,
    bouts_count: 7,
    bouts_type: 'Samyak-Vega'
  },
  {
    id: 'pat-006',
    display_name: 'Rohan Kulkarni',
    email: 'rohan@ayurdash.com',
    phone: '+91-9900112233',
    age: 39,
    gender: 'Male',
    prakriti: 'Vata-Pitta',
    blood_group: 'O-',
    priority: 'medium',
    allergies: ['Gluten sensitivity'],
    mental_health: 'Grahani dosha (IBS pattern). Irregular Agni with post-prandial cramping. Takrarishta regimen ongoing.',
    dosha_vata: 45,
    dosha_pitta: 40,
    dosha_kapha: 15,
    bouts_count: 4,
    bouts_type: 'Heena-Vega'
  },
  {
    id: 'pat-007',
    display_name: 'Rajesh Nair',
    email: 'rajesh@ayurdash.com',
    phone: '+91-9741234567',
    age: 50,
    gender: 'Male',
    prakriti: 'Sama-Tridosha',
    blood_group: 'AB+',
    priority: 'low',
    allergies: [],
    mental_health: 'Optimal health and high Ojas. Preventive Rasayana regimen with daily Chyawanprash.',
    dosha_vata: 33,
    dosha_pitta: 34,
    dosha_kapha: 33,
    bouts_count: 7,
    bouts_type: 'Samyak-Vega'
  },
  {
    id: 'pat-008',
    display_name: 'Sunita Menon',
    email: 'sunita@ayurdash.com',
    phone: '+91-9811223344',
    age: 56,
    gender: 'Female',
    prakriti: 'Kapha-Vata',
    blood_group: 'O+',
    priority: 'low',
    allergies: ['Peanuts'],
    mental_health: 'Routine annual rejuvenation checkup. Vitals optimal, metabolic markers stable.',
    dosha_vata: 28,
    dosha_pitta: 32,
    dosha_kapha: 40,
    bouts_count: 8,
    bouts_type: 'Samyak-Vega'
  }
];

export const DUMMY_MEDICINES = [
  { id: 'M001', name: 'Ashwagandha Churna', type: 'Churna', sanskrit: 'Withania somnifera', benefits: ['Reduces stress & anxiety', 'Boosts immunity', 'Improves sleep quality', 'Enhances strength'], dosage: '3–5g with warm milk at bedtime', contraindications: ['Pregnancy', 'Hyperthyroidism'], dosha_action: 'Vata-pacifying, Kapha-increasing' },
  { id: 'M002', name: 'Triphala Churna', type: 'Churna', sanskrit: 'Terminalia chebula + Terminalia bellirica + Phyllanthus emblica', benefits: ['Digestive tonic', 'Gentle laxative', 'Antioxidant', 'Eye health'], dosage: '3–6g with warm water before bed', contraindications: ['Diarrhea', 'Dehydration'], dosha_action: 'Tridosha-balancing' },
  { id: 'M003', name: 'Brahmi Taila', type: 'Taila (Oil)', sanskrit: 'Bacopa monnieri', benefits: ['Memory enhancement', 'Scalp nourishment', 'Reduces mental fatigue', 'Promotes hair growth'], dosage: 'Apply 5–10ml warm oil to scalp, leave 30 min before bath', contraindications: ['Open wounds on scalp'], dosha_action: 'Vata-pacifying, Pitta-pacifying' },
  { id: 'M004', name: 'Trikatu Churna', type: 'Churna', sanskrit: 'Zingiber officinale + Piper nigrum + Piper longum', benefits: ['Ignites Agni (digestive fire)', 'Clears Kapha', 'Reduces obesity', 'Clears sinuses'], dosage: '1–3g with honey before meals', contraindications: ['Pitta disorders', 'Peptic ulcer', 'Pregnancy'], dosha_action: 'Kapha-reducing, Vata-reducing' },
  { id: 'M005', name: 'Dashamoola Kashaya', type: 'Kashaya (Decoction)', sanskrit: 'Ten roots formulation', benefits: ['Anti-inflammatory', 'Relieves Vata disorders', 'Post-natal care', 'Fever management'], dosage: '30–60ml twice daily before food', contraindications: ['Constipation without Vata imbalance'], dosha_action: 'Vata-pacifying' },
  { id: 'M006', name: 'Mahanarayan Taila', type: 'Taila (Oil)', sanskrit: 'Classical poly-herbal oil', benefits: ['Joint pain relief', 'Muscle stiffness', 'Paralysis recovery', 'Arthritis management'], dosage: 'Warm application over joints, followed by steam therapy', contraindications: ['Fresh injuries', 'Open wounds'], dosha_action: 'Vata-pacifying' },
  { id: 'M007', name: 'Shankhapushpi Syrup', type: 'Syrup', sanskrit: 'Convolvulus pluricaulis', benefits: ['Memory booster', 'Reduces anxiety', 'Improves concentration', 'Mild sedative'], dosage: '10–15ml with equal water twice daily', contraindications: ['Excessive Kapha'], dosha_action: 'Vata-pacifying, Pitta-pacifying' },
  { id: 'M008', name: 'Yogaraj Guggulu', type: 'Vati (Tablet)', sanskrit: 'Classical anti-arthritic compound', benefits: ['Deep joint penetration', 'Reduces inflammatory Ama', 'Vata pacification'], dosage: '2 tablets twice daily with warm water', contraindications: ['Severe gastritis'], dosha_action: 'Vata-Kapha pacifying' },
  { id: 'M009', name: 'Chyawanprash Awaleha', type: 'Awaleha (Jam)', sanskrit: 'Amla-based Rasayana', benefits: ['Deep tissue Ojas builder', 'Respiratory vitality', 'Anti-aging adaptogen'], dosage: '1 teaspoon (10g) in morning with warm water', contraindications: ['Uncontrolled diabetes'], dosha_action: 'Tridosha Rasayana' }
];

