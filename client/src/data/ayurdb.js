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
