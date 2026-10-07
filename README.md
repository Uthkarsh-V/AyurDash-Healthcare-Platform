# 🌿 AyurDash — Intelligent Ayurvedic Care & Training Platform

> **Ancient Wisdom. Modern Care.**  
> A full-stack multi-portal web application for Ayurvedic patient management, clinical workflow, and practitioner training.

---

## 🔗 Project Links

| Resource | Link |
|---|---|
| 🌐 **Live App (Firebase Hosting)** | https://ayurdash.web.app |
| 🌐 **Live App (Netlify Mirror)** | https://ayurdash.netlify.app |
| 📦 **GitHub Repository** | https://github.com/Uthkarsh-V/AyurDash-Healthcare-Platform |
| 📋 **Migration Plan (React + SQL)** | [ayurdash-migration-plan.md](./ayurdash-migration-plan.md) |
| 🗂 **Google Drive (Assets & Patent)** | *(see Section 1.10 of Patent Document — add link after creating Drive folder)* |

---

## 🏗 Architecture

```
Browser (Vanilla HTML/CSS/JS SPA)
        │
        ▼
Firebase Auth  ──────────►  Cloud Firestore
(Authentication)             (NoSQL Database)
        │
        ▼
Firebase Hosting
(Static file delivery via CDN)
```

### Planned Migration Stack (see [migration plan](./ayurdash-migration-plan.md))
```
React 18 (Vite)  +  Renderbit (Canvas)
        │
        ▼  HTTP + JWT
Node.js / Express  ──►  PostgreSQL (Knex ORM)
```

---

## 👥 Portals

| Portal | Default View | Key Modules |
|---|---|---|
| 🧘 **Patient** | Daily Dashboard (Dinacharya) | Dosha tracking, AI prescription scanner, Ritucharya weather, Abhyanga camera guide, Health ID, AyurCare AI chat |
| 🩺 **Physician** | Clinical Hub | Prescription designer, Vega Bout elimination monitor, Patient lookup & full records |
| 📚 **Student** | Netra Tarpana Simulator | Pose-estimation auditor, Vega classifier, Viruddha food checker |
| 🔄 **Shared** | Medicines Directory | 7-formulation Ayurvedic formulary, Smartwatch BLE reminder hub |

---

## ✨ Features

- 🌅 **Dinacharya Dashboard** — Real-time Dosha balance bars, daily routine task checklist, guided Pranayama breathing
- 📋 **AI Prescription Scanner** — Upload prescription image → auto-parse medicines → inject into daily schedule
- 🌦 **Ritucharya** — Weather-mapped seasonal diet & lifestyle recommendations across all 6 Ayurvedic Ritus
- 💆 **Abhyanga Camera Guide** — WebRTC live camera with canvas stroke-sequence overlay
- 🪪 **Digital Health ID** — Patient-controlled granular privacy (per-field toggles respected in real time by physician)
- 💬 **AyurCare AI Chat** — 24/7 keyword-NLP Ayurvedic assistant with emergency physician escalation
- 🏥 **Clinical Hub** — Live prescription dispatch from doctor → patient's Dinacharya
- 📊 **Vega Bout Monitor** — Real-time Panchakarma elimination therapy logging + auto-classification (Samyak/Heena/Ati)
- 👁 **Netra Tarpana Simulator** — Parametric canvas simulation (dough thickness, oil temperature, 6 orbital risk nodes)
- 🧪 **Pose Auditor** — Camera-based Abhyanga technique audit metrics (strokes/min, L/R sync, coverage)
- 🧬 **Vega Classifier** — Training tool for Virechana/Vamana outcome classification
- ⚠️ **Viruddha Checker** — Searchable incompatible food database with classical text citations
- 💊 **Medicines Directory** — 7 Ayurvedic formulations with full profiles, dosages, contraindications
- ⌚ **Smartwatch Hub** — Web Bluetooth BLE pairing + prescription-aware reminders + 7-day compliance streak

---

## 🚀 Quick Start (Local)

### Prerequisites
- Modern browser (Chrome recommended for Web Bluetooth features)
- No build step required — pure HTML/CSS/JS

### Run Locally
```bash
# Clone the repo
git clone https://github.com/Uthkarsh-V/AyurDash-Healthcare-Platform.git
cd AyurDash-Healthcare-Platform

# Open directly in browser (no server needed for demo mode)
# Option 1: VS Code Live Server extension → right-click index.html → Open with Live Server
# Option 2: Python simple server
python -m http.server 8080
# Then open: http://localhost:8080
```

### Demo Login
Click any portal button on the login screen — no credentials needed:
- 🧘 **Patient** → Arjun Sharma (Vata-Pitta)
- 🩺 **Physician** → Dr. Meera Nair (Panchakarma & Rasayana)
- 📚 **Student** → Aditya Rao (Training Labs)

---

## 📁 File Structure

```
AyurDash-Healthcare-Platform/
├── index.html          ← Main SPA (all 15 module views)
├── app.js              ← Patient, Doctor, Student, App modules
├── watch.js            ← Smartwatch BLE reminder engine
├── database.js         ← Static Ayurvedic knowledge base (AyurDB)
├── firebase.js         ← Firebase config & service shortcuts
├── firestore.js        ← Firestore CRUD data layer (Store)
├── auth.html           ← Authentication page (7 screens)
├── auth.js             ← Auth logic (login, signup, OTP, Google)
├── style.css           ← Main application styles
├── watch.css           ← Smartwatch hub styles
├── auth.css            ← Authentication page styles
├── firebase.json       ← Firebase Hosting config
├── .firebaserc         ← Firebase project alias
├── netlify.toml        ← Netlify deploy config
├── ayurdash-migration-plan.md  ← React + SQL migration plan
└── README.md           ← This file
```

---

## 🗄 Database (Current — Firestore)

| Collection | Purpose |
|---|---|
| `users` | Auth profiles for all roles |
| `patients` | Patient health data, Dosha, privacy settings |
| `doctors` | Doctor profile, specialisation |
| `prescriptions` | Doctor → Patient prescription records |
| `reminders` | Smartwatch medication reminders |
| `dinacharya` | Daily task completion per user per date |
| `vegaBouts` | Panchakarma elimination therapy logs |
| `chatHistory` | AyurCare AI conversation history |
| `medicines` | Seeded Ayurvedic medicine formulary |

---

## 🗄 Database (Planned Migration — PostgreSQL)

See full schema in [ayurdash-migration-plan.md](./ayurdash-migration-plan.md) — Sub-Task 1.

---

## 🔥 Deploy

### Firebase Hosting (Current)
```bash
# Install Firebase CLI (one time)
npm install -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting
```
**Live URL:** https://ayurdash.web.app

### Netlify (Mirror)
```bash
# Install Netlify CLI (one time)
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir .
```
**Live URL:** https://ayurdash.netlify.app

---

## 🗂 Google Drive — Patent & Assets Folder

> **For Patent Section 1.10** — Create the following folder structure in Google Drive and share publicly:

```
📁 AyurDash — Intelligent Ayurvedic Care & Training Platform/
├── 📁 Source Code/           ← All .js .html .css files
├── 📁 Screenshots/           ← 16 module screenshots
│   ├── 01_Login_Screen.png
│   ├── 02_Patient_Dinacharya_Dashboard.png
│   ├── 03_AI_Prescription_Scanner.png
│   ├── 04_Ritucharya_Weather.png
│   ├── 05_Abhyanga_Camera_Guide.png
│   ├── 06_Digital_Health_ID.png
│   ├── 07_AyurCare_AI_Chat.png
│   ├── 08_Doctor_Clinical_Hub.png
│   ├── 09_Vega_Bout_Monitor.png
│   ├── 10_Patient_Lookup.png
│   ├── 11_Netra_Tarpana_Simulator.png
│   ├── 12_Abhyanga_Pose_Auditor.png
│   ├── 13_Vega_Classifier.png
│   ├── 14_Viruddha_Checker.png
│   ├── 15_Medicines_Directory.png
│   └── 16_Smartwatch_Reminder_Hub.png
├── 📁 Demo Videos/
│   ├── AyurDash_Full_Demo.mp4
│   ├── Netra_Tarpana_Simulator_Demo.mp4
│   └── Smartwatch_Pairing_Demo.mp4
└── 📁 Patent Document/
    └── AyurDash_Patent_Specification.docx
```

---

## 📜 Patent

**Title:** AyurDash: An Intelligent Multi-Portal Web-Based Platform for Integrated Ayurvedic Care, Clinical Management, and Practitioner Training

**Type:** Utility Patent (Complete Specification)  
**Jurisdiction:** India (IPO) + WIPO PCT  
**Institution:** Vidyavardhaka College of Engineering, Mysuru

See full specification content in the previous planning session output.

---

## 👨‍💻 Inventor

| Name | Designation | Department | Institution |
|---|---|---|---|
| Uthkarsh Gowda V | *(your designation)* | *(your department)* | Vidyavardhaka College of Engineering, Mysuru |

**Contact:**  
Dean (R&D), Vidyavardhaka College of Engineering  
P.B. No. 206, Kannada Sahithya Parishath Rd, III Stage, Gokulam, Mysuru, Karnataka 570002  
https://vvce.ac.in/

---

## 📄 License

© 2025 Uthkarsh Gowda V — Vidyavardhaka College of Engineering, Mysuru.  
All rights reserved. Patent pending.
