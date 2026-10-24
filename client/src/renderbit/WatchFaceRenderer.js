// client/src/renderbit/WatchFaceRenderer.js
// Renderbit-style canvas scene renderer for the AyurDash Ayurvedic Smartwatch Face

export default class WatchFaceRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.animationFrame = null;
    this.timeStr = '12:00';
    this.secStr = '00';
    this.nextReminder = 'No upcoming reminder';
    this.isNotifying = false;
    this.pulsePhase = 0;
    this.connected = false;
    this.heartRate = 72;

    this.render = this.render.bind(this);
    this.start();
  }

  setTime(time, sec = '00') {
    this.timeStr = time || '12:00';
    this.secStr = sec;
  }

  setNextReminder(label) {
    this.nextReminder = label || 'All done ✅';
  }

  setConnected(status) {
    this.connected = !!status;
  }

  playNotification() {
    this.isNotifying = true;
    setTimeout(() => { this.isNotifying = false; }, 4000);
  }

  start() {
    if (!this.animationFrame) {
      this.render();
    }
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  render() {
    const { ctx, canvas } = this;
    if (!ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(cx, cy) - 8;

    ctx.clearRect(0, 0, w, h);

    // ── Outer Bezel ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 12;
    ctx.fill();

    const bezelGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    bezelGrad.addColorStop(0, '#334155');
    bezelGrad.addColorStop(0.5, '#0f172a');
    bezelGrad.addColorStop(1, '#1e293b');
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = bezelGrad;
    ctx.fill();

    // ── OLED Display Glass ──
    const dialGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r - 6);
    dialGrad.addColorStop(0, this.isNotifying ? '#3b1d06' : '#07161b');
    dialGrad.addColorStop(0.85, '#050c10');
    dialGrad.addColorStop(1, '#020508');
    ctx.beginPath();
    ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
    ctx.fillStyle = dialGrad;
    ctx.fill();

    // ── Tick Marks ──
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6;
      const x1 = cx + Math.cos(angle) * (r - 14);
      const y1 = cy + Math.sin(angle) * (r - 14);
      const x2 = cx + Math.cos(angle) * (r - 9);
      const y2 = cy + Math.sin(angle) * (r - 9);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // ── Nadi / Pulse Ring (Breathing animation) ──
    this.pulsePhase = (this.pulsePhase + 0.04) % (Math.PI * 2);
    const pulseScale = Math.sin(this.pulsePhase) * 2;
    const ringRadius = Math.max(10, r - 22 + pulseScale);

    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, -Math.PI / 2, Math.PI * 1.5);
    ctx.strokeStyle = this.isNotifying
      ? 'rgba(234, 88, 12, 0.8)'
      : this.connected
      ? 'rgba(45, 106, 79, 0.6)'
      : 'rgba(100, 116, 139, 0.4)';
    ctx.lineWidth = this.isNotifying ? 3 : 2;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Top Indicator Icon & Status ──
    ctx.font = '11px sans-serif';
    ctx.fillStyle = this.connected ? '#52b788' : '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.connected ? '🌿 BLE ACTIVE' : '○ SIMULATED', cx, cy - (r * 0.55));

    // ── Main Time Display (HH:MM) ──
    ctx.font = 'bold 32px "Inter", "Segoe UI", sans-serif';
    ctx.fillStyle = this.isNotifying ? '#fed7aa' : '#ffffff';
    ctx.shadowColor = this.isNotifying ? 'rgba(249, 115, 22, 0.8)' : 'rgba(82, 183, 136, 0.6)';
    ctx.shadowBlur = this.isNotifying ? 14 : 8;
    ctx.fillText(this.timeStr, cx, cy - 6);
    ctx.shadowBlur = 0;

    // ── Seconds & Heart Rate Pill ──
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`:${this.secStr}  •  ${this.heartRate} BPM`, cx, cy + 18);

    // ── Next Reminder Display ──
    ctx.font = '600 9.5px "Inter", sans-serif';
    ctx.fillStyle = this.isNotifying ? '#fdba74' : '#a7f3d0';
    const cleanReminder = this.nextReminder.length > 24
      ? this.nextReminder.slice(0, 22) + '...'
      : this.nextReminder;
    ctx.fillText(cleanReminder, cx, cy + (r * 0.52));

    ctx.restore();

    this.animationFrame = requestAnimationFrame(this.render);
  }
}
