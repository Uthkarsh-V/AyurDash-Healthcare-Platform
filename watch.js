// ============================================================
//  AyurDash — Smartwatch Reminder Engine
//  watch.js
//  Features:
//   • Web Bluetooth API pairing (WearOS / Galaxy Watch / BLE)
//   • Simulated pairing fallback for demo/non-BLE browsers
//   • Doctor prescription → auto reminder import
//   • Timed reminder engine (setInterval, 1-min polling)
//   • Browser Notification API (foreground + background)
//   • Audio chime alerts
//   • BLE GATT write to watch characteristic
//   • Live watch face clock
//   • Compliance tracking + weekly streak
//   • Snooze (10 min) + Mark Taken actions
//   • Watch notification preview panel
// ============================================================

"use strict";

const WatchReminder = {

  // ── STATE ─────────────────────────────────────────────────
  device: null,
  gattServer: null,
  characteristic: null,
  connected: false,
  simulated: false,

  reminders: [],         // All reminders
  activeFilter: 'all',
  reminderTimers: [],    // clearTimeout handles
  tickInterval: null,    // 1-min poller
  watchClockInterval: null,
  audioCtx: null,

  // BLE UUIDs (standard Health / Alert service UUIDs)
  BLE_SERVICE:  '0000180d-0000-1000-8000-00805f9b34fb',  // Heart Rate svc (placeholder)
  BLE_CHAR:     '00002a37-0000-1000-8000-00805f9b34fb',  // HR Measurement char

  // ── INIT ──────────────────────────────────────────────────
  initView() {
    this._populateMedSelect();
    this._populateRxImport();
    this._startWatchClock();
    this._refreshTimeline();
    this._refreshStats();
    this._buildStreakRow();
    this._checkNotifPermission();
    this._startTickPoller();

    // Pre-load demo reminders from patient prescription if none exist
    if (this.reminders.length === 0) {
      this._loadDefaultReminders();
    }

    this._refreshTimeline();
    this._refreshStats();
  },

  _loadDefaultReminders() {
    const p = AyurDB.patients[0];
    const defaults = [
      { id: this._uid(), label: 'Ashwagandha Churna', note: '5g with warm milk', time: '08:00', repeat: 'daily', priority: 'high',   alertBrowser: true, alertWatch: true, alertSound: true, status: 'pending', sentToWatch: false, source: 'prescription' },
      { id: this._uid(), label: 'Triphala Churna',    note: '3g with warm water', time: '21:00', repeat: 'daily', priority: 'high',   alertBrowser: true, alertWatch: true, alertSound: true, status: 'pending', sentToWatch: false, source: 'prescription' },
      { id: this._uid(), label: 'Brahmi Taila',       note: 'Scalp massage 5ml warm oil', time: '21:30', repeat: 'daily', priority: 'medium', alertBrowser: true, alertWatch: true, alertSound: false, status: 'pending', sentToWatch: false, source: 'prescription' },
      { id: this._uid(), label: 'Morning Yoga',       note: 'Pranayama 15 min', time: '06:30', repeat: 'daily', priority: 'low',    alertBrowser: true, alertWatch: true, alertSound: false, status: 'pending', sentToWatch: false, source: 'lifestyle' },
      { id: this._uid(), label: 'Lunch Reminder',     note: 'Light Pitta-pacifying meal', time: '12:30', repeat: 'daily', priority: 'low',    alertBrowser: false, alertWatch: true, alertSound: false, status: 'pending', sentToWatch: false, source: 'lifestyle' },
    ];
    this.reminders = defaults;
    this._scheduleAllReminders();
  },

  // ── BLUETOOTH PAIRING ─────────────────────────────────────
  async pairDevice() {
    if (!navigator.bluetooth) {
      this._pairLog('⚠️ Web Bluetooth not available in this browser. Use Chrome on Android/desktop, or click "Simulate Pairing".', 'warn');
      return;
    }
    this._pairLog('🔍 Scanning for BLE devices...', 'info');
    this._setWatchStatus('scanning');
    try {
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [this.BLE_SERVICE]
      });
      this._pairLog(`✅ Found device: <strong>${this.device.name || 'Unknown Device'}</strong>`, 'success');
      this._pairLog('🔗 Connecting to GATT server...', 'info');

      this.gattServer = await this.device.gatt.connect();
      this._pairLog('📡 Connected to GATT server!', 'success');

      try {
        const service = await this.gattServer.getPrimaryService(this.BLE_SERVICE);
        this.characteristic = await service.getCharacteristic(this.BLE_CHAR);
        this._pairLog('✅ Reminder characteristic ready!', 'success');
      } catch (e) {
        this._pairLog('ℹ️ GATT service not found on device — using notification-only mode.', 'info');
      }

      this.connected = true;
      this.simulated = false;
      this._setWatchStatus('connected', this.device.name || 'BLE Watch');
      this._onConnected();

      this.device.addEventListener('gattserverdisconnected', () => {
        this._pairLog('🔌 Watch disconnected.', 'warn');
        this.connected = false;
        this._setWatchStatus('disconnected');
      });
    } catch (e) {
      this._pairLog(`❌ Pairing failed: ${e.message}`, 'error');
      this._setWatchStatus('failed');
    }
  },

  simulatePair() {
    this._setWatchStatus('scanning');
    this._pairLog('🔍 Simulating Bluetooth scan...', 'info');
    setTimeout(() => {
      this._pairLog('📡 Found device: <strong>AyurWatch Pro (Simulated)</strong>', 'success');
    }, 600);
    setTimeout(() => {
      this._pairLog('🔗 Establishing connection...', 'info');
    }, 1200);
    setTimeout(() => {
      this._pairLog('✅ Connected to AyurWatch Pro!', 'success');
      this._pairLog('📲 Reminder channel ready. All alerts will vibrate your watch.', 'success');
      this.connected = true;
      this.simulated = true;
      this._setWatchStatus('connected', 'AyurWatch Pro');
      this._onConnected();
    }, 2200);
  },

  _onConnected() {
    document.getElementById('watch3d').classList.add('connected');
    document.getElementById('watchFace').classList.add('active');
    App.showToast('⌚ Watch paired! Sending reminders...', 'success');
    // Auto-send all pending reminders to watch
    setTimeout(() => this._syncAllToWatch(), 500);
    this._refreshStats();
  },

  _setWatchStatus(state, name) {
    const dot  = document.getElementById('watchStatusDot');
    const text = document.getElementById('watchStatusText');
    const states = {
      scanning:     { cls: 'scanning',     label: '🔍 Scanning for devices...' },
      connected:    { cls: 'connected',    label: `✅ Connected: ${name || 'Watch'}` },
      disconnected: { cls: 'disconnected', label: '🔌 Disconnected' },
      failed:       { cls: 'failed',       label: '❌ Pairing failed' }
    };
    const s = states[state] || { cls: '', label: 'Not connected' };
    dot.className = `watch-status-dot ${s.cls}`;
    text.textContent = s.label;
  },

  _pairLog(msg, type = 'info') {
    const log = document.getElementById('watchPairLog');
    const div = document.createElement('div');
    div.className = `pair-log-line ${type}`;
    div.innerHTML = msg;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  },

  // ── REMINDER CRUD ─────────────────────────────────────────
  addReminder() {
    const medSel  = document.getElementById('remMed').value;
    const label   = document.getElementById('remLabel').value.trim() ||
                    (medSel ? AyurDB.medicines.find(m => m.id === medSel)?.name : '') ||
                    'Reminder';
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
      status: 'pending', sentToWatch: false, source: 'manual',
      medId: medSel || null
    };
    this.reminders.push(rem);
    this._scheduleReminder(rem);
    if (this.connected) this._sendToWatch(rem);
    this._refreshTimeline();
    this._refreshStats();

    // Clear form
    document.getElementById('remLabel').value = '';
    document.getElementById('remNote').value = '';
    App.showToast(`⌚ Reminder set for ${time} — ${label}`);
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
    App.showToast(`✅ ${rem.label} marked as taken!`);
    this._sendWatchConfirmation(rem);
  },

  snoozeReminder(id) {
    const rem = this.reminders.find(r => r.id === id);
    if (!rem) return;
    const [h, m] = rem.time.split(':').map(Number);
    const snoozeMin = m + 10;
    const newH = h + Math.floor(snoozeMin / 60);
    const newM = snoozeMin % 60;
    rem.time = `${String(newH % 24).padStart(2,'0')}:${String(newM).padStart(2,'0')}`;
    rem.status = 'pending';
    this._scheduleReminder(rem);
    this._refreshTimeline();
    App.showToast(`⏰ ${rem.label} snoozed to ${rem.time}`);
  },

  // ── PRESCRIPTION IMPORT ───────────────────────────────────
  _populateRxImport() {
    const p = AyurDB.patients[0];
    const el = document.getElementById('rxImportList');
    if (!el) return;
    el.innerHTML = '';
    const prescriptionReminders = [
      { label: 'Ashwagandha Churna', time: '08:00', note: '5g with warm milk', priority: 'high' },
      { label: 'Triphala Churna',    time: '21:00', note: '3g with warm water', priority: 'high' },
      { label: 'Brahmi Taila',       time: '21:30', note: 'External scalp application', priority: 'medium' },
    ];
    prescriptionReminders.forEach((rx, i) => {
      el.innerHTML += `
        <div class="rx-import-item">
          <div class="rx-import-icon ${rx.priority}">💊</div>
          <div class="rx-import-info">
            <div class="rx-import-name">${rx.label}</div>
            <div class="rx-import-meta">${rx.time} · ${rx.note}</div>
          </div>
          <span class="priority-badge ${rx.priority}">${rx.priority.toUpperCase()}</span>
        </div>`;
    });
  },

  _populateMedSelect() {
    const sel = document.getElementById('remMed');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Select from Prescription --</option>';
    AyurDB.medicines.forEach(m => {
      sel.innerHTML += `<option value="${m.id}">${m.name} (${m.type})</option>`;
    });
  },

  importAllPrescriptions() {
    const rxList = [
      { label: 'Ashwagandha Churna', time: '08:00', note: '5g with warm milk', priority: 'high' },
      { label: 'Triphala Churna',    time: '21:00', note: '3g with warm water before sleep', priority: 'high' },
      { label: 'Brahmi Taila',       time: '21:30', note: 'Apply 5ml warm oil to scalp', priority: 'medium' },
    ];
    let added = 0;
    rxList.forEach(rx => {
      const exists = this.reminders.some(r => r.label === rx.label && r.time === rx.time);
      if (!exists) {
        const rem = {
          id: this._uid(), label: rx.label, time: rx.time, repeat: 'daily',
          priority: rx.priority, note: rx.note,
          alertBrowser: true, alertWatch: true, alertSound: true,
          status: 'pending', sentToWatch: false, source: 'prescription'
        };
        this.reminders.push(rem);
        this._scheduleReminder(rem);
        if (this.connected) this._sendToWatch(rem);
        added++;
      }
    });
    this._refreshTimeline();
    this._refreshStats();
    App.showToast(added > 0
      ? `📥 ${added} prescription reminder(s) imported & sent to watch!`
      : '⚠️ All prescription reminders already exist');
  },

  // ── REMINDER SCHEDULER ───────────────────────────────────
  _scheduleAllReminders() {
    this.reminders.forEach(r => this._scheduleReminder(r));
  },

  _scheduleReminder(rem) {
    const now = new Date();
    const [h, m] = rem.time.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    const delay = target.getTime() - now.getTime();

    const handle = setTimeout(() => {
      if (rem.status !== 'taken') {
        rem.status = 'due';
        this._fireReminder(rem);
        this._refreshTimeline();
        this._refreshStats();
      }
    }, delay);
    this.reminderTimers.push(handle);
  },

  _startTickPoller() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      this.reminders.forEach(rem => {
        if (rem.time === nowStr && rem.status === 'pending') {
          rem.status = 'due';
          this._fireReminder(rem);
          this._refreshTimeline();
          this._refreshStats();
        }
        // Auto-mark missed if 30+ minutes past and not taken
        const [rh, rm2] = rem.time.split(':').map(Number);
        const remMins = rh * 60 + rm2;
        const [nh, nm] = nowStr.split(':').map(Number);
        const nowMins = nh * 60 + nm;
        if (nowMins - remMins > 30 && rem.status === 'pending') {
          rem.status = 'missed';
          this._refreshTimeline();
          this._refreshStats();
        }
      });
    }, 60000); // every 1 minute
  },

  _fireReminder(rem) {
    // Browser Notification
    if (rem.alertBrowser && Notification.permission === 'granted') {
      const notif = new Notification(`⌚ AyurDash — ${rem.label}`, {
        body: `🕐 ${rem.time}  •  ${rem.note || 'Time for your medicine!'}`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌿</text></svg>',
        tag: rem.id,
        requireInteraction: rem.priority === 'high',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">💊</text></svg>'
      });
      notif.onclick = () => {
        window.focus();
        App.navigate('watch');
        notif.close();
      };
    }

    // Audio chime
    if (rem.alertSound) this._playChime(rem.priority);

    // BLE write to watch
    if (rem.alertWatch && this.connected) this._sendToWatch(rem);

    // Update watch face next-rem
    this._updateWatchFaceNextRem();

    // Badge update
    this._updateTopbarBadge();

    // Show in-app toast with action buttons
    App.showToast(`⌚ Reminder: ${rem.label} at ${rem.time}`);
  },

  // ── BLE WRITE ─────────────────────────────────────────────
  async _sendToWatch(rem) {
    const payload = this._buildPayload(rem);
    rem.sentToWatch = true;

    if (this.simulated) {
      // Simulated — animate watch face
      this._animateWatchNotification(rem);
      return;
    }
    if (this.characteristic) {
      try {
        const encoder = new TextEncoder();
        await this.characteristic.writeValue(encoder.encode(JSON.stringify(payload)));
      } catch (e) {
        console.warn('BLE write failed:', e.message);
        this._animateWatchNotification(rem);
      }
    } else {
      this._animateWatchNotification(rem);
    }
  },

  _sendWatchConfirmation(rem) {
    if (!this.connected) return;
    if (this.simulated) {
      document.getElementById('watchFace')?.classList.add('confirmed');
      setTimeout(() => document.getElementById('watchFace')?.classList.remove('confirmed'), 2000);
    }
  },

  _buildPayload(rem) {
    return {
      app: 'AyurDash',
      id: rem.id,
      title: `Time for ${rem.label}`,
      body: rem.note || 'Please take your medicine',
      time: rem.time,
      priority: rem.priority,
      vibration: rem.priority === 'high' ? [200, 100, 200, 100, 400] : [200, 100, 200],
      actions: ['Taken', 'Snooze 10min'],
      icon: '🌿'
    };
  },

  _animateWatchNotification(rem) {
    const face = document.getElementById('watchFace');
    const nextRem = document.getElementById('watchNextRem');
    if (!face || !nextRem) return;
    face.classList.add('notifying');
    nextRem.textContent = rem.label;
    setTimeout(() => face.classList.remove('notifying'), 3000);
  },

  _syncAllToWatch() {
    let count = 0;
    this.reminders.forEach(rem => {
      if (!rem.sentToWatch) {
        setTimeout(() => {
          this._sendToWatch(rem);
          rem.sentToWatch = true;
        }, count * 300);
        count++;
      }
    });
    setTimeout(() => {
      this._refreshStats();
      App.showToast(`📲 ${count} reminders synced to watch!`);
    }, count * 300 + 200);
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
      App.showToast('🔔 Browser notifications ON');
    } else {
      this._setNotifStatus('warn', '⚠️ Permission denied — browser notifications blocked.');
    }
  },

  testNotification() {
    if (Notification.permission !== 'granted') {
      App.showToast('⚠️ Enable notifications first', 'warn');
      return;
    }
    new Notification('⌚ AyurDash Test', {
      body: '🌿 Your Ayurvedic medication reminder system is working correctly!',
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🌿</text></svg>',
      tag: 'ayurdash-test'
    });
    App.showToast('🧪 Test notification sent!');
  },

  _checkNotifPermission() {
    const el = document.getElementById('notifPermStatus');
    if (!el) return;
    if (!('Notification' in window)) {
      this._setNotifStatus('error', '❌ Notifications not supported.');
    } else if (Notification.permission === 'granted') {
      this._setNotifStatus('success', '✅ Notifications enabled');
    } else if (Notification.permission === 'denied') {
      this._setNotifStatus('error', '❌ Notifications blocked — enable in browser settings');
    } else {
      this._setNotifStatus('warn', '⚠️ Notification permission not yet granted');
    }
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
      const ctx = this.audioCtx || (this.audioCtx = new (window.AudioContext || window.webkitAudioContext)());
      const freqs = { high: [880, 1100, 880], medium: [660, 880], low: [440] };
      const notes = freqs[priority] || freqs.medium;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.3);
        osc.start(ctx.currentTime + i * 0.25);
        osc.stop(ctx.currentTime + i * 0.25 + 0.35);
      });
    } catch (e) { /* audio not available */ }
  },

  // ── TIMELINE RENDER ───────────────────────────────────────
  _refreshTimeline() {
    const el = document.getElementById('reminderTimeline');
    if (!el) return;

    const sorted = [...this.reminders].sort((a, b) => a.time.localeCompare(b.time));
    const filtered = sorted.filter(r => {
      if (this.activeFilter === 'all')     return true;
      if (this.activeFilter === 'pending') return r.status === 'pending' || r.status === 'due';
      if (this.activeFilter === 'taken')   return r.status === 'taken';
      if (this.activeFilter === 'missed')  return r.status === 'missed';
      return true;
    });

    if (!filtered.length) {
      el.innerHTML = `<div class="no-reminders"><span>⌚</span><p>No ${this.activeFilter === 'all' ? '' : this.activeFilter} reminders</p></div>`;
      return;
    }

    el.innerHTML = '';
    filtered.forEach(rem => {
      const statusInfo = {
        pending: { icon: '⏳', cls: 'status-pending', label: 'Pending' },
        due:     { icon: '🔔', cls: 'status-due',     label: 'DUE NOW' },
        taken:   { icon: '✅', cls: 'status-taken',   label: `Taken${rem.takenAt ? ' at ' + rem.takenAt : ''}` },
        missed:  { icon: '❌', cls: 'status-missed',  label: 'Missed' }
      }[rem.status] || { icon: '⏳', cls: 'status-pending', label: rem.status };

      const prioColors = { high: '#dc3545', medium: '#f59e0b', low: '#2d6a4f' };

      el.innerHTML += `
        <div class="reminder-item ${rem.status === 'due' ? 'pulsing' : ''}" id="rem-${rem.id}">
          <div class="rem-time-col">
            <div class="rem-time">${rem.time}</div>
            <div class="rem-repeat">${rem.repeat}</div>
          </div>
          <div class="rem-prio-line" style="background:${prioColors[rem.priority] || '#aaa'}"></div>
          <div class="rem-body">
            <div class="rem-label-row">
              <span class="rem-label">${rem.label}</span>
              <span class="rem-source-tag">${rem.source === 'prescription' ? '📋 Rx' : rem.source === 'lifestyle' ? '🌿 Lifestyle' : '✏️ Manual'}</span>
            </div>
            ${rem.note ? `<div class="rem-note">${rem.note}</div>` : ''}
            <div class="rem-meta-row">
              <span class="rem-status-badge ${statusInfo.cls}">${statusInfo.icon} ${statusInfo.label}</span>
              <span class="rem-watch-badge">${rem.sentToWatch ? '⌚ On watch' : '📵 Not synced'}</span>
              ${rem.alertBrowser ? '<span class="rem-alert-tag">🔔</span>' : ''}
              ${rem.alertWatch   ? '<span class="rem-alert-tag">⌚</span>' : ''}
              ${rem.alertSound   ? '<span class="rem-alert-tag">🔊</span>' : ''}
            </div>
          </div>
          <div class="rem-actions">
            ${rem.status !== 'taken' ? `<button class="rem-btn rem-btn-take" onclick="WatchReminder.markTaken('${rem.id}')">✅</button>` : ''}
            ${rem.status !== 'taken' ? `<button class="rem-btn rem-btn-snooze" onclick="WatchReminder.snoozeReminder('${rem.id}')">⏰</button>` : ''}
            ${!rem.sentToWatch ? `<button class="rem-btn rem-btn-sync" onclick="WatchReminder._sendToWatch(WatchReminder.reminders.find(r=>r.id==='${rem.id}'))">⌚</button>` : ''}
            <button class="rem-btn rem-btn-del" onclick="WatchReminder.deleteReminder('${rem.id}')">🗑</button>
          </div>
        </div>`;
    });
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

    this._setStatVal('wstat-total',   total);
    this._setStatVal('wstat-sent',    sent);
    this._setStatVal('wstat-pending', pending);
    this._setStatVal('wstat-taken',   taken);

    const fill = document.getElementById('complianceFill');
    const pctEl = document.getElementById('compliancePct');
    if (fill) { fill.style.width = pct + '%'; fill.style.background = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)'; }
    if (pctEl) pctEl.textContent = pct + '%';

    // Topbar badge
    this._updateTopbarBadge(pending);
  },

  _setStatVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  _updateTopbarBadge(count) {
    const badge = document.getElementById('watchBadge');
    if (!badge) return;
    const n = count !== undefined ? count : this.reminders.filter(r => r.status === 'pending' || r.status === 'due').length;
    if (n > 0) {
      badge.textContent = n;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  },

  _buildStreakRow() {
    const el = document.getElementById('streakRow');
    if (!el) return;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    // Mock streak — last 5 days taken, today pending, tomorrow empty
    const streakData = [true, true, true, true, true, false, false];
    el.innerHTML = '';
    days.forEach((day, i) => {
      const isFuture  = i > today;
      const isToday   = i === today;
      const isDone    = !isFuture && streakData[i];
      el.innerHTML += `
        <div class="streak-day ${isDone ? 'done' : ''} ${isToday ? 'today' : ''} ${isFuture ? 'future' : ''}">
          <div class="streak-circle">${isDone ? '✅' : isToday ? '⏳' : '○'}</div>
          <div class="streak-day-label">${day}</div>
        </div>`;
    });
  },

  // ── WATCH FACE CLOCK ─────────────────────────────────────
  _startWatchClock() {
    if (this.watchClockInterval) clearInterval(this.watchClockInterval);
    const tick = () => {
      const now = new Date();
      const t = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
      const el1 = document.getElementById('watchFaceTime');
      const el2 = document.getElementById('wpTime');
      if (el1) el1.textContent = t;
      if (el2) el2.textContent = t;
    };
    tick();
    this.watchClockInterval = setInterval(tick, 1000);
  },

  _updateWatchFaceNextRem() {
    const el = document.getElementById('watchNextRem');
    if (!el) return;
    const pending = this.reminders
      .filter(r => r.status === 'pending' || r.status === 'due')
      .sort((a, b) => a.time.localeCompare(b.time));
    el.textContent = pending.length > 0 ? `Next: ${pending[0].time} ${pending[0].label}` : 'All done ✅';
  },

  // ── WATCH PREVIEW ─────────────────────────────────────────
  previewNextReminder() {
    const pending = this.reminders
      .filter(r => r.status === 'pending')
      .sort((a, b) => a.time.localeCompare(b.time));
    const rem = pending[0] || this.reminders[0];
    if (!rem) { App.showToast('No reminders to preview'); return; }
    this._updateWatchPreview(rem);
  },

  _updateWatchPreview(rem) {
    const t = document.getElementById('wpTitle');
    const b = document.getElementById('wpBody');
    if (t) t.textContent = `Time for ${rem.label}`;
    if (b) b.innerHTML = `${rem.label}<br/><small>${rem.note || 'Take as prescribed'}</small>`;

    const payload = this._buildPayload(rem);
    const prev = document.getElementById('watchPayloadPreview');
    if (prev) {
      prev.innerHTML = `
        <div class="payload-line"><span class="pl-key">app</span><span class="pl-val">${payload.app}</span></div>
        <div class="payload-line"><span class="pl-key">title</span><span class="pl-val">${payload.title}</span></div>
        <div class="payload-line"><span class="pl-key">body</span><span class="pl-val">${payload.body}</span></div>
        <div class="payload-line"><span class="pl-key">time</span><span class="pl-val">${payload.time}</span></div>
        <div class="payload-line"><span class="pl-key">priority</span><span class="pl-val">${payload.priority}</span></div>
        <div class="payload-line"><span class="pl-key">vibration</span><span class="pl-val">[${payload.vibration.join(', ')}]ms</span></div>
        <div class="payload-line"><span class="pl-key">actions</span><span class="pl-val">${payload.actions.join(' • ')}</span></div>
      `;
    }
    // Animate watch preview
    document.getElementById('watchPreviewDevice')?.classList.add('preview-anim');
    setTimeout(() => document.getElementById('watchPreviewDevice')?.classList.remove('preview-anim'), 1000);
  },

  async sendTestToWatch() {
    const pending = this.reminders.filter(r => r.status === 'pending').sort((a,b)=>a.time.localeCompare(b.time));
    const rem = pending[0] || this.reminders[0];
    if (!rem) { App.showToast('No reminders to send', 'warn'); return; }
    if (!this.connected) {
      App.showToast('⚠️ Pair your watch first', 'warn');
      return;
    }
    this._animateWatchNotification(rem);
    this._playChime(rem.priority);
    App.showToast(`📤 Test sent to watch: ${rem.label}`);
    this._updateWatchPreview(rem);
  },

  // ── HELPERS ───────────────────────────────────────────────
  _uid() {
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
};
