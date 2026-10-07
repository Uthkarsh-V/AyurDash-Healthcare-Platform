# AyurDash — Migration Plan
## React + Renderbit Frontend · Node.js/Express Backend · PostgreSQL Database

---

## Top-Level Overview

**Goal:** Migrate the existing AyurDash vanilla HTML/JS/Firestore application into a modern three-tier architecture:

| Tier | Current | Target |
|---|---|---|
| Frontend rendering | Vanilla HTML + string-based DOM injection | React.js (component tree, hooks, context) |
| Canvas simulations | Raw HTML5 Canvas API | Renderbit (canvas/pixel rendering library) |
| Database | Cloud Firestore (NoSQL) | PostgreSQL via Knex.js ORM |
| Backend / API | None (direct Firebase SDK) | Node.js + Express REST API |
| Auth | Firebase Auth SDK | JWT tokens issued by the Express backend |

**Scope:**
- All 15 app modules converted to React components
- Renderbit replaces manual Canvas 2D drawing in: Netra Tarpana simulator, Abhyanga camera overlay, Abhyanga Pose Auditor canvas, and Smartwatch face
- All Firestore reads/writes replaced with `fetch()` calls to an Express REST API
- PostgreSQL schema covers all entities: users, patients, doctors, students, medicines, prescriptions, reminders, dinacharya_tasks, vega_bouts, chat_history, viruddha, ritucharya, dosha_readings

**Non-goals:**
- No change to Bluetooth BLE logic (Web Bluetooth API stays as-is)
- No change to WebRTC camera access logic
- No change to visual design (CSS stays as-is)
- No SSR — React runs as a client-side SPA served by Express static middleware

---

## New Project Structure

```
ayurveda/
├── client/                     ← React frontend (Vite)
│   ├── src/
│   │   ├── main.jsx            ← React entry point
│   │   ├── App.jsx             ← Root component, router, auth context
│   │   ├── api.js              ← Centralised fetch() API client
│   │   ├── context/
│   │   │   └── AuthContext.jsx ← JWT session + currentUser state
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx    ← Login/Signup/OTP screens
│   │   │   └── DashPage.jsx    ← Main app shell (sidebar + topbar + views)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Topbar.jsx
│   │   │   │   └── Modal.jsx
│   │   │   ├── patient/
│   │   │   │   ├── Dinacharya.jsx
│   │   │   │   ├── PrescriptionScanner.jsx
│   │   │   │   ├── Ritucharya.jsx
│   │   │   │   ├── AbhyangaGuide.jsx      ← Renderbit canvas overlay
│   │   │   │   ├── HealthId.jsx
│   │   │   │   └── AyurChat.jsx
│   │   │   ├── doctor/
│   │   │   │   ├── ClinicalHub.jsx
│   │   │   │   ├── VegaMonitor.jsx
│   │   │   │   └── PatientLookup.jsx
│   │   │   ├── student/
│   │   │   │   ├── NetraSimulator.jsx     ← Renderbit canvas simulation
│   │   │   │   ├── PoseAuditor.jsx        ← Renderbit canvas overlay
│   │   │   │   ├── VegaClassifier.jsx
│   │   │   │   └── ViruddhaChecker.jsx
│   │   │   └── shared/
│   │   │       ├── MedicinesDirectory.jsx
│   │   │       └── WatchHub.jsx           ← Renderbit watch face
│   │   └── renderbit/
│   │       ├── NetraRenderer.js           ← Renderbit scene for Netra
│   │       ├── AbhyangaRenderer.js        ← Renderbit overlay for Abhyanga
│   │       ├── PoseRenderer.js            ← Renderbit overlay for Pose Auditor
│   │       └── WatchFaceRenderer.js       ← Renderbit watch face scene
│   ├── index.html
│   └── vite.config.js
│
├── server/                     ← Node.js / Express backend
│   ├── index.js                ← Entry point, app bootstrap
│   ├── db.js                   ← Knex connection + migration runner
│   ├── migrations/             ← Knex SQL migration files
│   │   ├── 001_create_users.js
│   │   ├── 002_create_patients.js
│   │   ├── 003_create_doctors.js
│   │   ├── 004_create_medicines.js
│   │   ├── 005_create_prescriptions.js
│   │   ├── 006_create_reminders.js
│   │   ├── 007_create_dinacharya_tasks.js
│   │   ├── 008_create_vega_bouts.js
│   │   ├── 009_create_chat_history.js
│   │   └── 010_seed_static_data.js
│   ├── middleware/
│   │   └── auth.js             ← JWT verify middleware
│   └── routes/
│       ├── auth.routes.js
│       ├── patients.routes.js
│       ├── doctors.routes.js
│       ├── prescriptions.routes.js
│       ├── reminders.routes.js
│       ├── dinacharya.routes.js
│       ├── vegabouts.routes.js
│       ├── chat.routes.js
│       └── medicines.routes.js
│
├── package.json                ← Root workspace (server deps)
└── ayurdash-migration-plan.md
```

---

## Sub-Task 1 — PostgreSQL Schema & Knex Migrations

**Status:** [ ] pending

### Intent
Replace Firestore's schema-less collections with typed relational tables. Every Firestore collection maps 1:1 to a PostgreSQL table. Foreign keys enforce referential integrity. All timestamps use `TIMESTAMPTZ`.

### SQL Schema (all tables)

```sql
-- users (all roles share this table; role discriminates)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('patient','doctor','student')),
  display_name  TEXT,
  phone         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- patients (extends users 1:1)
CREATE TABLE patients (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  age             INT,
  gender          TEXT,
  dob             DATE,
  prakriti        TEXT,
  blood_group     TEXT,
  allergies       TEXT[],           -- PostgreSQL array
  mental_health   TEXT,
  dosha_vata      INT DEFAULT 33,
  dosha_pitta     INT DEFAULT 33,
  dosha_kapha     INT DEFAULT 34,
  privacy_allergies     BOOLEAN DEFAULT TRUE,
  privacy_treatments    BOOLEAN DEFAULT TRUE,
  privacy_mental_health BOOLEAN DEFAULT FALSE,
  privacy_lab_reports   BOOLEAN DEFAULT TRUE
);

-- doctors (extends users 1:1)
CREATE TABLE doctors (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialization  TEXT,
  experience      TEXT,
  reg_number      TEXT
);

-- students (extends users 1:1)
CREATE TABLE students (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  institution     TEXT,
  student_code    TEXT
);

-- medicines (seeded from database.js AyurDB.medicines)
CREATE TABLE medicines (
  id              TEXT PRIMARY KEY,  -- M001, M002 etc.
  name            TEXT NOT NULL,
  type            TEXT,
  sanskrit        TEXT,
  benefits        TEXT[],
  dosage          TEXT,
  contraindications TEXT[],
  dosha_action    TEXT
);

-- prescriptions
CREATE TABLE prescriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id       UUID REFERENCES users(id),
  patient_id      UUID REFERENCES users(id),
  medicine_id     TEXT REFERENCES medicines(id),
  medicine_name   TEXT,
  dosage          TEXT,
  routine         TEXT,
  notes           TEXT,
  active          BOOLEAN DEFAULT TRUE,
  prescribed_at   TIMESTAMPTZ DEFAULT now()
);

-- reminders (smartwatch module)
CREATE TABLE reminders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  label           TEXT NOT NULL,
  note            TEXT,
  time            TEXT NOT NULL,   -- HH:MM
  repeat          TEXT DEFAULT 'daily',
  priority        TEXT DEFAULT 'medium',
  alert_browser   BOOLEAN DEFAULT TRUE,
  alert_watch     BOOLEAN DEFAULT TRUE,
  alert_sound     BOOLEAN DEFAULT TRUE,
  status          TEXT DEFAULT 'pending',
  sent_to_watch   BOOLEAN DEFAULT FALSE,
  source          TEXT DEFAULT 'manual',
  med_id          TEXT REFERENCES medicines(id),
  taken_at        TEXT,
  snoozed_until   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- dinacharya_tasks (daily routine per user per date)
CREATE TABLE dinacharya_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  task_index      INT NOT NULL,
  task_text       TEXT,
  task_time       TEXT,
  done            BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, date, task_index)
);

-- vega_bouts (elimination therapy logging)
CREATE TABLE vega_bouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id       UUID REFERENCES users(id),
  patient_id      UUID REFERENCES users(id),
  therapy         TEXT,
  bout_time       TEXT,
  bout_number     INT,
  volume          TEXT,
  color           TEXT,
  consistency     TEXT,
  notes           TEXT,
  logged_at       TIMESTAMPTZ DEFAULT now()
);

-- chat_history
CREATE TABLE chat_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT CHECK (role IN ('user','bot')),
  message         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Expected Outcomes
- All migration files exist under `server/migrations/`
- `knex migrate:latest` runs cleanly from zero
- `010_seed_static_data.js` inserts all 7 medicines, 8 Viruddha entries, 6 Ritucharya seasons, and 2 demo patients from the current `database.js`
- `knex migrate:rollback` is clean

### Todo List
1. `npm init` root workspace; `cd server && npm install knex pg bcryptjs jsonwebtoken`
2. Create `server/db.js` — Knex client configured for PostgreSQL (connection via env vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`)
3. Write migration files `001` through `009` — one table per file
4. Write `010_seed_static_data.js` — seeds medicines, demo users (hashed passwords), demo patient profile
5. Test: `npx knex migrate:latest` then `npx knex migrate:rollback`

### Relevant Context
- Source data: [`database.js`](ayurveda/database.js) — `AyurDB.medicines`, `AyurDB.viruddha`, `AyurDB.ritucharya`, `AyurDB.patients`
- `TEXT[]` (PostgreSQL arrays) replace Firestore array fields like `allergies`, `benefits`, `contraindications`
- UUIDs replace Firestore auto-generated document IDs

---

## Sub-Task 2 — Node.js/Express REST API

**Status:** [ ] pending

### Intent
Build a thin REST API over the SQL schema. Every operation the frontend needs maps to a route. JWT middleware protects all non-auth routes.

### API Routes

```
POST   /api/auth/register         ← create user + role record
POST   /api/auth/login            ← email+password → JWT
GET    /api/auth/me               ← decode JWT → current user profile

GET    /api/patients/:id          ← patient profile + dosha
PUT    /api/patients/:id          ← update patient (dosha, prakriti, etc.)
PUT    /api/patients/:id/privacy  ← update privacy toggles
GET    /api/patients/:id/full     ← full record for doctor view (privacy-filtered)

GET    /api/doctors/:id/patients  ← list patients assigned to doctor

GET    /api/medicines             ← full medicine list
GET    /api/medicines/:id         ← single medicine detail

POST   /api/prescriptions         ← doctor creates prescription
GET    /api/prescriptions/patient/:patientId  ← all Rx for a patient
GET    /api/prescriptions/doctor/:doctorId    ← all Rx written by doctor

GET    /api/reminders/:userId     ← all reminders for user
POST   /api/reminders             ← add reminder
PATCH  /api/reminders/:id/status  ← update status (taken/snoozed/pending)
DELETE /api/reminders/:id         ← delete reminder

GET    /api/dinacharya/:userId/:date     ← tasks for a date
PUT    /api/dinacharya/:userId/:date/:taskIndex  ← toggle task done

POST   /api/vegabouts             ← log a new bout
GET    /api/vegabouts/:patientId  ← all bouts for a patient

GET    /api/chat/:userId          ← chat history (last 100)
POST   /api/chat                  ← save message
```

### Expected Outcomes
- `node server/index.js` starts on port 4000
- All routes return JSON with shape `{ success: true, data: ... }` or `{ success: false, error: "..." }`
- JWT auth middleware rejects requests without valid `Authorization: Bearer <token>` header
- All database operations go through Knex (no raw SQL strings in routes)
- CORS configured for `http://localhost:5173` (Vite dev server)

### Todo List
1. Install: `express cors jsonwebtoken bcryptjs dotenv`
2. Create `server/middleware/auth.js` — verify JWT, attach `req.user` with `{id, role}`
3. Create `server/routes/auth.routes.js` — register + login (bcrypt hash, JWT sign)
4. Create one route file per entity (patients, doctors, medicines, prescriptions, reminders, dinacharya, vegabouts, chat)
5. Each route file uses Knex queries — no Firestore imports
6. Wire all routes in `server/index.js` under `/api` prefix
7. Test with curl or Postman: register → login → get JWT → call protected route

### Relevant Context
- Current auth flow: [`auth.js`](ayurveda/auth.js) — `submitLogin`, `submitSignup`, `googleSignIn`
- Current Store methods: [`firestore.js`](ayurveda/firestore.js) — maps directly to the route list above
- Privacy filter: [`app.js`](ayurveda/app.js:884) `showFullRecord` — must apply in `GET /api/patients/:id/full` response

---

## Sub-Task 3 — React Frontend Scaffold + API Client

**Status:** [ ] pending

### Intent
Bootstrap the React SPA with Vite, set up the API client (`api.js`) that replaces all `FB.*` and `Store.*` calls, and create the root app shell with `AuthContext`.

### Expected Outcomes
- `cd client && npm run dev` starts the Vite dev server at `localhost:5173`
- `api.js` exports typed async functions matching every API route (e.g., `api.login()`, `api.getReminders()`, `api.addReminder()`)
- `AuthContext` holds `{ user, token, login, logout }` — token stored in `localStorage`
- `App.jsx` shows `<AuthPage>` when no token, `<DashPage>` when authenticated
- React Router `<Routes>` handles `/auth` and `/` (dashboard)

### Todo List
1. `npm create vite@latest client -- --template react` in `ayurveda/`
2. Install: `react-router-dom axios` (or native fetch wrapper)
3. Create `client/src/api.js` — exports `login`, `register`, `getProfile`, `getReminders`, `addReminder`, `deleteReminder`, `updateReminderStatus`, `getDinacharyaTasks`, `toggleDinacharyaTask`, `getPrescriptions`, `addPrescription`, `getVegaBouts`, `logVegaBout`, `getChatHistory`, `saveChat`, `getMedicines`, `getPatient`, `updatePrivacy`
4. Create `client/src/context/AuthContext.jsx` — wraps app, provides `useAuth()` hook
5. Create `client/src/App.jsx` — router with protected route logic
6. Copy `style.css` and `watch.css` into `client/src/`
7. Configure `vite.config.js` — proxy `/api` to `localhost:4000`

### Relevant Context
- All current `FB.*` calls in [`app.js`](ayurveda/app.js:20) become `api.*` calls
- All `Store.*` calls in [`watch.js`](ayurveda/watch.js:87) become `api.*` calls
- JWT token replaces `sessionStorage.getItem('ayurdash_role')` and `localStorage.getItem('ayurdash_session')`

---

## Sub-Task 4 — Convert Auth Flow to React

**Status:** [ ] pending

### Intent
Replace `auth.html` + `auth.js` (7 screens rendered via DOM toggle) with a React `<AuthPage>` component using `useState` to switch between screens. Connect to the Express `/api/auth/*` routes.

### Expected Outcomes
- `<AuthPage>` renders all 7 screens (role select, login, signup, OTP, forgot, google, success) using React state — no DOM `classList.toggle`
- Login calls `POST /api/auth/login`, stores JWT in `localStorage`, navigates to `/`
- Signup calls `POST /api/auth/register`, then shows success screen
- OTP screen simulates the demo code (same UX as before); real OTP via backend email when deployed
- Google sign-in stub maintained (can be wired to a Google OAuth backend route later)
- Password strength meter and show/hide toggle converted to controlled React inputs

### Todo List
1. Create `client/src/pages/AuthPage.jsx` — `useState('role')` drives which sub-screen renders
2. Convert each screen (`RoleSelect`, `LoginForm`, `SignupForm`, `OtpScreen`, `ForgotScreen`, `SuccessScreen`) to a small sub-component in the same file or in `components/auth/`
3. Wire `LoginForm` → `api.login()` → set token in `AuthContext`
4. Wire `SignupForm` → `api.register()` → show OTP screen
5. Remove `auth.html`, `auth.js`, `auth.css` from project root (they move into React)

### Relevant Context
- Original: [`auth.html`](ayurveda/auth.html), [`auth.js`](ayurveda/auth.js)
- All `FB.auth.*` calls replaced by `api.login()` / `api.register()`
- `Auth._completeAuth()` logic moves to `AuthContext.login()`

---

## Sub-Task 5 — Convert App Shell to React (Sidebar, Topbar, Navigation)

**Status:** [ ] pending

### Intent
Replace the `#mainApp` DOM structure and `App.navigate()` + `App.buildSidebar()` with a React layout shell where the active view is driven by `useState('dinacharya')`.

### Expected Outcomes
- `<DashPage>` renders `<Sidebar>`, `<Topbar>`, and the active view component
- `<Sidebar>` receives `portal` and `activeView` props; generates nav items from a config object (same structure as [`app.js:97`](ayurveda/app.js:97))
- `<Topbar>` shows weather chip, date, watch icon with badge
- View switching uses `setActiveView(id)` — no URL change needed (matches current SPA behaviour)
- Modal rendered via React portal (`ReactDOM.createPortal`)
- Toast notification uses `useState` + `useEffect` with auto-hide timeout

### Todo List
1. Create `client/src/pages/DashPage.jsx` — main shell with `activeView` state
2. Create `client/src/components/layout/Sidebar.jsx` — accepts `portal`, `activeView`, `onNavigate` props
3. Create `client/src/components/layout/Topbar.jsx` — weather chip, date, watch badge
4. Create `client/src/components/layout/Modal.jsx` — `ReactDOM.createPortal` to `#modal-root`
5. Create `client/src/components/layout/Toast.jsx` — `useState` + auto-dismiss

### Relevant Context
- Original navigation: [`app.js:165`](ayurveda/app.js:165) `navigate(viewId)`
- Nav config object: [`app.js:97`](ayurveda/app.js:97) — move to a `constants/navConfig.js`
- `App.showToast()` → `<Toast>` component via context or event emitter

---

## Sub-Task 6 — Convert All 15 Module Views to React Components

**Status:** [ ] pending

### Intent
Convert each of the 15 HTML `<section id="view-*">` blocks and their corresponding JS module methods into React components with `useState`, `useEffect`, and `api.*` calls.

### Component → JS Module Mapping

| React Component | From JS Module | Key State | API Calls |
|---|---|---|---|
| `Dinacharya.jsx` | `Patient.initDinacharya` | `tasks[]`, `dosha{}` | `GET /dinacharya`, `PUT /dinacharya/.../toggle` |
| `PrescriptionScanner.jsx` | `Patient.scanPrescription` | `file`, `parsedMeds[]`, `schedule[]` | none (local simulated parse) |
| `Ritucharya.jsx` | `Patient.initRitucharya` | `weather`, `seasonData` | none (local AyurDB data) |
| `AbhyangaGuide.jsx` | `Patient.startAbhyangaCam` | `camStream`, `stepIndex` | none (WebRTC + Renderbit) |
| `HealthId.jsx` | `Patient.initHealthId` | `patient`, `privacy{}` | `GET /patients/:id`, `PUT /patients/:id/privacy` |
| `AyurChat.jsx` | `Patient.sendChat` | `messages[]` | `GET /chat/:id`, `POST /chat` |
| `ClinicalHub.jsx` | `Doctor.initClinical` | `patients[]`, `rxForm{}` | `GET /doctors/:id/patients`, `POST /prescriptions` |
| `VegaMonitor.jsx` | `Doctor.initVegaMonitor` | `bouts[]`, `boutForm{}` | `GET /vegabouts/:pid`, `POST /vegabouts` |
| `PatientLookup.jsx` | `Doctor.initPatientLookup` | `query`, `results[]`, `record` | `GET /patients/:id/full` |
| `NetraSimulator.jsx` | `Student.initNetra` | `thickness`, `temp` | none (Renderbit + local data) |
| `PoseAuditor.jsx` | `Student.initPoseAudit` | `auditStream`, `metrics` | none (WebRTC + Renderbit) |
| `VegaClassifier.jsx` | `Student.classifyBout` | `form{}`, `result` | none (local algorithm) |
| `ViruddhaChecker.jsx` | `Student.initViruddha` | `query`, `results[]` | none (local AyurDB data) |
| `MedicinesDirectory.jsx` | `Shared.initMedicines` | `medicines[]`, `filter` | `GET /medicines` |
| `WatchHub.jsx` | `WatchReminder.*` | `reminders[]`, `connected` | `GET /reminders/:uid`, `POST /reminders`, `PATCH /reminders/:id/status`, `DELETE /reminders/:id` |

### Expected Outcomes
- Each component is self-contained with its own `useEffect` for data fetching
- No component reads from `AyurDB` directly — static data (Ritucharya, Viruddha) moved to `client/src/data/` constants files
- All Firestore calls replaced by `api.*` calls
- All DOM string-injection patterns (`innerHTML +=`) replaced with `.map()` returning JSX

### Todo List
1. Create `client/src/data/ayurdb.js` — export all static data (medicines, viruddha, ritucharya, chatKnowledge, vegaClassifier, netraTarpana, defaultDinacharya)
2. Create each component file in order of portal: patient (6), doctor (3), student (4), shared (2)
3. For each component: convert `initXxx()` logic to `useEffect(() => { fetchData(); }, [])`, convert state mutations to `useState` setters
4. For `WatchHub.jsx`: keep all BLE/notification/audio logic; replace only the 4 Firestore calls with `api.*`
5. For `AyurChat.jsx`: load history from `GET /api/chat/:uid` on mount; call `POST /api/chat` on each user message and bot response

### Relevant Context
- All module logic: [`app.js`](ayurveda/app.js), [`watch.js`](ayurveda/watch.js)
- Static data source: [`database.js`](ayurveda/database.js)

---

## Sub-Task 7 — Renderbit Integration (Canvas Simulations & Watch Face)

**Status:** [ ] pending

### Intent
Replace the four raw Canvas 2D drawing functions with Renderbit scenes. Renderbit provides a scene graph, sprite/shape primitives, and an animation loop — making the canvas drawing code declarative and controllable via props.

### Renderbit Modules to Build

**A — `NetraRenderer.js`** (replaces `Student._drawNetra()`)
- Scene: background rect, eye ellipse, iris circle, pupil circle, dough-wall ring (colour/width driven by `thickness` prop), six orbital risk nodes as coloured circles with labels
- `NetraRenderer.update({ thickness, temp })` re-renders the scene declaratively
- Used in: `<NetraSimulator>` — call `update()` whenever either slider changes

**B — `AbhyangaRenderer.js`** (replaces `Patient._drawAbhyangaOverlay()`)
- Scene: transparent overlay; one animated circle with HSL hue rotation on each frame tick
- `AbhyangaRenderer.start(canvas)` / `.stop()` — controls the animation loop
- Used in: `<AbhyangaGuide>` — start/stop with the camera

**C — `PoseRenderer.js`** (replaces `Student.startAuditCam` canvas overlay)
- Scene: overlay with body-region bounding boxes; colour-coded feedback zones
- `PoseRenderer.setFeedback(feedbackType)` updates overlay colours ('good'/'warn')
- Used in: `<PoseAuditor>` — update on simulated feedback cycle

**D — `WatchFaceRenderer.js`** (replaces the pure CSS watch face in HTML)
- Scene: watch face background, digital time text, next reminder label, pulse ring animation
- `WatchFaceRenderer.setTime(hh, mm)` and `.setNextReminder(label)` update the display
- `WatchFaceRenderer.playNotification()` triggers the notifying flash animation
- Used in: `<WatchHub>` — driven by `watchClockInterval` and reminder events

### Installation
```
cd client && npm install renderbit
```
> If Renderbit is not available on npm under that exact name, use `renderbit-canvas` or the package name confirmed from the Renderbit documentation. The integration pattern (scene, update props, animation loop) applies regardless.

### Expected Outcomes
- All four raw `ctx.*` drawing functions removed from React components
- Renderbit scenes are created once on `useRef` canvas mount, updated via `.update()` calls
- Animation loops managed via Renderbit's built-in loop, not `setInterval`
- Each renderer is a plain JS class (no React dependency) — testable in isolation

### Todo List
1. Install Renderbit: `npm install renderbit` in `client/`
2. Create `client/src/renderbit/NetraRenderer.js` — Renderbit scene matching current `_drawNetra()` output
3. Create `client/src/renderbit/AbhyangaRenderer.js` — animated overlay matching `_drawAbhyangaOverlay()`
4. Create `client/src/renderbit/PoseRenderer.js` — audit overlay matching `_simulateAuditFeedback()` visuals
5. Create `client/src/renderbit/WatchFaceRenderer.js` — watch face matching the CSS `watch-face` design
6. In each React component, use `useRef(canvasEl)` + `useEffect` to instantiate the renderer; pass state as props to `renderer.update()`
7. Call `renderer.destroy()` in the `useEffect` cleanup to prevent canvas memory leaks on unmount

### Relevant Context
- Original Netra drawing: [`app.js:969`](ayurveda/app.js:969) `_drawNetra()`
- Original Abhyanga overlay: [`app.js:549`](ayurveda/app.js:549) `_drawAbhyangaOverlay()`
- Original watch face: [`index.html:499`](ayurveda/index.html:499) `.watch-3d` CSS structure
- `AyurDB.netraTarpana` orbital node data → moves to `client/src/data/ayurdb.js`

---

## Sub-Task 8 — Wiring, Integration Testing & Cleanup

**Status:** [ ] pending

### Intent
Connect all three tiers, verify the full user flow end-to-end, remove all legacy files, and confirm no Firestore SDK is loaded anywhere.

### Expected Outcomes
- `npm run dev` (from root) starts both Vite (port 5173) and Express (port 4000) concurrently
- Full user journey works: Register → Login → Patient dashboard → Dinacharya tasks update in DB → Prescription scanner → AI chat history persists → Logout → Login again → history still there
- Doctor journey: Login → Create prescription → Patient's Dinacharya updates
- Watch journey: Add reminder → Visible in DB → Mark taken → Status updated in DB
- No `firebase`, `FB`, or `Store` references remain in any frontend file
- No `firestore.js`, `firebase.js` files in the final project
- `eslint` and `vite build` pass with no errors

### Todo List
1. Add `concurrently` to root `package.json`; add `dev` script: `concurrently "npm run server" "npm run client"`
2. Add `dotenv` to server; create `.env` with `DB_*` vars and `JWT_SECRET`
3. Run full registration + login flow; verify JWT round-trip
4. Run Dinacharya task toggle; verify row in `dinacharya_tasks` table flips `done`
5. Run reminder add/take/delete; verify rows in `reminders` table
6. Run Vega bout log (doctor); verify row in `vega_bouts` table
7. Run chat send; verify row in `chat_history` table
8. Delete: `ayurveda/firebase.js`, `ayurveda/firestore.js`, `ayurveda/auth.html`, `ayurveda/auth.js`, `ayurveda/app.js`, `ayurveda/watch.js`, `ayurveda/index.html`, `ayurveda/database.js` (all replaced by React + server)
9. Run `npm run build` in `client/`; serve `dist/` from Express static middleware — verify production build works

---

## Dependency Summary

### Server (`server/package.json`)
```json
{
  "dependencies": {
    "express": "^4.18",
    "knex": "^3.1",
    "pg": "^8.11",
    "bcryptjs": "^2.4",
    "jsonwebtoken": "^9.0",
    "cors": "^2.8",
    "dotenv": "^16.0"
  }
}
```

### Client (`client/package.json`)
```json
{
  "dependencies": {
    "react": "^18.2",
    "react-dom": "^18.2",
    "react-router-dom": "^6.21",
    "renderbit": "latest",
    "axios": "^1.6"
  },
  "devDependencies": {
    "vite": "^5.0",
    "@vitejs/plugin-react": "^4.2"
  }
}
```

---

## Architecture Diagram

```
Browser (React SPA — Vite)
│
│  AuthContext (JWT in localStorage)
│  App.jsx → AuthPage | DashPage
│              │
│         Sidebar + Topbar + Modal + Toast
│              │
│    ┌─────────┼──────────┐
│  Patient   Doctor    Student   Shared
│  Views     Views     Views     Views
│    │                   │         │
│    └──── Renderbit ────┘         │
│          (4 canvas scenes)       │
│                                  │
│  api.js (fetch → /api/*)         │
└──────────────────────────────────┘
             │  HTTP + JWT
    ┌────────▼──────────┐
    │  Express Server   │
    │  /api/* routes    │
    │  JWT middleware   │
    └────────┬──────────┘
             │  Knex ORM
    ┌────────▼──────────┐
    │   PostgreSQL DB   │
    │  10 tables        │
    │  (UUID PKs,       │
    │   relational FKs) │
    └───────────────────┘
```
