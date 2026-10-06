// ============================================================
//  AyurDash — Main Application Logic
//  app.js
// ============================================================

"use strict";

// ─────────────────────────────────────────────────────────────
//  APP CORE
// ─────────────────────────────────────────────────────────────
const App = {
  currentPortal: null,
  currentUser: null,
  currentView: null,
  sidebarOpen: false,

  // Boot from Firebase Auth session
  bootFromSession() {
    // Firebase Auth persists session automatically — onAuthStateChanged handles it
    FB.auth.onAuthStateChanged(async user => {
      if (!user) {
        // Only redirect to auth.html if the loginScreen is already hidden
        // (meaning user was mid-session and session expired).
        // If loginScreen is still visible the user hasn't picked a portal yet —
        // demo buttons will call App.login() directly, no redirect needed.
        const loginScreen = document.getElementById('loginScreen');
        const isShowingLogin = loginScreen && !loginScreen.classList.contains('hidden');
        if (!isShowingLogin) {
          window.location.replace('auth.html');
        }
        return;
      }
      // Load profile from Firestore
      try {
        const profile = await FB.getDoc('users', user.uid);
        const role = profile?.role
          || sessionStorage.getItem('ayurdash_role')
          || 'patient';
        this.login(role, user.uid, profile || {});
      } catch(_) {
        const role = sessionStorage.getItem('ayurdash_role') || 'patient';
        this.login(role, user.uid, {});
      }
    });
  },

  login(portal, userId, profile) {
    this.currentPortal = portal;

    // Build currentUser from Firestore profile + fallback to demo data
    const name = profile?.displayName || profile?.name
      || (portal === 'patient' ? 'Arjun Sharma' : portal === 'doctor' ? 'Dr. Meera Nair' : 'Aditya Rao');

    if (portal === 'patient') {
      const base = AyurDB.patients[0];
      this.currentUser = { ...base, ...profile, id: userId || base.id, name };
    } else if (portal === 'doctor') {
      const base = AyurDB.doctors[0];
      this.currentUser = { ...base, ...profile, id: userId || base.id, name };
    } else {
      this.currentUser = { name, role: 'student', id: userId || 'S001', ...profile };
    }

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');

    this.buildSidebar();
    this.buildUserChip();
    this.startTopbar();

    // Seed Firestore medicines on first load
    if (typeof Store !== 'undefined') Store.seedMedicines().catch(() => {});

    const defaultViews = { patient: 'dinacharya', doctor: 'clinical', student: 'netra' };
    this.navigate(defaultViews[portal]);
  },

  async logout() {
    try {
      await FB.auth.signOut();
      localStorage.removeItem('ayurdash_session');
      sessionStorage.removeItem('ayurdash_role');
      sessionStorage.removeItem('ayurdash_userid');
    } catch(_) {}
    if (Patient.breathInterval) clearInterval(Patient.breathInterval);
    if (Patient.camStream) Patient.stopAbhyangaCam();
    if (Student.auditStream) Student.stopAuditCam();
    if (typeof WatchReminder !== 'undefined') {
      clearInterval(WatchReminder.watchClockInterval);
      clearInterval(WatchReminder.tickInterval);
    }
    window.location.replace('auth.html');
  },

  buildSidebar() {
    const nav = document.getElementById('sidebarNav');
    const navConfig = {
      patient: [
        { section: 'Personal Health', items: [
          { id: 'dinacharya',  icon: '🌅', label: 'Daily Dashboard (Dinacharya)' },
          { id: 'scanner',     icon: '📋', label: 'AI Prescription Scanner' },
          { id: 'ritucharya',  icon: '🌦', label: 'Ritucharya Weather' },
          { id: 'abhyanga',    icon: '💆', label: 'Abhyanga Camera Guide' },
          { id: 'healthid',    icon: '🪪', label: 'Health ID & Privacy' },
          { id: 'chat',        icon: '💬', label: 'AyurCare AI Chat' },
        ]},
        { section: 'Reference', items: [
          { id: 'medicines',   icon: '💊', label: 'Medicines Directory' },
        ]},
        { section: 'Smart Devices', items: [
          { id: 'watch',       icon: '⌚', label: 'Smartwatch Reminders' },
        ]}
      ],
      doctor: [
        { section: 'Clinical', items: [
          { id: 'clinical',      icon: '🏥', label: 'Clinical Hub & Rx Designer' },
          { id: 'vegamonitor',   icon: '📊', label: 'Vega Bout Monitor' },
          { id: 'patientlookup', icon: '🔍', label: 'Patient Lookup' },
        ]},
        { section: 'Reference', items: [
          { id: 'medicines',     icon: '💊', label: 'Medicines Directory' },
        ]},
        { section: 'Smart Devices', items: [
          { id: 'watch',         icon: '⌚', label: 'Smartwatch Reminders' },
        ]}
      ],
      student: [
        { section: 'Training Lab', items: [
          { id: 'netra',      icon: '👁', label: 'Netra Tarpana Simulator' },
          { id: 'poseaudit',  icon: '🧪', label: 'Abhyanga Pose Auditor' },
          { id: 'vegaclass',  icon: '🧬', label: 'Vega Bout Classifier' },
          { id: 'viruddha',   icon: '⚠️', label: 'Viruddha Checker' },
        ]},
        { section: 'Reference', items: [
          { id: 'medicines',  icon: '💊', label: 'Medicines Directory' },
        ]}
      ]
    };

    nav.innerHTML = '';
    (navConfig[this.currentPortal] || []).forEach(section => {
      const sec = document.createElement('div');
      sec.className = 'nav-section';
      sec.innerHTML = `<div class="nav-section-label">${section.section}</div>`;
      section.items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'nav-item';
        btn.dataset.view = item.id;
        btn.innerHTML = `<span class="nav-icon">${item.icon}</span>${item.label}`;
        btn.onclick = () => this.navigate(item.id);
        sec.appendChild(btn);
      });
      nav.appendChild(sec);
    });
  },

  buildUserChip() {
    const chip = document.getElementById('userChip');
    const name = this.currentPortal === 'student' ? 'Aditya Rao' : this.currentUser.name;
    const role = this.currentPortal === 'patient' ? 'Patient' :
                 this.currentPortal === 'doctor'  ? 'Physician' : 'Student';
    chip.innerHTML = `<div class="uc-name">${name}</div><div class="uc-role">${role}</div>`;
  },

  navigate(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.view === viewId);
    });

    const titles = {
      dinacharya: '🌅 Daily Dashboard',
      scanner: '📋 AI Prescription Scanner',
      ritucharya: '🌦 Ritucharya & Weather',
      abhyanga: '💆 Abhyanga Guide',
      healthid: '🪪 Health ID & Privacy',
      chat: '💬 AyurCare AI Chat',
      clinical: '🏥 Clinical Hub',
      vegamonitor: '📊 Vega Bout Monitor',
      patientlookup: '🔍 Patient Lookup',
      netra: '👁 Netra Tarpana Simulator',
      poseaudit: '🧪 Pose-Estimation Auditor',
      vegaclass: '🧬 Vega Bout Classifier',
      viruddha: '⚠️ Viruddha Checker',
      medicines: '💊 Medicines Directory',
      watch: '⌚ Smartwatch Reminder Hub'
    };
    document.getElementById('topbarTitle').textContent = titles[viewId] || 'AyurDash';
    this.currentView = viewId;

    if (window.innerWidth < 768) this.closeSidebar();

    // Lazy-init views
    const initMap = {
      dinacharya:    () => Patient.initDinacharya(),
      scanner:       () => Patient.initScanner(),
      ritucharya:    () => Patient.initRitucharya(),
      abhyanga:      () => Patient.initAbhyangaGuide(),
      healthid:      () => Patient.initHealthId(),
      chat:          () => Patient.initChat(),
      clinical:      () => Doctor.initClinical(),
      vegamonitor:   () => Doctor.initVegaMonitor(),
      patientlookup: () => Doctor.initPatientLookup(),
      netra:         () => Student.initNetra(),
      poseaudit:     () => Student.initPoseAudit(),
      vegaclass:     () => Student.initVegaClass(),
      viruddha:      () => Student.initViruddha(),
      medicines:     () => Shared.initMedicines(),
      watch:         () => WatchReminder.initView()
    };
    if (initMap[viewId]) initMap[viewId]();
  },

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    document.getElementById('sidebar').classList.toggle('open', this.sidebarOpen);
  },
  closeSidebar() {
    this.sidebarOpen = false;
    document.getElementById('sidebar').classList.remove('open');
  },

  startTopbar() {
    const update = () => {
      const now = new Date();
      document.getElementById('topbarDate').textContent =
        now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    };
    update();
    setInterval(update, 60000);
    this.updateWeatherChip();
  },

  updateWeatherChip(w) {
    const chip = document.getElementById('weatherChip');
    const weathers = ['☀️ 32°C Sunny', '🌧️ 26°C Rainy', '❄️ 18°C Cold', '🌫️ 29°C Humid', '🌤 28°C Partly Cloudy'];
    if (w) {
      const map = { sunny: '☀️ 34°C Hot', rain: '🌧️ 25°C Heavy Rain', cold: '❄️ 16°C Cold Snap', humid: '🌫️ 30°C Humid' };
      chip.textContent = map[w] || weathers[0];
    } else {
      chip.textContent = weathers[Math.floor(Math.random() * weathers.length)];
    }
  },

  showToast(msg, type = 'info') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = `toast type-${type}`;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3500);
  },

  openModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modal').classList.remove('hidden');
  },
  closeModal() {
    document.getElementById('modal').classList.add('hidden');
  }
};

// ─────────────────────────────────────────────────────────────
//  PATIENT MODULE
// ─────────────────────────────────────────────────────────────
const Patient = {
  breathInterval: null,
  breathPhase: 'inhale',
  breathActive: false,
  camStream: null,
  currentWeather: 'sunny',

  // ── DINACHARYA ────────────────────────────────────────────
  initDinacharya() {
    const p = AyurDB.patients[0];

    // Dosha bars
    const bars = document.getElementById('doshaBars');
    bars.innerHTML = '';
    const doshas = [
      { name: 'Vata', val: p.currentDosha.vata, cls: 'vata-fill', color: 'var(--teal)' },
      { name: 'Pitta', val: p.currentDosha.pitta, cls: 'pitta-fill', color: 'var(--saffron)' },
      { name: 'Kapha', val: p.currentDosha.kapha, cls: 'kapha-fill', color: 'var(--green)' }
    ];
    doshas.forEach(d => {
      bars.innerHTML += `
        <div class="dosha-bar-row">
          <span class="dosha-label">${d.name}</span>
          <div class="dosha-track"><div class="dosha-fill ${d.cls}" style="width:${d.val}%"></div></div>
          <span class="dosha-val" style="color:${d.color}">${d.val}%</span>
        </div>`;
    });

    // Summary stats
    const done = p.dinacharya.filter(t => t.done).length;
    const total = p.dinacharya.length;
    const meds = p.currentMedications.length;
    document.getElementById('summaryStats').innerHTML = `
      <div class="stat-row"><span class="stat-label">Routine Progress</span><span class="stat-val">${done}/${total} tasks</span></div>
      <div class="stat-row"><span class="stat-label">Current Medications</span><span class="stat-val">${meds}</span></div>
      <div class="stat-row"><span class="stat-label">Prakriti</span><span class="stat-val">${p.prakriti}</span></div>
      <div class="stat-row"><span class="stat-label">Dominant Dosha</span><span class="stat-val text-teal">Vata</span></div>
      <div class="stat-row"><span class="stat-label">Allergies Noted</span><span class="stat-val">${p.allergies.length}</span></div>
    `;

    // Dinacharya tasks
    const list = document.getElementById('dinacharyaList');
    list.innerHTML = '';
    p.dinacharya.forEach((task, i) => {
      const item = document.createElement('div');
      item.className = `din-item ${task.done ? 'done' : ''}`;
      item.id = `din-${i}`;
      item.innerHTML = `
        <span class="din-time">${task.time}</span>
        <span class="din-task">${task.task}</span>
        <div class="din-check ${task.done ? 'checked' : ''}" onclick="Patient.toggleTask(${i})">${task.done ? '✓' : ''}</div>
      `;
      list.appendChild(item);
    });
  },

  toggleTask(i) {
    const p = AyurDB.patients[0];
    p.dinacharya[i].done = !p.dinacharya[i].done;
    const item = document.getElementById(`din-${i}`);
    const check = item.querySelector('.din-check');
    if (p.dinacharya[i].done) {
      item.classList.add('done');
      item.querySelector('.din-task').style.textDecoration = 'line-through';
      check.classList.add('checked');
      check.textContent = '✓';
    } else {
      item.classList.remove('done');
      item.querySelector('.din-task').style.textDecoration = '';
      check.classList.remove('checked');
      check.textContent = '';
    }
    App.showToast(p.dinacharya[i].done ? '✅ Task completed!' : '↩ Task marked incomplete');
  },

  toggleBreathing() {
    if (this.breathActive) {
      this.breathActive = false;
      clearInterval(this.breathInterval);
      document.getElementById('breathCircle').className = 'breath-circle';
      document.getElementById('breathText').textContent = 'Tap to start guided breathing';
      document.querySelector('.breathing-guide .btn').textContent = '▶ Start Pranayama';
    } else {
      this.breathActive = true;
      document.querySelector('.breathing-guide .btn').textContent = '⏹ Stop';
      this._runBreathCycle();
    }
  },

  _runBreathCycle() {
    if (!this.breathActive) return;
    const circle = document.getElementById('breathCircle');
    const text = document.getElementById('breathText');
    const phases = [
      { phase: 'inhale', label: '🌬 Inhale... (4 sec)', cls: 'inhale', dur: 4000 },
      { phase: 'hold',   label: '🤲 Hold... (4 sec)',   cls: '', dur: 4000 },
      { phase: 'exhale', label: '💨 Exhale... (6 sec)', cls: 'exhale', dur: 6000 }
    ];
    let idx = 0;
    const next = () => {
      if (!this.breathActive) return;
      const p = phases[idx % phases.length];
      circle.className = 'breath-circle ' + p.cls;
      circle.textContent = ['🌬','🤲','💨'][idx % 3];
      text.textContent = p.label;
      idx++;
      this.breathInterval = setTimeout(next, p.dur);
    };
    next();
  },

  // ── PRESCRIPTION SCANNER ──────────────────────────────────
  initScanner() {
    // Reset scanner view to initial state when navigating to it
    const preview = document.getElementById('scanPreview');
    const parsed  = document.getElementById('parsedMeds');
    const sched   = document.getElementById('scheduleResult');
    if (preview) { preview.innerHTML = ''; preview.classList.add('hidden'); }
    if (parsed)  { parsed.innerHTML = '<p class="muted">Upload a prescription to auto-parse medications and schedule them.</p>'; }
    if (sched)   { sched.classList.add('hidden'); }
    // Reset file input so re-upload works
    const fi = document.getElementById('prescriptionFile');
    if (fi) fi.value = '';
  },

  handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      this._processPrescriptionFile(file);
    }
  },

  scanPrescription(e) {
    const file = e.target.files[0];
    if (file) this._processPrescriptionFile(file);
  },

  _processPrescriptionFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('scanPreview');
      preview.innerHTML = `<img src="${e.target.result}" alt="Prescription" /><p class="muted mt-8">🔍 AI scanning your prescription...</p>`;
      preview.classList.remove('hidden');

      // Simulate AI parsing with delay
      setTimeout(() => this._showParsedMeds(), 1800);
    };
    reader.readAsDataURL(file);
  },

  _showParsedMeds() {
    const meds = [
      { name: 'Ashwagandha Churna', dose: '5g with warm milk at bedtime', icon: '🌿' },
      { name: 'Triphala Churna', dose: '3g with warm water before sleep', icon: '🌿' },
      { name: 'Brahmi Taila', dose: 'Apply 5ml warm oil to scalp nightly', icon: '💧' }
    ];
    const container = document.getElementById('parsedMeds');
    container.innerHTML = '<p class="muted mb-12">✅ 3 medications detected:</p>';
    meds.forEach(m => {
      container.innerHTML += `
        <div class="parsed-med-item">
          <span class="parsed-med-icon">${m.icon}</span>
          <div>
            <div class="parsed-med-name">${m.name}</div>
            <div class="parsed-med-dose">${m.dose}</div>
          </div>
        </div>`;
    });

    const sched = document.getElementById('scheduleResult');
    const list = document.getElementById('scheduleList');
    list.innerHTML = `
      <div class="din-item"><span class="din-time">08:00</span><span class="din-task">Ashwagandha Churna 5g with warm milk</span></div>
      <div class="din-item"><span class="din-time">21:00</span><span class="din-task">Triphala Churna 3g with warm water</span></div>
      <div class="din-item"><span class="din-time">21:30</span><span class="din-task">Brahmi Taila scalp massage</span></div>
    `;
    sched.classList.remove('hidden');
    App.showToast('✅ Prescription parsed successfully!');
  },

  saveSchedule() {
    App.showToast('📅 Schedule added to your Dinacharya!');
    document.getElementById('scheduleResult').classList.add('hidden');
  },

  // ── RITUCHARYA / WEATHER ──────────────────────────────────
  initRitucharya() {
    this.setWeather('sunny');
  },

  setWeather(type) {
    this.currentWeather = type;
    App.updateWeatherChip(type);

    const configs = {
      sunny: { icon: '☀️', temp: '34°C', desc: 'Hot & Sunny — Pitta Season Active', season: 'Grishma' },
      rain:  { icon: '🌧️', temp: '25°C', desc: 'Heavy Monsoon Rain — Vata Aggravation Alert', season: 'Varsha' },
      cold:  { icon: '❄️', temp: '16°C', desc: 'Cold Snap — Vata & Kapha Season', season: 'Shishira' },
      humid: { icon: '🌫️', temp: '30°C', desc: 'Humid & Muggy — Kapha Alert', season: 'Varsha' }
    };
    const cfg = configs[type];
    const season = AyurDB.ritucharya[cfg.season];

    document.getElementById('weatherDisplay').innerHTML = `
      <span class="weather-display-icon">${cfg.icon}</span>
      <div class="weather-temp">${cfg.temp}</div>
      <div class="weather-desc">${cfg.desc}</div>
    `;

    document.getElementById('seasonCard').innerHTML = `
      <h3>${season.season_icon} ${season.name}</h3>
      <span class="season-badge">${season.months}</span>
      <p class="muted mt-8">Dominant Dosha: <strong>${season.dominant_dosha}</strong></p>
      <p class="muted mt-8">Digestive Fire (Agni): <em>${season.agni}</em></p>
      <p class="mt-8"><strong>Recommended Herbs:</strong> ${season.herbs.join(', ')}</p>
    `;

    const recEl = document.getElementById('ritDietRec');
    recEl.innerHTML = '';
    [...season.diet.recommended, ...season.lifestyle.recommended].forEach(item => {
      recEl.innerHTML += `<span class="tag">${item}</span>`;
    });

    const avoidEl = document.getElementById('ritDietAvoid');
    avoidEl.innerHTML = '';
    [...season.diet.avoid, ...season.lifestyle.avoid].forEach(item => {
      avoidEl.innerHTML += `<span class="tag">${item}</span>`;
    });
  },

  // ── ABHYANGA CAMERA ───────────────────────────────────────
  initAbhyangaGuide() {
    const steps = [
      { title: 'Crown (Murdha)', desc: 'Circular strokes from crown outward — 10 rotations each direction', body: 'Head' },
      { title: 'Face', desc: 'Upward strokes on cheeks, outward on forehead', body: 'Head' },
      { title: 'Neck & Shoulders', desc: 'Downward strokes on neck, circular on shoulders', body: 'Upper' },
      { title: 'Arms', desc: 'Long strokes toward heart, circular on joints (elbows/wrists)', body: 'Arms' },
      { title: 'Chest & Abdomen', desc: 'Circular clockwise strokes on abdomen, gentle on chest', body: 'Core' },
      { title: 'Back', desc: 'Upward long strokes from sacrum to neck', body: 'Back' },
      { title: 'Legs', desc: 'Long strokes toward heart, circular on knees and ankles', body: 'Legs' },
      { title: 'Feet (Padabhyanga)', desc: 'Circular on soles, between toes, Marma point stimulation', body: 'Feet' }
    ];
    const guide = document.getElementById('strokeGuide');
    guide.innerHTML = '';
    steps.forEach((s, i) => {
      guide.innerHTML += `
        <div class="stroke-step ${i === 0 ? 'active' : ''}">
          <span class="stroke-num">${i + 1}</span>
          <div class="stroke-info">
            <div class="stroke-title">${s.title}</div>
            <div class="stroke-desc">${s.desc}</div>
          </div>
        </div>`;
    });

    // Rotate active step every 8 seconds — clear any previous timer first
    clearInterval(this._strokeTimer);
    let stepIdx = 0;
    this._strokeTimer = setInterval(() => {
      document.querySelectorAll('.stroke-step').forEach((el, i) => {
        el.classList.toggle('active', i === stepIdx % steps.length);
      });
      stepIdx++;
    }, 8000);
  },

  async startAbhyangaCam() {
    try {
      this.camStream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.getElementById('abhyangaVideo');
      video.srcObject = this.camStream;
      document.getElementById('camOverlayInfo').textContent = '📷 Camera active — follow the stroke guide';
      this._drawAbhyangaOverlay();
      App.showToast('📷 Camera started!');
    } catch (e) {
      App.showToast('⚠️ Camera permission denied or unavailable', 'warn');
      document.getElementById('camOverlayInfo').textContent = '⚠️ Camera unavailable — use the guide manually';
    }
  },

  _drawAbhyangaOverlay() {
    const canvas = document.getElementById('abhyangaCanvas');
    const ctx = canvas.getContext('2d');
    let hue = 0;
    this._overlayFrame = setInterval(() => {
      if (!this.camStream) { clearInterval(this._overlayFrame); return; }
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.7)`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      hue = (hue + 2) % 360;
    }, 80);
  },

  stopAbhyangaCam() {
    if (this.camStream) {
      this.camStream.getTracks().forEach(t => t.stop());
      this.camStream = null;
      document.getElementById('abhyangaVideo').srcObject = null;
      document.getElementById('camOverlayInfo').textContent = 'Camera stopped';
    }
    clearInterval(this._overlayFrame);
    clearInterval(this._strokeTimer);
  },

  // ── HEALTH ID & PRIVACY ───────────────────────────────────
  initHealthId() {
    const p = AyurDB.patients[0];
    document.getElementById('healthIdCard').innerHTML = `
      <h3 style="color:rgba(255,255,255,0.8)">🌿 Digital Health ID</h3>
      <div class="hid-name">${p.name}</div>
      <div class="hid-id">ID: ${p.id} &nbsp;•&nbsp; ${p.bloodGroup}</div>
      <div class="hid-row">
        <div class="hid-field"><span class="hid-field-label">Age</span><span class="hid-field-val">${p.age}</span></div>
        <div class="hid-field"><span class="hid-field-label">Gender</span><span class="hid-field-val">${p.gender}</span></div>
        <div class="hid-field"><span class="hid-field-label">DOB</span><span class="hid-field-val">${p.dob}</span></div>
      </div>
      <div class="hid-row">
        <div class="hid-field"><span class="hid-field-label">Phone</span><span class="hid-field-val">${p.phone}</span></div>
        <div class="hid-field"><span class="hid-field-label">Email</span><span class="hid-field-val">${p.email}</span></div>
      </div>
      <span class="hid-prakriti-badge">🌿 Prakriti: ${p.prakriti}</span>
      <div class="hid-qr">
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          ${this._qrSvg()}
        </svg>
      </div>
    `;

    const privacyMap = [
      { key: 'shareAllergies', label: 'Share Allergies', desc: 'Doctor can see allergy list' },
      { key: 'shareTreatments', label: 'Share Treatment History', desc: 'Doctor can view past treatments' },
      { key: 'shareMentalHealth', label: 'Share Mental Health Notes', desc: 'Sensitive — off by default' },
      { key: 'shareLabReports', label: 'Share Lab Reports', desc: 'Doctor can access lab results' }
    ];
    const ctrl = document.getElementById('privacyControls');
    ctrl.innerHTML = '';
    privacyMap.forEach(pr => {
      ctrl.innerHTML += `
        <div class="privacy-item">
          <div class="privacy-item-info">
            <span class="privacy-item-label">${pr.label}</span>
            <span class="privacy-item-desc">${pr.desc}</span>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="priv-${pr.key}" ${p.privacy[pr.key] ? 'checked' : ''} />
            <span class="toggle-slider"></span>
          </label>
        </div>`;
    });
  },

  _qrSvg() {
    // Simple decorative QR-like pattern
    let rects = '';
    const pattern = [1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,1];
    pattern.forEach((v, i) => {
      if (v) {
        const x = (i % 6) * 9 + 3;
        const y = Math.floor(i / 6) * 9 + 3;
        rects += `<rect x="${x}" y="${y}" width="7" height="7" fill="#1e1e1e" />`;
      }
    });
    return rects;
  },

  savePrivacy() {
    const p = AyurDB.patients[0];
    ['shareAllergies','shareTreatments','shareMentalHealth','shareLabReports'].forEach(k => {
      const el = document.getElementById(`priv-${k}`);
      if (el) p.privacy[k] = el.checked;
    });
    App.showToast('🛡 Privacy settings saved by AI Clinical Guardian');
  },

  // ── AI CHAT ───────────────────────────────────────────────
  initChat() { /* Chat is pre-initialized in HTML */ },

  sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    input.value = '';
    this._appendChat(msg, 'user');
    this._appendTyping();
    setTimeout(() => {
      this._removeTyping();
      const response = this._matchKnowledge(msg);
      this._appendChat(response, 'bot');
    }, 1200);
  },

  escalateEmergency() {
    this._appendChat('🚨 EMERGENCY — I need immediate help!', 'user');
    this._appendTyping();
    setTimeout(() => {
      this._removeTyping();
      this._appendChat('🚨 Emergency escalated to Dr. Meera Nair. She has been notified immediately. Please also call 108 (India emergency) if this is life-threatening. Stay calm — help is on the way. Is anyone with you right now?', 'bot');
    }, 800);
  },

  _matchKnowledge(msg) {
    const lower = msg.toLowerCase();
    for (const entry of AyurDB.chatKnowledge) {
      if (entry.keywords.some(k => lower.includes(k))) return entry.response;
    }
    return "Namaste! I understand your concern. For personalized advice, please consult with Dr. Meera Nair through the Clinical Hub. I can help with general Ayurvedic diet queries, medication reminders, and wellness tips. Could you describe your concern in more detail?";
  },

  _appendChat(msg, role) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    div.innerHTML = `
      <span class="chat-avatar">${role === 'bot' ? '🌿' : '🧘'}</span>
      <div class="chat-bubble">${msg}</div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  _appendTyping() {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'typingIndicator';
    div.innerHTML = `
      <span class="chat-avatar">🌿</span>
      <div class="chat-bubble"><div class="typing-dots"><span></span><span></span><span></span></div></div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  _removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }
};

// ─────────────────────────────────────────────────────────────
//  DOCTOR MODULE
// ─────────────────────────────────────────────────────────────
const Doctor = {
  vegaBouts: [],

  // ── CLINICAL HUB ─────────────────────────────────────────
  initClinical() {
    const doc = AyurDB.doctors[0];

    // Patient list
    const list = document.getElementById('doctorPatientList');
    list.innerHTML = '';
    doc.patients.forEach(pid => {
      const p = AyurDB.patients.find(x => x.id === pid);
      if (!p) return;
      list.innerHTML += `
        <div class="patient-item" onclick="Doctor.showPatientInModal('${p.id}')">
          <div class="patient-avatar">${p.name[0]}</div>
          <div class="patient-info">
            <div class="p-name">${p.name}</div>
            <div class="p-meta">${p.age} • ${p.prakriti} • ${p.currentMedications.length} medications</div>
          </div>
        </div>`;
    });

    // Populate selects
    const rxPat = document.getElementById('rxPatient');
    rxPat.innerHTML = '<option value="">-- Select --</option>';
    AyurDB.patients.forEach(p => rxPat.innerHTML += `<option value="${p.id}">${p.name}</option>`);

    const rxMed = document.getElementById('rxMedicine');
    rxMed.innerHTML = '<option value="">-- Select Medicine --</option>';
    AyurDB.medicines.forEach(m => rxMed.innerHTML += `<option value="${m.id}">${m.name} (${m.type})</option>`);
  },

  showPatientInModal(pid) {
    const p = AyurDB.patients.find(x => x.id === pid);
    if (!p) return;
    App.openModal(`
      <h3 style="font-size:1.1rem;color:var(--teal);margin-bottom:14px">🩺 ${p.name}</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div><strong>Age:</strong> ${p.age}</div>
        <div><strong>Prakriti:</strong> ${p.prakriti}</div>
        <div><strong>Blood Group:</strong> ${p.bloodGroup}</div>
        <div><strong>Phone:</strong> ${p.phone}</div>
      </div>
      <p><strong>Allergies:</strong> ${p.privacy.shareAllergies ? p.allergies.join(', ') : '<em>Hidden by patient</em>'}</p>
      <p class="mt-8"><strong>Current Meds:</strong></p>
      <ul style="margin:6px 0 12px 18px;font-size:0.875rem">${p.currentMedications.map(m => `<li>${m}</li>`).join('')}</ul>
      <p><strong>Mental Health:</strong> ${p.privacy.shareMentalHealth ? p.mentalHealthNotes : '<em>Hidden by patient privacy settings</em>'}</p>
    `);
  },

  addPrescription() {
    const pid = document.getElementById('rxPatient').value;
    const mid = document.getElementById('rxMedicine').value;
    const dose = document.getElementById('rxDosage').value;
    const routine = document.getElementById('rxRoutine').value;
    if (!pid || !mid || !dose) { App.showToast('⚠️ Please fill all fields', 'warn'); return; }

    const p = AyurDB.patients.find(x => x.id === pid);
    const m = AyurDB.medicines.find(x => x.id === mid);
    if (!p || !m) return;

    p.currentMedications.push(`${m.name} — ${dose}`);
    const sched = { time: routine === 'morning' ? '07:00' : '21:00', task: `${m.name} — ${dose}`, done: false };
    p.dinacharya.push(sched);

    const success = document.getElementById('rxSuccess');
    success.textContent = `✅ ${m.name} prescribed to ${p.name} — added to their Dinacharya`;
    success.classList.remove('hidden');
    App.showToast(`✅ Prescription sent to ${p.name}`);
    setTimeout(() => success.classList.add('hidden'), 4000);
  },

  // ── VEGA BOUT MONITOR ─────────────────────────────────────
  initVegaMonitor() {
    this.vegaBouts = [...(AyurDB.vegaBouts[0]?.bouts || [])];
    const sel = document.getElementById('vegaPatient');
    sel.innerHTML = '<option value="">-- Select Patient --</option>';
    AyurDB.patients.forEach(p => sel.innerHTML += `<option value="${p.id}">${p.name}</option>`);
    sel.value = 'P001';
    this.loadVegaLedger();
  },

  loadVegaLedger() {
    const pid = document.getElementById('vegaPatient').value;
    const ledger = document.getElementById('vegaLedger');
    if (!pid) { ledger.innerHTML = '<p class="muted">Select a patient to view bouts.</p>'; return; }
    const data = AyurDB.vegaBouts.find(v => v.patientId === pid);
    if (!data) { ledger.innerHTML = '<p class="muted">No elimination therapy recorded for this patient.</p>'; return; }

    ledger.innerHTML = `
      <div style="margin-bottom:10px;font-size:0.85rem">
        <strong>Therapy:</strong> ${data.therapy} &nbsp;|&nbsp;
        <strong>Date:</strong> ${data.startDate} &nbsp;|&nbsp;
        <span style="color:var(--green);font-weight:700">${data.outcome}</span>
      </div>
      <div style="display:grid;grid-template-columns:60px 40px 80px 100px 1fr;gap:8px;font-size:0.75rem;font-weight:700;color:var(--text-muted);padding:4px 12px">
        <span>Time</span><span>#</span><span>Volume</span><span>Color</span><span>Notes</span>
      </div>
    `;
    [...data.bouts, ...this.vegaBouts.filter(b => b._new)].forEach(bout => {
      const colorMap = { 'yellow-green': '#a3b18a', 'dark-green': '#2d6a4f', 'yellow': '#f4d03f', 'clear': '#cde', watery: '#cde', brown: '#8b5e3c' };
      const dot = colorMap[bout.color] || '#aaa';
      ledger.innerHTML += `
        <div class="bout-row">
          <span>${bout.time}</span>
          <div class="bout-num">${bout.number}</div>
          <span>${bout.volume}</span>
          <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:50%;background:${dot};display:inline-block"></span>${bout.color}</span>
          <span>${bout.notes}</span>
        </div>`;
    });
    ledger.innerHTML += `<div class="mt-8 muted" style="font-size:0.8rem">Doctor Notes: ${data.doctorNotes}</div>`;
  },

  logBout() {
    const pid = document.getElementById('vegaPatient').value;
    if (!pid) { App.showToast('⚠️ Select a patient first', 'warn'); return; }
    const bout = {
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      number: this.vegaBouts.length + 1 + (AyurDB.vegaBouts[0]?.bouts.length || 0),
      volume: document.getElementById('boutVolume').value,
      color: document.getElementById('boutColor').value,
      consistency: document.getElementById('boutConsistency').value,
      notes: document.getElementById('boutNotes').value || 'No notes',
      _new: true
    };
    this.vegaBouts.push(bout);
    this.loadVegaLedger();

    // Auto-classify
    const total = (AyurDB.vegaBouts[0]?.bouts.length || 0) + this.vegaBouts.filter(b => b._new).length;
    const outEl = document.getElementById('boutOutcome');
    let outcome = '';
    if (total >= 5 && total <= 10) outcome = `<div class="alert-success">✅ Samyak Virechana — ${total} bouts — Proper elimination achieved!</div>`;
    else if (total < 5) outcome = `<div class="alert-warning">⚠️ Heena Virechana — Only ${total} bouts — Incomplete. Monitor closely.</div>`;
    else outcome = `<div class="alert-danger">🚨 Ati Virechana — ${total} bouts — Excessive! Stop therapy immediately.</div>`;
    outEl.innerHTML = outcome;
    App.showToast(`Bout #${bout.number} logged at ${bout.time}`);
  },

  // ── PATIENT LOOKUP ────────────────────────────────────────
  initPatientLookup() {
    this.searchPatients();
  },

  searchPatients() {
    const q = document.getElementById('patientSearch').value.toLowerCase();
    const res = document.getElementById('patientSearchResults');
    const filtered = AyurDB.patients.filter(p =>
      p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    );
    res.innerHTML = '';
    filtered.forEach(p => {
      res.innerHTML += `
        <div class="patient-item" onclick="Doctor.showFullRecord('${p.id}')">
          <div class="patient-avatar">${p.name[0]}</div>
          <div class="patient-info">
            <div class="p-name">${p.name} <span style="font-size:0.75rem;color:var(--text-muted)">(${p.id})</span></div>
            <div class="p-meta">${p.age} yrs • ${p.gender} • ${p.prakriti}</div>
          </div>
        </div>`;
    });
    if (!filtered.length) res.innerHTML = '<p class="muted">No patients found.</p>';
  },

  showFullRecord(pid) {
    const p = AyurDB.patients.find(x => x.id === pid);
    if (!p) return;
    const rec = document.getElementById('patientRecord');
    rec.classList.remove('hidden');

    const history = p.privacy.shareTreatments
      ? p.treatmentHistory.map(t => `<tr><td>${t.date}</td><td>${t.treatment}</td><td>${t.doctor}</td><td>${t.notes}</td></tr>`).join('')
      : '<tr><td colspan="4" class="muted"><em>Hidden by patient privacy settings</em></td></tr>';

    const labs = p.privacy.shareLabReports
      ? p.labReports.map(l => `<tr><td>${l.date}</td><td>${l.test}</td><td>${l.result}</td></tr>`).join('')
      : '<tr><td colspan="3" class="muted"><em>Hidden by patient privacy settings</em></td></tr>';

    rec.innerHTML = `
      <div class="patient-record-card">
        <h3>📋 Full Record: ${p.name}</h3>
        <div class="record-tabs">
          <button class="record-tab active" onclick="Doctor._switchTab(event, 'rt-overview')">Overview</button>
          <button class="record-tab" onclick="Doctor._switchTab(event, 'rt-meds')">Medications</button>
          <button class="record-tab" onclick="Doctor._switchTab(event, 'rt-history')">Treatment History</button>
          <button class="record-tab" onclick="Doctor._switchTab(event, 'rt-labs')">Lab Reports</button>
        </div>
        <div id="rt-overview" class="record-panel active">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:0.875rem">
            <div><strong>Age:</strong> ${p.age}</div>
            <div><strong>Gender:</strong> ${p.gender}</div>
            <div><strong>Blood Group:</strong> ${p.bloodGroup}</div>
            <div><strong>Prakriti:</strong> ${p.prakriti}</div>
            <div><strong>Phone:</strong> ${p.phone}</div>
            <div><strong>Email:</strong> ${p.email}</div>
          </div>
          <p class="mt-12"><strong>Allergies:</strong> ${p.privacy.shareAllergies ? p.allergies.join(', ') : '<em>Hidden</em>'}</p>
          <p class="mt-8"><strong>Mental Health Notes:</strong> ${p.privacy.shareMentalHealth ? p.mentalHealthNotes : '<em>Hidden</em>'}</p>
        </div>
        <div id="rt-meds" class="record-panel">
          <ul style="margin:0 0 0 16px;font-size:0.875rem;line-height:2">${p.currentMedications.map(m => `<li>${m}</li>`).join('')}</ul>
        </div>
        <div id="rt-history" class="record-panel">
          <table style="width:100%;font-size:0.85rem;border-collapse:collapse">
            <tr style="background:var(--teal);color:white"><th style="padding:8px">Date</th><th>Treatment</th><th>Doctor</th><th>Notes</th></tr>
            ${history}
          </table>
        </div>
        <div id="rt-labs" class="record-panel">
          <table style="width:100%;font-size:0.85rem;border-collapse:collapse">
            <tr style="background:var(--teal);color:white"><th style="padding:8px">Date</th><th>Test</th><th>Result</th></tr>
            ${labs}
          </table>
        </div>
      </div>`;
  },

  _switchTab(e, tabId) {
    document.querySelectorAll('.record-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.record-panel').forEach(p => p.classList.remove('active'));
    e.target.classList.add('active');
    const el = document.getElementById(tabId);
    if (el) el.classList.add('active');
  }
};

// ─────────────────────────────────────────────────────────────
//  STUDENT MODULE
// ─────────────────────────────────────────────────────────────
const Student = {
  auditStream: null,
  strokeStart: null,
  strokeInterval: null,
  strokeRunning: false,

  // ── NETRA TARPANA ─────────────────────────────────────────
  initNetra() {
    this._drawNetra();
    this._buildNodeRiskTable();
    this._buildNetraChecklist();
  },

  updateNetra() {
    document.getElementById('doughThickVal').textContent = document.getElementById('doughThick').value;
    document.getElementById('oilTempVal').textContent = document.getElementById('oilTemp').value;
    this._drawNetra();
    this._assessNetra();
  },

  _drawNetra() {
    const canvas = document.getElementById('netraCanvas');
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#f8f4ef';
    ctx.fillRect(0, 0, W, H);

    const thick = parseFloat(document.getElementById('doughThick')?.value || 2.5);

    // Eye outline — simple ellipse
    ctx.strokeStyle = '#8b5e3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, 120, 70, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Iris
    ctx.fillStyle = '#4a90d9';
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 35, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 18, 0, Math.PI * 2);
    ctx.fill();

    // Dough wall ring — color based on thickness
    const doughColor = thick >= 2 && thick <= 4 ? 'rgba(210,180,140,0.7)' : 'rgba(220,53,69,0.5)';
    ctx.strokeStyle = doughColor;
    ctx.lineWidth = thick * 6;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(W / 2, H / 2, 130, 78, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Orbital nodes
    AyurDB.netraTarpana.orbitalNodes.forEach(node => {
      const nx = (node.x / 100) * W;
      const ny = (node.y / 100) * H;
      const riskColor = { High: '#dc3545', Medium: '#f59e0b', Low: '#2d6a4f' }[node.leakRisk];
      ctx.fillStyle = riskColor;
      ctx.beginPath();
      ctx.arc(nx, ny, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.id, nx, ny + 3);
    });

    // Label
    ctx.fillStyle = '#444';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Dough wall thickness: ' + thick + ' cm', 10, 20);
  },

  _assessNetra() {
    const thick = parseFloat(document.getElementById('doughThick').value);
    const temp = parseFloat(document.getElementById('oilTemp').value);
    const fb = document.getElementById('netraFeedback');
    const ideal = AyurDB.netraTarpana.doughThickness;
    const tempIdeal = AyurDB.netraTarpana.oilTemp;

    if (thick < ideal.min) {
      fb.className = 'netra-feedback danger';
      fb.textContent = `⚠️ Dough wall too thin (${thick}cm)! Minimum is ${ideal.min}cm. High leakage risk.`;
    } else if (thick > ideal.max) {
      fb.className = 'netra-feedback caution';
      fb.textContent = `⚡ Dough wall too thick (${thick}cm). May restrict vision. Ideal: ${ideal.ideal}cm.`;
    } else if (temp < tempIdeal.min || temp > tempIdeal.max) {
      fb.className = 'netra-feedback danger';
      fb.textContent = `🌡 Oil temperature ${temp}°C is outside safe range (${tempIdeal.min}–${tempIdeal.max}°C). Risk of burning!`;
    } else {
      fb.className = 'netra-feedback safe';
      fb.textContent = `✅ Excellent! Dough wall ${thick}cm at ${temp}°C — within safe parameters. Proceed with therapy.`;
    }
  },

  _buildNodeRiskTable() {
    const table = document.createElement('table');
    table.className = 'node-risk-table';
    table.innerHTML = `<tr><th>Node</th><th>Location</th><th>Leakage Risk</th></tr>`;
    AyurDB.netraTarpana.orbitalNodes.forEach(n => {
      const cls = { High: 'risk-high', Medium: 'risk-medium', Low: 'risk-low' }[n.leakRisk];
      table.innerHTML += `<tr><td><strong>${n.id}</strong></td><td>${n.label}</td><td><span class="risk-badge ${cls}">${n.leakRisk}</span></td></tr>`;
    });
    document.getElementById('nodeRiskTable').innerHTML = '';
    document.getElementById('nodeRiskTable').appendChild(table);
  },

  _buildNetraChecklist() {
    const items = [
      'Prepare Ksheera (medicated milk) at 37°C',
      'Mix flour dough to correct consistency',
      'Position patient supine, eyes closed',
      'Build dough ring — min 2cm thickness',
      'Check for gaps at medial & lateral canthi',
      'Slowly pour warm ghee/oil into ring',
      'Maintain oil level for prescribed duration',
      'Ask patient to blink gently every 30 sec',
      'Remove dough carefully after therapy',
      'Apply Triphala eye wash post-procedure'
    ];
    const checklist = document.getElementById('netraChecklist');
    checklist.innerHTML = '';
    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'check-item';
      div.innerHTML = `<input type="checkbox" onchange="this.parentElement.classList.toggle('checked', this.checked)" />${item}`;
      checklist.appendChild(div);
    });
  },

  // ── POSE AUDITOR ──────────────────────────────────────────
  initPoseAudit() {
    // Clear any running audit timer from a previous visit
    clearInterval(this._auditTimer);
    // Stop camera if still running from previous visit
    if (this.auditStream) {
      this.auditStream.getTracks().forEach(t => t.stop());
      this.auditStream = null;
      const v = document.getElementById('auditVideo');
      if (v) v.srcObject = null;
    }
    this._buildAuditMetrics();
  },

  _buildAuditMetrics() {
    const metrics = [
      { val: '72', label: 'Strokes/min' },
      { val: '✓', label: 'Sync L/R' },
      { val: '89%', label: 'Coverage' },
      { val: '4.2s', label: 'Avg Stroke' }
    ];
    const el = document.getElementById('auditMetrics');
    el.innerHTML = '';
    metrics.forEach(m => {
      el.innerHTML += `<div class="audit-metric"><div class="audit-metric-val">${m.val}</div><div class="audit-metric-label">${m.label}</div></div>`;
    });
    const fb = document.getElementById('auditFeedback');
    fb.className = 'audit-feedback good';
    fb.textContent = '✅ Stroke rhythm is within therapeutic range (60–80 strokes/min). Good bilateral synchronization. Increase pressure slightly on lower limbs.';
  },

  async startAuditCam() {
    try {
      this.auditStream = await navigator.mediaDevices.getUserMedia({ video: true });
      document.getElementById('auditVideo').srcObject = this.auditStream;
      this._simulateAuditFeedback();
      App.showToast('📷 Audit feed started — analyzing posture...');
    } catch (e) {
      App.showToast('⚠️ Camera unavailable. Using simulated feed.', 'warn');
      this._simulateAuditFeedback();
    }
  },

  stopAuditCam() {
    if (this.auditStream) {
      this.auditStream.getTracks().forEach(t => t.stop());
      this.auditStream = null;
      document.getElementById('auditVideo').srcObject = null;
    }
    clearInterval(this._auditTimer);
  },

  _simulateAuditFeedback() {
    // Clear existing timer before starting a new one
    clearInterval(this._auditTimer);
    const feedbacks = [
      { cls: 'good', text: '✅ Excellent posture. Spine neutral, arms parallel. Stroke speed optimal.' },
      { cls: 'good', text: '✅ Good bilateral synchronization. Coverage complete.' },
      { cls: 'warn', text: '⚡ Right hand pressure slightly lower than left. Equalize for balance.' },
      { cls: 'warn', text: '⚡ Stroke speed increased to 95/min. Slow down to 70–80 for therapeutic effect.' },
      { cls: 'good', text: '✅ Back area covered correctly. Transition to lower limbs now.' }
    ];
    let i = 0;
    this._auditTimer = setInterval(() => {
      const f = feedbacks[i % feedbacks.length];
      const fb = document.getElementById('auditFeedback');
      fb.className = `audit-feedback ${f.cls}`;
      fb.textContent = f.text;
      i++;
    }, 4000);
  },

  startStrokeTimer() {
    if (this.strokeRunning) return;
    this.strokeRunning = true;
    this.strokeStart = Date.now();
    this.strokeInterval = setInterval(() => {
      const elapsed = ((Date.now() - this.strokeStart) / 1000).toFixed(1);
      document.getElementById('strokeTimer').textContent = elapsed + 's';
    }, 100);
  },

  stopStrokeTimer() {
    if (!this.strokeRunning) return;
    clearInterval(this.strokeInterval);
    this.strokeRunning = false;
    const elapsed = ((Date.now() - this.strokeStart) / 1000).toFixed(1);
    const fb = document.getElementById('strokeFeedback');
    if (elapsed < 3) fb.innerHTML = '<div class="alert-danger">⚡ Too fast! Ideal stroke is 3–6 seconds long.</div>';
    else if (elapsed <= 6) fb.innerHTML = '<div class="alert-success">✅ Perfect stroke duration!</div>';
    else fb.innerHTML = '<div class="alert-warning">⚠️ Slightly slow. Ideal is 3–6 seconds.</div>';
  },

  resetStrokeTimer() {
    clearInterval(this.strokeInterval);
    this.strokeRunning = false;
    document.getElementById('strokeTimer').textContent = '0.0s';
    document.getElementById('strokeFeedback').innerHTML = '';
  },

  // ── VEGA CLASSIFIER ───────────────────────────────────────
  initVegaClass() {
    const guide = document.getElementById('classGuide');
    const { samyakVirechana, hinnaVirechana, atiVirechana } = AyurDB.vegaClassifier;
    guide.innerHTML = `
      <div class="class-guide-card green">
        <h5>✅ Samyak (Proper)</h5>
        <p>Bouts: ${samyakVirechana.criteria.bouts}</p>
        <p>Color: ${samyakVirechana.criteria.color}</p>
        <p class="mt-4">${samyakVirechana.action}</p>
      </div>
      <div class="class-guide-card yellow">
        <h5>⚠️ Heena (Insufficient)</h5>
        <p>Bouts: ${hinnaVirechana.criteria.bouts}</p>
        <p>Color: ${hinnaVirechana.criteria.color}</p>
        <p class="mt-4">${hinnaVirechana.action}</p>
      </div>
      <div class="class-guide-card red">
        <h5>🚨 Ati (Excessive)</h5>
        <p>Bouts: ${atiVirechana.criteria.bouts}</p>
        <p>Color: ${atiVirechana.criteria.color}</p>
        <p class="mt-4">${atiVirechana.action}</p>
      </div>`;
  },

  classifyBout() {
    const bouts = parseInt(document.getElementById('classBouts').value);
    const volume = document.getElementById('classVolume').value;
    const color = document.getElementById('classColor').value;
    const feeling = document.getElementById('classFeeling').value;
    const therapy = document.getElementById('classTherapy').value;

    if (!bouts || isNaN(bouts)) { App.showToast('⚠️ Enter number of bouts', 'warn'); return; }

    let type, details;
    if ((color === 'blood' || color === 'dark') || bouts > 15 || volume === 'large') {
      type = 'ati'; details = AyurDB.vegaClassifier.atiVirechana;
    } else if (bouts < 5 || volume === 'small' || feeling === 'weak') {
      type = 'heena'; details = AyurDB.vegaClassifier.hinnaVirechana;
    } else {
      type = 'samyak'; details = AyurDB.vegaClassifier.samyakVirechana;
    }

    const icons = { samyak: '✅', heena: '⚠️', ati: '🚨' };
    const labels = { samyak: 'Samyak (Proper) Virechana', heena: 'Heena (Insufficient) Virechana', ati: 'Ati (Excessive) Virechana' };
    const el = document.getElementById('classResult');
    el.className = `class-result ${type}`;
    el.innerHTML = `
      <div class="class-label">${icons[type]} ${labels[type]}</div>
      <p><strong>Therapy:</strong> ${therapy}</p>
      <p><strong>Total Bouts:</strong> ${bouts} &nbsp;|&nbsp; <strong>Volume:</strong> ${volume} &nbsp;|&nbsp; <strong>Color:</strong> ${color}</p>
      <p class="mt-8"><strong>Outcome:</strong> ${details.outcome}</p>
      <div class="mt-8 ${type === 'ati' ? 'alert-danger' : type === 'heena' ? 'alert-warning' : 'alert-success'}">${details.action}</div>
    `;
  },

  // ── VIRUDDHA CHECKER ──────────────────────────────────────
  initViruddha() {
    this._renderViruddha(AyurDB.viruddha, 'viruddhaAll');
  },

  searchViruddha() {
    const q = document.getElementById('viruddhaSearch').value.toLowerCase();
    const filtered = q
      ? AyurDB.viruddha.filter(v =>
          v.items.some(i => i.toLowerCase().includes(q)) ||
          v.combination.toLowerCase().includes(q))
      : [];
    this._renderViruddha(filtered, 'viruddhaResults');
    document.getElementById('viruddhaResults').style.display = q ? 'flex' : 'none';
  },

  _renderViruddha(list, containerId) {
    const el = document.getElementById(containerId);
    if (!list.length) { el.innerHTML = '<p class="muted">No matching combinations found.</p>'; return; }
    el.innerHTML = '';
    list.forEach(v => {
      const sev = v.severity.toLowerCase();
      el.innerHTML += `
        <div class="viruddha-card">
          <div class="viruddha-card-header ${sev}">
            <span class="viruddha-combo">⚠️ ${v.combination}</span>
            <span class="viruddha-severity">${v.severity}</span>
          </div>
          <div class="viruddha-card-body">
            <div class="viruddha-section"><strong>Category:</strong> ${v.category}</div>
            <div class="viruddha-section"><strong>Mechanism:</strong> ${v.mechanism}</div>
            <div class="viruddha-section"><strong>Symptoms:</strong> ${v.symptoms.join(', ')}</div>
            <div class="viruddha-section"><strong>Remedy:</strong> ${v.remedy}</div>
            <div class="viruddha-ref">📖 ${v.ancient_ref}</div>
          </div>
        </div>`;
    });
  }
};

// ─────────────────────────────────────────────────────────────
//  SHARED MODULE
// ─────────────────────────────────────────────────────────────
const Shared = {
  initMedicines() {
    this.filterMedicines();
  },

  filterMedicines() {
    const q = (document.getElementById('medSearch')?.value || '').toLowerCase();
    const grid = document.getElementById('medicineGrid');
    const filtered = AyurDB.medicines.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q) ||
      m.benefits.some(b => b.toLowerCase().includes(q))
    );
    grid.innerHTML = '';
    filtered.forEach(m => {
      const avgRating = m.reviews.length
        ? (m.reviews.reduce((s, r) => s + r.rating, 0) / m.reviews.length).toFixed(1)
        : 'N/A';
      const stars = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
      grid.innerHTML += `
        <div class="medicine-card" onclick="Shared.showMedicineModal('${m.id}')">
          <span class="med-type-badge">${m.type}</span>
          <div class="med-name">${m.name}</div>
          <div class="med-sanskrit"><em>${m.sanskrit}</em></div>
          <div class="med-benefits">
            ${m.benefits.slice(0, 3).map(b => `<div class="med-benefit-item">${b}</div>`).join('')}
          </div>
          <div class="med-dosage">💊 ${m.dosage}</div>
          <div class="med-stars">${stars} <span style="font-size:0.75rem;color:var(--text-muted)">(${avgRating})</span></div>
        </div>`;
    });
    if (!filtered.length) grid.innerHTML = '<p class="muted">No medicines found.</p>';
  },

  showMedicineModal(mid) {
    const m = AyurDB.medicines.find(x => x.id === mid);
    if (!m) return;
    const reviews = m.reviews.map(r =>
      `<div style="padding:10px;border-bottom:1px solid var(--border)">
        <div style="display:flex;justify-content:space-between">
          <strong>${r.user}</strong>
          <span style="color:var(--saffron)">${'★'.repeat(r.rating)}</span>
        </div>
        <p style="font-size:0.85rem;color:var(--text-muted)">${r.text}</p>
       </div>`
    ).join('');
    App.openModal(`
      <h3 style="color:var(--teal);margin-bottom:4px">${m.name}</h3>
      <span style="font-size:0.8rem;color:var(--saffron);font-weight:700">${m.type}</span>
      <p style="font-style:italic;color:var(--text-muted);font-size:0.85rem;margin-bottom:14px">${m.sanskrit}</p>
      <p><strong>Benefits:</strong></p>
      <ul style="margin:6px 0 12px 16px;font-size:0.875rem">${m.benefits.map(b => `<li>${b}</li>`).join('')}</ul>
      <p><strong>Dosage:</strong> ${m.dosage}</p>
      <p class="mt-8"><strong>Dosha Effect:</strong> ${m.dosha}</p>
      <p class="mt-8"><strong>Contraindications:</strong> ${m.contraindications.join(', ')}</p>
      <h4 style="margin:16px 0 8px">Patient Reviews</h4>
      <div style="border:1px solid var(--border);border-radius:8px;overflow:hidden">${reviews}</div>
    `);
  }
};

// ─────────────────────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌿 AyurDash loaded');
  App.bootFromSession();
});
