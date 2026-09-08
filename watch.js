// ============================================================
//  AyurDash — Smartwatch Reminder Engine  v2.0
//  watch.js
//
//  BROWSER SUPPORT STRATEGY:
//   Chrome (desktop/Android) with flag enabled → Real Web Bluetooth
//   Chrome with Bluetooth disabled / Firefox / Safari / Edge → 
//     Auto-silently falls back to full simulation — NO errors shown
//
//  FEATURES:
//   • Auto browser detection — never shows raw API errors to user
//   • Real Web Bluetooth BLE pairing where available
//   • Full simulation mode (identical UX) everywhere else
//   • Doctor prescription → one-tap reminder import
//   • 1-minute tick poller for timed reminders
//   • Browser Notification API (with graceful permission handling)
//   • Web Audio API chimes (with silent fallback)
//   • Live watch face clock
//   • Compliance tracking + 7-day streak
//   • Snooze (10 min) + Mark Taken + Delete actions
//   • Watch notification preview panel with payload display
// ============================================================

"use strict";

const WatchReminder = {

  // ── STATE ─────────────────────────────────────────────────
  device: null,
  gattServer: null,
  characteristic: null,
  connected: false,
  simulated: false,
  bluetoothSupported: false,

  reminders: [],
  activeFilter: 'all',
  tickInterval: null,
  watchClockInterval: null,
  audioCtx: null,

  BLE_SERVICE: '0000180d-0000-1000-8000-00805f9b34fb',
  BLE_CHAR:    '00002a37-0000-1000-8000-00805f9b34fb',

  // ── INIT ──────────────────────────────────────────────────
  initView() {
    this._detectBluetooth();
    this._populateMedSelect();
    this._populateRxImport();
    this._startWatchClock();
    this._checkNotifPermission();
    this._startTickPoller();

    if (this.reminders.length === 0) this._loadDefaultReminders();

    this._refreshTimeline();
    this._refreshStats();
    this._buildStreakRow();
    this._previewNextOnLoad();
  },

  // Detect Bluetooth support silently — no errors thrown
  _detectBluetooth() {
    const hasBT = typeof navigator.bluetooth !== 'undefined';
    this.bluetoothSupported = hasBT;

    const pairBtn = document.getElementById('btnPairWatch');
    const btSupport = document.getElementById('btSupportNote');

    if (!hasBT) {
      // Auto-update UI to show simulation-first approach
      if (pairBtn) {
        pairBtn.textContent = '🔌 Connect Watch (Simulated)';
        pairBtn.onclick = () => WatchReminder.simulatePair();
      }
      if (btSupport) {
        btSupport.innerHTML = `
          <div class="bt-support-banner warn">
            <span>⚠️</span>
            <div>
              <strong>Bluetooth not available in this browser.</strong><br/>
              <span>Using full simulation mode — all reminder features work perfectly. For real watch pairing, use <strong>Chrome browser on Android or Windows</strong>.</span>
            </div>
          </div>`;
      }
    } else {
      if (btSupport) {
        btSupport.innerHTML = `
          <div class="bt-support-banner success">
            <span>✅</span>
            <div><strong>Web Bluetooth supported!</strong> You can pair a real WearOS, Samsung Galaxy Watch, or any BLE smartwatch.</div>
          </div>`;
      }
    }
  },

  // ── DEFAULT REMINDERS ─────────────────────────────────────
  _loadDefaultReminders() {
    this.reminders = [
      { id: this._uid(), label: 'Ashwagandha Churna', note: '5g with warm milk', time: '08:00', repeat: 'daily', priority: 'high',   alertBrowser: true, alertWatch: true, alertSound: true,  status: 'pending', sentToWatch: false, source: 'prescription' },
      { id: this._uid(), label: 'Triphala Churna',    note: '3g with warm water before sleep', time: '21:00', repeat: 'daily', priority: 'high',   alertBrowser: true, alertWatch: true, alertSound: true,  status: 'pending', sentToWatch: false, source: 'prescription' },
      { id: this._uid(), label: 'Brahmi Taila',       note: 'Apply 5ml warm oil to scalp', time: '21:30', repeat: 'daily', priority: 'medium', alertBrowser: true, alertWatch: true, alertSound: false, status: 'pending', sentToWatch: false, source: 'prescription' },
      { id: this._uid(), label: 'Morning Yoga',       note: 'Pranayama 15 min', time: '06:30', repeat: 'daily', priority: 'low',    alertBrowser: true, alertWatch: true, alertSound: false, status: 'pending', sentToWatch: false, source: 'lifestyle' },
      { id: this._uid(), label: 'Lunch Reminder',     note: 'Light Pitta-pacifying meal', time: '12:30', repeat: 'daily', priority: 'low',    alertBrowser: false, alertWatch: true, alertSound: false, status: 'pending', sentToWatch: false, source: 'lifestyle' },
    ];
    this._scheduleAllReminders();
  },

  // ── BLUETOOTH PAIRING ─────────────────────────────────────
  async pairDevice() {
    // Check support first — silently fall back, never throw at user
    if (!this.bluetoothSupported) {
      this.simulatePair();
      return;
    }

    // Try real Bluetooth — catch ALL errors and fall back gracefully
    this._setWatchStatus('scanning');
    this._pairLog('🔍 Scanning for Bluetooth devices...', 'info');

    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.BLE_SERVICE]
      });

      this._pairLog(`📡 Found: <strong>${this.device.name || 'Smartwatch'}</strong>`, 'success');
      this._pairLog('🔗 Connecting...', 'info');

      this.gattServer = await this.device.gatt.connect();
      this._pairLog('✅ GATT server connected!', 'success');

      try {
        const svc = await this.gattServer.getPrimaryService(this.BLE_SERVICE);
        this.characteristic = await svc.getCharacteristic(this.BLE_CHAR);
        this._pairLog('✅ Reminder channel ready!', 'success');
      } catch (_) {
        this._pairLog('ℹ️ Using notification-only mode (no custom GATT service on device).', 'info');
      }

      this.connected = true;
      this.simulated = false;
      this._setWatchStatus('connected', this.device.name || 'Smartwatch');
      this._onConnected();

      this.device.addEventListener('gattserverdisconnected', () => {
        this._pairLog('🔌 Watch disconnected.', 'warn');
        this.connected = false;
        this._setWatchStatus('disconnected');
      });

    } catch (err) {
      // User cancelled picker, Bluetooth disabled, permission denied, etc.
      // Never show raw error — just fall back to simulation silently
      const isUserCancel = err.message && (
        err.message.includes('cancelled') ||
        err.message.includes('User cancelled') ||
        err.message.includes('chooser'))
      ;
      if (isUserCancel) {
        this._pairLog('ℹ️ Device picker closed. Click "Connect Watch (Simulated)" to demo.', 'info');
        this._setWatchStatus('disconnected');
      } else {
        // Bluetooth disabled globally, no hardware, permission error, etc.
        this._pairLog('ℹ️ Real Bluetooth unavailable — switching to full simulation mode.', 'info');
        this.simulatePair();
      }
    }
  },

  simulatePair() {
    this._setWatchStatus('scanning');
    this._clearPairLog();
    this._pairLog('🔍 Scanning for nearby smartwatch...', 'info');

    setTimeout(() => this._pairLog('📡 Found: <strong>AyurWatch Pro</strong> (Simulated)', 'success'), 500);
    setTimeout(() => this._pairLog('🔗 Establishing secure BLE connection...', 'info'), 1100);
    setTimeout(() => this._pairLog('🔐 Authenticating device...', 'info'), 1700);
    setTimeout(() => {
      this._pairLog('✅ Connected to AyurWatch Pro!', 'success');
      this._pairLog('📲 Reminder channel open — vibration & alerts ready.', 'success');
      this.connected = true;
      this.simulated = true;
      this._setWatchStatus('connected', 'AyurWatch Pro');
      this._onConnected();
    }, 2400);
  },

  _onConnected() {
    const face = document.getElementById('watch3d');
    const watchFace = document.getElementById('watchFace');
    if (face) face.classList.add('connected');
    if (watchFace) watchFace.classList.add('active');

    // Sync all reminders to watch
    let delay = 0;
    this.reminders.forEach(rem => {
      if (!rem.sentToWatch) {
        setTimeout(() => {
          rem.sentToWatch = true;
          this._animateWatchNotification(rem);
        }, delay);
        delay += 250;
      }
    });

    setTimeout(() => {
      this._refreshStats();
      this._refreshTimeline();
      App.showToast('⌚ Watch connected! All reminders synced.');
    }, delay + 100);
  },

  _setWatchStatus(state, name) {
    const dot  = document.getElementById('watchStatusDot');
    const text = document.getElementById('watchStatusText');
    if (!dot || !text) return;
    const map = {
      scanning:     { cls: 'scanning',     label: '🔍 Scanning for devices...' },
      connected:    { cls: 'connected',    label: `✅ Connected — ${name || 'Watch'}` },
      disconnected: { cls: 'disconnected', label: '🔌 Not connected' },
      failed:       { cls: 'failed',       label: '❌ Connection failed' }
    };
    const s = map[state] || { cls: '', label: 'Not connected' };
    dot.className = `watch-status-dot ${s.cls}`;
    text.textContent = s.label;
  },

  _pairLog(msg, type = 'info') {
    const log = document.getElementById('watchPairLog');
    if (!log) return;
    const div = document.createElement('div');
    div.className = `pair-log-line ${type}`;
    div.innerHTML = msg;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  },

  _clearPairLog() {
    const log = document.getElementById('watchPairLog');
    if (log) log.innerHTML = '';
  },

  // ── REMINDER CRUD ─────────────────────────────────────────
  addReminder() {
    const medSel  = document.getElementById('remMed').value;
    const label   = document.getElementById('remLabel').value.trim()
                    || (medSel ? AyurDB.medicines.find(m => m.id === medSel)?.name : '')
                    || 'Reminder';
    const time     = document.getElementById('remTime').value;
    const repeat   = document.getElementById('remRepeat').value;
    const priority = document.getElementById('remPriority').value;
    const note     = document.getElementById('remNote').value.trim();
    const alertBrowser = document.getElementById('alertBrowser').checked;
    const alertWatch   = document.getElementById('alertWatch').checked;
    const alertSound   = document.getElementById('alertSound').checked;

    if (!time) { App.showToast('⚠️ Please set a reminder time', 'warn'); return; }

    const rem = {
      id: this._uid(), label, time, repeat, priority, note,
      alertBrowser, alertWatch, alertSound,
      status: 'pending', sentToWatch: false, source: 'manual', medId: medSel || null
    };
    this.reminders.push(rem);
    this._scheduleReminder(rem);
    if (this.connected) { rem.sentToWatch = true; this._animateWatchNotification(rem); }

    this._refreshTimeline();
    this._refreshStats();

    // Reset form
    document.getElementById('remLabel').value = '';
    document.getElementById('remNote').value  = '';
    document.getElementById('remMed').value   = '';

    App.showToast(`⌚ Reminder set — ${label} at ${time}`);
  },

  deleteReminder(id) {
    this.reminders = this.reminders.filter(r => r.id !== id);
    this._refreshTimeline();
    this._refreshStats();
    App.showToast('🗑 Reminder removed');
  },

  markTaken(id) {
    const rem = this.reminders.find(r => r.id === id);
    if (!rem) return;
    rem.status = 'taken';
    rem.takenAt = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    this._refreshTimeline();
    this._refreshStats();
    this._sendWatchConfirmation(rem);
    App.showToast(`✅ ${rem.label} marked as taken!`);
  },

  snoozeReminder(id) {
    const rem = this.reminders.find(r => r.id === id);
    if (!rem) return;
    const [h, m] = rem.time.split(':').map(Number);
    const total  = h * 60 + m + 10;
    rem.time     = `${String(Math.floor(total / 60) % 24).padStart(2,'0')}:${String(total % 60).padStart(2,'0')}`;
    rem.status   = 'pending';
    this._scheduleReminder(rem);
    this._refreshTimeline();
    App.showToast(`⏰ Snoozed to ${rem.time}`);
  },

  // ── PRESCRIPTION IMPORT ───────────────────────────────────
  _populateRxImport() {
    const el = document.getElementById('rxImportList');
    if (!el) return;
    const list = [
      { label: 'Ashwagandha Churna', time: '08:00', note: '5g with warm milk', priority: 'high' },
      { label: 'Triphala Churna',    time: '21:00', note: '3g with warm water', priority: 'high' },
      { label: 'Brahmi Taila',       time: '21:30', note: 'External scalp application', priority: 'medium' },
    ];
    el.innerHTML = list.map(rx => `
      <div class="rx-import-item">
        <div class="rx-import-icon ${rx.priority}">💊</div>
        <div class="rx-import-info">
          <div class="rx-import-name">${rx.label}</div>
          <div class="rx-import-meta">${rx.time} · ${rx.note}</div>
        </div>
        <span class="priority-badge ${rx.priority}">${rx.priority.toUpperCase()}</span>
      </div>`).join('');
  },

  _populateMedSelect() {
    const sel = document.getElementById('remMed');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Select from Prescription --</option>'
      + AyurDB.medicines.map(m => `<option value="${m.id}">${m.name} (${m.type})</option>`).join('');
  },

  importAllPrescriptions() {
    const list = [
      { label: 'Ashwagandha Churna', time: '08:00', note: '5g with warm milk before breakfast', priority: 'high' },
      { label: 'Triphala Churna',    time: '21:00', note: '3g with warm water before sleep',    priority: 'high' },
      { label: 'Brahmi Taila',       time: '21:30', note: 'Apply 5ml warm oil to scalp',        priority: 'medium' },
    ];
    let added = 0;
    list.forEach(rx => {
      if (!this.reminders.some(r => r.label === rx.label && r.time === rx.time)) {
        const rem = {
          id: this._uid(), ...rx, repeat: 'daily',
          alertBrowser: true, alertWatch: true, alertSound: true,
          status: 'pending', sentToWatch: false, source: 'prescription'
        };
        this.reminders.push(rem);
        this._scheduleReminder(rem);
        if (this.connected) { rem.sentToWatch = true; }
        added++;
      }
    });
    this._refreshTimeline();
    this._refreshStats();
    App.showToast(added > 0
      ? `📥 ${added} prescription reminder(s) imported!`
      : '⚠️ All prescription reminders already added');
  },

  // ── SCHEDULER ─────────────────────────────────────────────
  _scheduleAllReminders() {
    this.reminders.forEach(r => this._scheduleReminder(r));
  },

  _scheduleReminder(rem) {
    const now    = new Date();
    const [h, m] = rem.time.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target.getTime() - now.getTime();

    setTimeout(() => {
      if (rem.status !== 'taken') {
        rem.status = 'due';
        this._fireReminder(rem);
        this._refreshTimeline();
        this._refreshStats();
      }
    }, delay);
  },

  _startTickPoller() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: false
      }).replace(/^24:/, '00:');

      this.reminders.forEach(rem => {
        if (rem.time === nowStr && rem.status === 'pending') {
          rem.status = 'due';
          this._fireReminder(rem);
          this._refreshTimeline();
          this._refreshStats();
        }
        // Auto-miss after 30 min
        const remMin = +rem.time.split(':')[0] * 60 + +rem.time.split(':')[1];
        const nowMin = +nowStr.split(':')[0] * 60 + +nowStr.split(':')[1];
        if (nowMin - remMin > 30 && rem.status === 'pending') {
          rem.status = 'missed';
          this._refreshTimeline();
          this._refreshStats();
        }
      });
    }, 60000);
  },

  // ── FIRE REMINDER ─────────────────────────────────────────
  _fireReminder(rem) {
    // 1. Browser notification (with permission check)
    if (rem.alertBrowser && Notification.permission === 'granted') {
      try {
        const n = new Notification(`⌚ AyurDash — ${rem.label}`, {
          body: `🕐 ${rem.time}  •  ${rem.note || 'Time for your medicine!'}`,
          tag: rem.id,
          requireInteraction: rem.priority === 'high'
        });
        n.onclick = () => { window.focus(); App.navigate('watch'); n.close(); };
      } catch (_) { /* silent */ }
    }

    // 2. Audio chime
    if (rem.alertSound) this._playChime(rem.priority);

    // 3. Watch vibration / BLE send
    if (rem.alertWatch && this.connected) {
      this._sendToWatch(rem);
    } else if (rem.alertWatch) {
      // Watch not paired yet — animate watch face anyway
      this._animateWatchNotification(rem);
    }

    // 4. Update watch face
    this._updateWatchFaceNextRem();
    this._updateTopbarBadge();

    App.showToast(`⌚ Reminder: ${rem.label} at ${rem.time}`);
  },

  // ── BLE WRITE ─────────────────────────────────────────────
  async _sendToWatch(rem) {
    rem.sentToWatch = true;
    const payload = this._buildPayload(rem);

    if (this.simulated || !this.characteristic) {
      this._animateWatchNotification(rem);
      return;
    }
    try {
      const enc = new TextEncoder();
      await this.characteristic.writeValue(enc.encode(JSON.stringify(payload)));
    } catch (_) {
      this._animateWatchNotification(rem);
    }
  },

  _sendWatchConfirmation(rem) {
    if (!this.connected) return;
    const face = document.getElementById('watchFace');
    if (face) {
      face.classList.add('confirmed');
      setTimeout(() => face.classList.remove('confirmed'), 2000);
    }
  },

  _buildPayload(rem) {
    return {
      app: 'AyurDash',
      id: rem.id,
      title: `Time for ${rem.label}`,
      body: rem.note || 'Take as prescribed',
      time: rem.time,
      priority: rem.priority,
      vibration: rem.priority === 'high' ? [200,100,200,100,400] : rem.priority === 'medium' ? [200,100,200] : [200],
      actions: ['✓ Taken', '⏰ Snooze 10min']
    };
  },

  _animateWatchNotification(rem) {
    const face    = document.getElementById('watchFace');
    const nextEl  = document.getElementById('watchNextRem');
    if (face)   face.classList.add('notifying');
    if (nextEl) nextEl.textContent = rem.label;
    setTimeout(() => face && face.classList.remove('notifying'), 3000);
    this._updateWatchPreview(rem);
  },

  // ── BROWSER NOTIFICATIONS ─────────────────────────────────
  async requestNotifPermission() {
    if (!('Notification' in window)) {
      this._setNotifStatus('error', '❌ This browser does not support notifications.');
      return;
    }
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      this._setNotifStatus('success', '✅ Browser notifications enabled!');
      App.showToast('🔔 Notifications ON');
    } else if (result === 'denied') {
      this._setNotifStatus('error', '❌ Blocked — enable in browser settings → Site Settings → Notifications.');
    } else {
      this._setNotifStatus('warn', '⚠️ Permission not granted.');
    }
  },

  testNotification() {
    if (Notification.permission !== 'granted') {
      App.showToast('⚠️ Enable notifications first using the button above', 'warn');
      return;
    }
    try {
      new Notification('⌚ AyurDash — Test', {
        body: '🌿 Your reminder system is working correctly!',
        tag: 'ayurdash-test'
      });
      App.showToast('🧪 Test notification sent!');
    } catch (_) {
      App.showToast('⚠️ Notification test failed — check browser settings');
    }
  },

  _checkNotifPermission() {
    const perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    const map  = {
      granted:     ['success', '✅ Browser notifications are enabled'],
      denied:      ['error',   '❌ Notifications blocked — change in browser Site Settings'],
      default:     ['warn',    '⚠️ Click "Enable Browser Notifications" to activate alerts'],
      unsupported: ['error',   '❌ This browser does not support notifications']
    };
    const [type, msg] = map[perm] || map.default;
    this._setNotifStatus(type, msg);
  },

  _setNotifStatus(type, msg) {
    const el = document.getElementById('notifPermStatus');
    if (!el) return;
    const cls = { success: 'alert-success', warn: 'alert-warning', error: 'alert-danger' };
    el.className = cls[type] || '';
    el.textContent = msg;
  },

  // ── AUDIO CHIME ───────────────────────────────────────────
  _playChime(priority) {
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const freqMap = { high: [880, 1100, 880, 660], medium: [660, 880, 660], low: [440, 550] };
      const notes   = freqMap[priority] || freqMap.medium;
      notes.forEach((freq, i) => {
        const osc  = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime + i * 0.22);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + i * 0.22 + 0.28);
        osc.start(this.audioCtx.currentTime + i * 0.22);
        osc.stop(this.audioCtx.currentTime  + i * 0.22 + 0.3);
      });
    } catch (_) { /* audio not available — silent */ }
  },

  // ── TIMELINE ──────────────────────────────────────────────
  _refreshTimeline() {
    const el = document.getElementById('reminderTimeline');
    if (!el) return;

    const sorted   = [...this.reminders].sort((a, b) => a.time.localeCompare(b.time));
    const filtered = sorted.filter(r => {
      if (this.activeFilter === 'all')     return true;
      if (this.activeFilter === 'pending') return r.status === 'pending' || r.status === 'due';
      if (this.activeFilter === 'taken')   return r.status === 'taken';
      if (this.activeFilter === 'missed')  return r.status === 'missed';
      return true;
    });

    if (!filtered.length) {
      el.innerHTML = `<div class="no-reminders"><span>⌚</span><p>No ${this.activeFilter === 'all' ? '' : this.activeFilter} reminders yet.</p></div>`;
      return;
    }

    const prioColor = { high: '#dc3545', medium: '#f59e0b', low: '#2d6a4f' };
    const statusMap = {
      pending: { icon: '⏳', cls: 'status-pending', label: 'Pending' },
      due:     { icon: '🔔', cls: 'status-due',     label: 'DUE NOW' },
      taken:   { icon: '✅', cls: 'status-taken',   label: 'Taken' },
      missed:  { icon: '❌', cls: 'status-missed',  label: 'Missed' }
    };
    const sourceLabel = { prescription: '📋 Rx', lifestyle: '🌿 Lifestyle', manual: '✏️ Custom' };

    el.innerHTML = filtered.map(rem => {
      const si = statusMap[rem.status] || statusMap.pending;
      return `
        <div class="reminder-item ${rem.status === 'due' ? 'pulsing' : ''}">
          <div class="rem-time-col">
            <div class="rem-time">${rem.time}</div>
            <div class="rem-repeat">${rem.repeat}</div>
          </div>
          <div class="rem-prio-line" style="background:${prioColor[rem.priority]||'#aaa'}"></div>
          <div class="rem-body">
            <div class="rem-label-row">
              <span class="rem-label">${rem.label}</span>
              <span class="rem-source-tag">${sourceLabel[rem.source] || rem.source}</span>
            </div>
            ${rem.note ? `<div class="rem-note">${rem.note}</div>` : ''}
            <div class="rem-meta-row">
              <span class="rem-status-badge ${si.cls}">${si.icon} ${si.label}${rem.takenAt ? ' at ' + rem.takenAt : ''}</span>
              <span class="rem-watch-badge">${rem.sentToWatch ? '⌚ Synced' : '📵 Not synced'}</span>
              ${rem.alertBrowser ? '<span class="rem-alert-tag" title="Browser alert">🔔</span>' : ''}
              ${rem.alertWatch   ? '<span class="rem-alert-tag" title="Watch vibration">⌚</span>' : ''}
              ${rem.alertSound   ? '<span class="rem-alert-tag" title="Sound chime">🔊</span>' : ''}
            </div>
          </div>
          <div class="rem-actions">
            ${rem.status !== 'taken' ? `<button class="rem-btn rem-btn-take" title="Mark taken" onclick="WatchReminder.markTaken('${rem.id}')">✅</button>` : ''}
            ${rem.status !== 'taken' ? `<button class="rem-btn rem-btn-snooze" title="Snooze 10 min" onclick="WatchReminder.snoozeReminder('${rem.id}')">⏰</button>` : ''}
            ${!rem.sentToWatch ? `<button class="rem-btn rem-btn-sync" title="Send to watch" onclick="WatchReminder._sendToWatch(WatchReminder.reminders.find(r=>r.id==='${rem.id}'))">⌚</button>` : ''}
            <button class="rem-btn rem-btn-del" title="Delete" onclick="WatchReminder.deleteReminder('${rem.id}')">🗑</button>
          </div>
        </div>`;
    }).join('');

    this._updateWatchFaceNextRem();
  },

  filterReminders(filter, btn) {
    this.activeFilter = filter;
    document.querySelectorAll('.rem-filter').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    this._refreshTimeline();
  },

  // ── STATS & STREAK ────────────────────────────────────────
  _refreshStats() {
    const total   = this.reminders.length;
    const sent    = this.reminders.filter(r => r.sentToWatch).length;
    const taken   = this.reminders.filter(r => r.status === 'taken').length;
    const pending = this.reminders.filter(r => r.status === 'pending' || r.status === 'due').length;
    const pct     = total > 0 ? Math.round((taken / total) * 100) : 0;

    const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    set('wstat-total',   total);
    set('wstat-sent',    sent);
    set('wstat-pending', pending);
    set('wstat-taken',   taken);
    set('compliancePct', pct + '%');

    const fill = document.getElementById('complianceFill');
    if (fill) {
      fill.style.width = pct + '%';
      fill.style.background = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)';
    }
    this._updateTopbarBadge(pending);
  },

  _updateTopbarBadge(count) {
    const badge = document.getElementById('watchBadge');
    if (!badge) return;
    const n = count !== undefined ? count
      : this.reminders.filter(r => r.status === 'pending' || r.status === 'due').length;
    badge.textContent = n;
    badge.classList.toggle('hidden', n === 0);
  },

  _buildStreakRow() {
    const el = document.getElementById('streakRow');
    if (!el) return;
    const days    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const today   = new Date().getDay();
    const streak  = [true, true, true, true, true, false, false];
    el.innerHTML  = days.map((d, i) => {
      const future  = i > today;
      const isToday = i === today;
      const done    = !future && streak[i];
      return `
        <div class="streak-day ${done ? 'done' : ''} ${isToday ? 'today' : ''} ${future ? 'future' : ''}">
          <div class="streak-circle">${done ? '✅' : isToday ? '⏳' : '○'}</div>
          <div class="streak-day-label">${d}</div>
        </div>`;
    }).join('');
  },

  // ── WATCH FACE CLOCK ──────────────────────────────────────
  _startWatchClock() {
    if (this.watchClockInterval) clearInterval(this.watchClockInterval);
    const tick = () => {
      const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/^24:/, '00:');
      ['watchFaceTime', 'wpTime'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = t; });
    };
    tick();
    this.watchClockInterval = setInterval(tick, 1000);
  },

  _updateWatchFaceNextRem() {
    const el = document.getElementById('watchNextRem');
    if (!el) return;
    const next = this.reminders
      .filter(r => r.status === 'pending' || r.status === 'due')
      .sort((a, b) => a.time.localeCompare(b.time))[0];
    el.textContent = next ? `Next: ${next.time} ${next.label}` : 'All done ✅';
  },

  // ── WATCH PREVIEW ─────────────────────────────────────────
  previewNextReminder() {
    const next = [...this.reminders]
      .filter(r => r.status === 'pending')
      .sort((a, b) => a.time.localeCompare(b.time))[0] || this.reminders[0];
    if (!next) { App.showToast('No reminders to preview'); return; }
    this._updateWatchPreview(next);
  },

  _previewNextOnLoad() {
    const next = [...this.reminders].sort((a,b) => a.time.localeCompare(b.time))[0];
    if (next) this._updateWatchPreview(next);
  },

  _updateWatchPreview(rem) {
    const set = (id, html, isHtml) => {
      const e = document.getElementById(id);
      if (!e) return;
      if (isHtml) e.innerHTML = html; else e.textContent = html;
    };
    set('wpTitle', `Time for ${rem.label}`);
    set('wpBody',  `${rem.label}<br/><small>${rem.note || 'Take as prescribed'}</small>`, true);

    const p = this._buildPayload(rem);
    set('watchPayloadPreview', `
      <div class="payload-line"><span class="pl-key">app</span><span class="pl-val">${p.app}</span></div>
      <div class="payload-line"><span class="pl-key">title</span><span class="pl-val">${p.title}</span></div>
      <div class="payload-line"><span class="pl-key">body</span><span class="pl-val">${p.body}</span></div>
      <div class="payload-line"><span class="pl-key">time</span><span class="pl-val">${p.time}</span></div>
      <div class="payload-line"><span class="pl-key">priority</span><span class="pl-val">${p.priority}</span></div>
      <div class="payload-line"><span class="pl-key">vibration</span><span class="pl-val">[${p.vibration.join(', ')}] ms</span></div>
      <div class="payload-line"><span class="pl-key">actions</span><span class="pl-val">${p.actions.join(' · ')}</span></div>
    `, true);

    const dev = document.getElementById('watchPreviewDevice');
    if (dev) { dev.classList.add('preview-anim'); setTimeout(() => dev.classList.remove('preview-anim'), 700); }
  },

  async sendTestToWatch() {
    const rem = [...this.reminders].sort((a,b) => a.time.localeCompare(b.time))[0];
    if (!rem) { App.showToast('No reminders to test', 'warn'); return; }
    if (!this.connected) { App.showToast('⚠️ Connect your watch first', 'warn'); return; }
    this._animateWatchNotification(rem);
    this._playChime(rem.priority);
    this._updateWatchPreview(rem);
    App.showToast(`📤 Test sent: ${rem.label}`);
  },

  // ── HELPERS ───────────────────────────────────────────────
  _uid() {
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
};
